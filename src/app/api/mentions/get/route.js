import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Mention from '@/lib/models/mention'

export async function GET(req) {
  try {
    await connectDB()
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const sentiment = url.searchParams.get('sentiment') || ''
    const topic = url.searchParams.get('topic') || ''
    const source = url.searchParams.get('source') || ''
    const limit = Number(url.searchParams.get('limit') || 100)

    const query = {}
    if (q) query.text = { $regex: q, $options: 'i' }
    if (sentiment) query.sentiment = sentiment
    if (topic) query.topic = topic
    if (source) query.source = source

    const mentions = await Mention.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 1000))
      .lean()

    return NextResponse.json({ count: mentions.length, data: mentions })
  } catch (err) {
    console.error('Get Mentions error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
