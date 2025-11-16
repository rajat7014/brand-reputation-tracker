export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Mention from '@/lib/models/mention'
import { kmeans as mlKmeans } from 'ml-kmeans'
import { getEmbeddingsBulk } from '@/utils/embeddings'

// ---------- Extract Keywords ----------
function extractKeywords(text, topN = 50) {
  if (!text) return []

  let words = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter((w) => w.length > 3)

  const freq = {}
  for (let w of words) freq[w] = (freq[w] || 0) + 1

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0])
    .slice(0, topN)
}

// ---------- API Route ----------
export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json().catch(() => ({}))
    const requestedK = Number(body?.k) || 5
    const limit = Number(body?.limit) || 300

    // 1) Fetch mentions
    const mentions = await Mention.find({
      text: { $exists: true, $ne: '' },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    console.log('📌 Mentions Count:', mentions.length)

    if (!mentions.length) {
      return NextResponse.json(
        { message: 'No mentions found', clusters: [] },
        { status: 200 }
      )
    }

    const texts = mentions.map((m) => m.text)

    if (texts.length < 2) {
      return NextResponse.json(
        { message: 'Not enough data to cluster', clusters: [] },
        { status: 200 }
      )
    }

    // 2) Generate Embeddings
    const vectors = await getEmbeddingsBulk(texts)

    console.log('📌 Embedding vectors:', vectors.length)

    // ❗ FIX: Ensure vectors are valid (2D array)
    if (
      !vectors ||
      !Array.isArray(vectors) ||
      vectors.length < 2 ||
      !Array.isArray(vectors[0])
    ) {
      console.log('❌ Bad vectors:', vectors)
      return NextResponse.json(
        { message: 'Invalid embedding vectors', clusters: [] },
        { status: 200 }
      )
    }

    // 3) Ensure K is valid
    const k = Math.min(requestedK, vectors.length - 1)
    if (k < 1) {
      return NextResponse.json(
        { message: 'Invalid number of clusters', clusters: [] },
        { status: 200 }
      )
    }

    // 4) Run K-Means safely
    let clusters
    try {
      ;({ clusters } = mlKmeans(vectors, k, { seed: 42 }))
    } catch (e) {
      console.error('❌ KMeans Error:', e)
      return NextResponse.json(
        { message: 'KMeans failed', error: e.message },
        { status: 200 }
      )
    }

    // 5) Compute cluster words + labels
    const clusterWords = Array.from({ length: k }, () => [])
    const clusterCounts = Array.from({ length: k }, () => 0)

    texts.forEach((text, i) => {
      const cid = clusters[i]
      clusterCounts[cid]++
      clusterWords[cid].push(...extractKeywords(text))
    })

    const finalClusters = clusterWords.map((words, i) => {
      const freq = {}
      words.forEach((w) => (freq[w] = (freq[w] || 0) + 1))

      const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a])
      const label = sorted.slice(0, 2).join(' • ') || 'general'

      return {
        clusterId: i,
        label,
        count: clusterCounts[i],
        words: sorted.slice(0, 30),
      }
    })

    // Optional**: Save into DB
    const bulkOps = mentions.map((m, idx) => ({
      updateOne: {
        filter: { _id: m._id },
        update: { $set: { topic: finalClusters[clusters[idx]].label } },
      },
    }))

    await Mention.bulkWrite(bulkOps)

    return NextResponse.json(
      {
        message: 'Topic clustering completed',
        k,
        clusters: finalClusters,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Topic API Error:', err)
    return NextResponse.json(
      { error: 'Server error', detail: err.message },
      { status: 500 }
    )
  }
}
