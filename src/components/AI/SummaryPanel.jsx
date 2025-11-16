'use client'
import { useState } from 'react'

export default function SummaryPanel({ brand }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generateSummary() {
    setLoading(true)
    const res = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand }),
    })
    const data = await res.json()
    setSummary(data.summary)
    setLoading(false)
  }

  return (
    <div className='p-4 border rounded mt-4'>
      <h2 className='font-semibold text-xl mb-3'>AI Sentiment Summary</h2>
      <button
        onClick={generateSummary}
        className='bg-purple-600 text-white px-4 py-2 rounded'
      >
        Generate AI Summary
      </button>

      {loading && <p className='mt-2 text-purple-600'>Generating summary…</p>}

      {summary && <p className='mt-4 whitespace-pre-line'>{summary}</p>}
    </div>
  )
}
