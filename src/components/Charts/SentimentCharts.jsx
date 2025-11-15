'use client'
import { Pie } from 'react-chartjs-2'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'
import { useEffect, useState } from 'react'

export default function SentimentCharts({ brand }) {
  const [summary, setSummary] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  })
  const [trend, setTrend] = useState([])

  async function loadSummary() {
    const res = await fetch(
      `/api/mentions/get?limit=500&q=${encodeURIComponent(brand || '')}`
    )
    const json = await res.json()
    const data = json.data || []
    const pos = data.filter((d) => d.sentiment === 'positive').length
    const neg = data.filter((d) => d.sentiment === 'negative').length
    const neu = data.filter((d) => d.sentiment === 'neutral').length
    setSummary({ positive: pos, neutral: neu, negative: neg })

    // build simple trend by grouping into 6 time buckets
    const now = Date.now()
    const buckets = Array.from({ length: 6 }, () => ({
      positive: 0,
      negative: 0,
      neutral: 0,
    }))
    data.forEach((m) => {
      const age = now - new Date(m.createdAt).getTime()
      const idx = Math.min(5, Math.floor((age / (1000 * 60 * 60)) * 6))
      if (m.sentiment === 'positive') buckets[idx].positive++
      else if (m.sentiment === 'negative') buckets[idx].negative++
      else buckets[idx].neutral++
    })
    setTrend(buckets.reverse())
  }

  useEffect(() => {
    let active = true

    ;(async () => {
      await loadSummary() // safe (setState inside async function)
    })()

    return () => {
      active = false
    }
  }, [brand])

  const pieData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [summary.positive, summary.neutral, summary.negative],
      },
    ],
  }

  const lineData = {
    labels: trend.map((_, i) => `T-${i}`),
    datasets: [
      { label: 'Positive', data: trend.map((t) => t.positive), fill: false },
      { label: 'Neutral', data: trend.map((t) => t.neutral), fill: false },
      { label: 'Negative', data: trend.map((t) => t.negative), fill: false },
    ],
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div className='p-4 border rounded'>
        <h3 className='font-semibold mb-2'>Sentiment Distribution</h3>
        <Pie data={pieData} />
      </div>

      <div className='p-4 border rounded'>
        <h3 className='font-semibold mb-2'>Sentiment Trend</h3>
        <Line data={lineData} />
      </div>
    </div>
  )
}
