// === DashboardPage with AI Summary + Auth Protection + PDF Export ===
'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import SentimentCharts from '@/components/Charts/SentimentCharts'
import Feed from '@/components/Mentions/Feed'
import SummaryPanel from '@/components/AI/SummaryPanel'
import { signOut } from 'next-auth/react'
export default function DashboardPage() {
  const { data: session } = useSession()

  // --- AUTH PROTECTION ---
  if (!session) redirect('/login')

  const [brand, setBrand] = useState('')
  const [filters, setFilters] = useState({})
  const [clusters, setClusters] = useState([])
  const [spikeInfo, setSpikeInfo] = useState(null)
  const [useSSE, setUseSSE] = useState(false)
  const eventSourceRef = useRef(null)

  async function fetchClusters() {
    const res = await fetch('/api/topics', { method: 'POST' })
    const json = await res.json()
    setClusters(json.clusters || json.clusterSummary || [])
  }

  async function checkSpike() {
    const res = await fetch('/api/spikes', {
      method: 'POST',
      body: JSON.stringify({ brand }),
    })
    const json = await res.json()
    setSpikeInfo(json)
  }

  useEffect(() => {
    ;(async () => {
      await fetchClusters()
    })()
  }, [])

  useEffect(() => {
    if (useSSE && typeof window !== 'undefined') {
      if (eventSourceRef.current) eventSourceRef.current.close()
      const es = new EventSource('/api/stream')
      eventSourceRef.current = es
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'snapshot') {
            fetchClusters()
            setFilters((f) => ({ ...f }))
          }
        } catch (e) {}
      }
      return () => es.close()
    }
  }, [useSSE])

  return (
    <div className='p-6'>
      <header className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Brand Reputation Tracker</h1>

        <div className='flex gap-3 items-center'>
          <span className='mr-4 text-gray-700 font-medium'>
            Logged in as: {session?.user?.email}
          </span>

          {/* 🔥 LOGOUT BUTTON */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className='px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Logout
          </button>

          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder='Enter brand (e.g. Apple)'
            className='px-3 py-2 border rounded'
          />

          <button
            onClick={async () => {
              if (!brand.trim()) return alert('Please enter a brand.')

              await fetch('/api/mentions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brand }),
              })

              await fetchClusters()
              await checkSpike()
              setFilters((f) => ({ ...f, q: brand }))
            }}
            className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Monitor
          </button>

          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={useSSE}
              onChange={(e) => setUseSSE(e.target.checked)}
            />
            Use SSE
          </label>
        </div>
      </header>

      {/* AI Sentiment Summary Panel */}
      <SummaryPanel brand={brand} />

      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 mt-6'>
        <div className='col-span-2'>
          <SentimentCharts brand={brand} />

          <div className='mt-6'>
            <h3 className='font-semibold mb-2'>Topic Clusters</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {clusters.map((c, i) => (
                <div key={i} className='p-4 border rounded'>
                  <div className='font-semibold'>
                    {c.label || c.topic || 'General'}
                  </div>
                  <div className='text-sm opacity-75'>{c.count} mentions</div>
                  <button
                    className='mt-2 text-sm text-blue-600'
                    onClick={() =>
                      setFilters((f) => ({ ...f, topic: c.label }))
                    }
                  >
                    Filter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className='p-4 border rounded mb-4'>
            <h4 className='font-semibold'>Spike Alerts</h4>

            {spikeInfo ? (
              <div className='mt-2'>
                <div>
                  Recent count: <b>{spikeInfo?.recentCount ?? 0}</b>
                </div>

                <div>
                  Historic rate/min:
                  <b>
                    {spikeInfo?.historicRatePerMinute?.toFixed?.(2) ?? '0.00'}
                  </b>
                </div>

                <div>
                  Ratio: <b>{spikeInfo?.ratio?.toFixed?.(2) ?? '0.00'}</b>
                </div>

                <div
                  className={`mt-2 ${
                    spikeInfo?.isSpike
                      ? 'text-red-600 font-bold'
                      : 'text-green-600'
                  }`}
                >
                  {spikeInfo?.isSpike ? 'Spike detected' : 'No spike'}
                </div>
              </div>
            ) : (
              <div className='opacity-75'>No spike data. Click Monitor.</div>
            )}
          </div>

          <div className='p-4 border rounded'>
            <h4 className='font-semibold'>Filters</h4>
            <div className='mt-2 space-y-2'>
              <select
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sentiment: e.target.value }))
                }
                className='w-full p-2 border rounded'
              >
                <option value=''>All sentiments</option>
                <option value='positive'>Positive</option>
                <option value='neutral'>Neutral</option>
                <option value='negative'>Negative</option>
              </select>

              <select
                onChange={(e) =>
                  setFilters((f) => ({ ...f, source: e.target.value }))
                }
                className='w-full p-2 border rounded'
              >
                <option value=''>All sources</option>
                <option value='reddit'>Reddit</option>
                <option value='news'>News</option>
                <option value='hackernews'>Hacker News</option>
                <option value='github'>GitHub</option>
                <option value='youtube'>YouTube</option>
              </select>

              <button
                onClick={() => setFilters((f) => ({ ...f }))}
                className='w-full mt-2 p-2 bg-blue-600 text-white rounded'
              >
                Apply
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <h3 className='font-semibold mb-3'>Mentions Feed</h3>
        <Feed filters={filters} />
      </section>
    </div>
  )
}
