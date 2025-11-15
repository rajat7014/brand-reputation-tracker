// import { pipeline } from '@xenova/transformers'

// let embedder = null

// // Lazy-load the model (loads only once)
// async function loadEmbedder() {
//   if (!embedder) {
//     embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
//   }
//   return embedder
// }

// export async function getEmbedding(text) {
//   if (!text || text.trim() === '') return []

//   const extractor = await loadEmbedder()

//   const output = await extractor(text, { pooling: 'mean', normalize: true })

//   return Array.from(output.data)
// }

// export async function getEmbeddingsBulk(texts = []) {
//   const extractor = await loadEmbedder()

//   const results = await extractor(texts, { pooling: 'mean', normalize: true })

//   return results.map((res) => Array.from(res.data))
// }

import { pipeline } from '@xenova/transformers'

let embedder = null

async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  return embedder
}

export async function getEmbedding(text) {
  if (!text || !text.trim()) return []

  const extractor = await loadEmbedder()
  const output = await extractor(text, { pooling: 'mean', normalize: true })

  return Array.from(output.data)
}

// ⭐ FIXED: Embed texts one by one
export async function getEmbeddingsBulk(texts = []) {
  if (!Array.isArray(texts) || texts.length === 0) return []

  const extractor = await loadEmbedder()

  const vectors = []
  for (const t of texts) {
    const out = await extractor(t, { pooling: 'mean', normalize: true })

    vectors.push(Array.from(out.data))
  }

  return vectors // 2D array
}
