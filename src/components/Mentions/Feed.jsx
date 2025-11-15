'use client'
import { useEffect, useState } from 'react'

export default function Feed({ filters }) {
  const [mentions, setMentions] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.sentiment) params.set('sentiment', filters.sentiment)
    if (filters.topic) params.set('topic', filters.topic)
    if (filters.source) params.set('source', filters.source)
    params.set('limit', filters.limit || 200)
    const res = await fetch(`/api/mentions/get?${params.toString()}`)
    const json = await res.json()
    setMentions(json.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [JSON.stringify(filters)])

  if (loading) return <div>Loading feed…</div>

  return (
    <div className='space-y-3'>
      {mentions.map((m) => (
        <div key={m._id} className='p-3 border rounded'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='text-sm opacity-75'>
                {m.source} • {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className='mt-1'>{m.text}</div>
            </div>
            <div className='text-right'>
              <div
                className={`px-2 py-1 rounded ${
                  m.sentiment === 'positive'
                    ? 'bg-green-100'
                    : m.sentiment === 'negative'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                {m.sentiment}
              </div>
              <a
                className='block mt-2 text-xs text-blue-600'
                href={m.url}
                target='_blank'
                rel='noreferrer'
              >
                View
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
