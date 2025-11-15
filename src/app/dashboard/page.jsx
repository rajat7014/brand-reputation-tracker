// 'use client'

// import { useState, useEffect, useRef } from 'react'

// export default function Dashboard() {
//   const [brand, setBrand] = useState('')
//   const [customBrand, setCustomBrand] = useState('')

//   const [clusters, setClusters] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [step, setStep] = useState('')

//   // ---- Step 1: Fetch & Store Mentions ----
//   async function fetchMentions(selectedBrand) {
//     setStep('mentions')
//     const res = await fetch('/api/mentions', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ brand: selectedBrand }),
//     })
//     return res.json()
//   }

//   // ---- Step 2: Fetch Topic Clusters ----
//   async function loadTopics(selectedBrand) {
//     setStep('topics')
//     const res = await fetch('/api/topics', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ brand: selectedBrand }),
//     })
//     const data = await res.json()
//     setClusters(data.clusters || [])
//   }

//   // ---- FULL PROCESS HANDLER ----
//   async function handleTrackBrand() {
//     const selectedBrand = customBrand.trim() || brand

//     if (!selectedBrand) {
//       alert('Please select or enter a brand.')
//       return
//     }

//     setLoading(true)
//     setClusters([])

//     // Step 1: Fetch mentions
//     await fetchMentions(selectedBrand)

//     // Step 2: Generate topics
//     await loadTopics(selectedBrand)

//     setLoading(false)
//   }

//   return (
//     <div className='p-8 space-y-10'>
//       <h1 className='text-4xl font-bold'>Brand Insight Dashboard</h1>

//       {/* ---------------- BRAND SELECTION AREA ---------------- */}
//       <div className='p-5 border rounded-xl bg-gray-800 space-y-4'>
//         {/* Common Brand Dropdown */}
//         <select
//           value={brand}
//           onChange={(e) => setBrand(e.target.value)}
//           className='border p-2 rounded w-full text-black'
//         >
//           <option className='text-white' value=''>
//             Select a common brand
//           </option>
//           <option value='tesla'>Tesla</option>
//           <option value='rapido'>Rapido</option>
//           <option value='apple'>Apple</option>
//           <option value='zomato'>Zomato</option>
//           <option value='blinkit'>Blinkit</option>
//         </select>

//         {/* Custom Brand Input */}
//         <div>
//           <label className='font-medium'>Or Track Custom Brand:</label>
//           <input
//             placeholder='Enter any brand (e.g., Paytm, Mamaearth)'
//             value={customBrand}
//             onChange={(e) => setCustomBrand(e.target.value)}
//             className='border p-2 rounded w-full mt-1'
//           />
//         </div>

//         {/* Track Brand Button */}
//         <button
//           onClick={handleTrackBrand}
//           className='bg-blue-700 text-white px-4 py-2 rounded w-full'
//         >
//           Track Brand
//         </button>
//       </div>

//       {/* ---------------- PROCESS STATUS ---------------- */}
//       {loading && step === 'mentions' && (
//         <p className='text-lg text-blue-600'>Fetching brand mentions…</p>
//       )}

//       {loading && step === 'topics' && (
//         <p className='text-lg text-green-600'>Generating topic clusters…</p>
//       )}

//       {/* ---------------- CLUSTER RESULTS ---------------- */}
//       {!loading && clusters.length === 0 && (
//         <p className='text-gray-600'>No clusters available yet.</p>
//       )}

//       {!loading && clusters.length > 0 && (
//         <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
//           {clusters.map((c) => (
//             <TopicCard
//               key={c.clusterId}
//               cluster={c}
//               reload={() => loadTopics(brand || customBrand)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// /* ---------------------- Topic Card Component ---------------------- */

// function TopicCard({ cluster, reload }) {
//   return (
//     <div className='p-6 rounded-xl border bg-white shadow hover:shadow-md transition'>
//       <h2 className='text-2xl font-semibold mb-3'>{cluster.label}</h2>

//       <p className='text-gray-700 mb-2'>
//         Mentions in topic: <b>{cluster.count}</b>
//       </p>

//       {/* Word Cloud */}
//       <TopicWordCloud words={cluster.words} />

//       <button
//         onClick={reload}
//         className='mt-4 bg-blue-600 text-white px-4 py-2 rounded'
//       >
//         Refresh Topics
//       </button>
//     </div>
//   )
// }

// /* ---------------------- WordCloud Component ---------------------- */

// function TopicWordCloud({ words }) {
//   const canvasRef = useRef(null)

//   useEffect(() => {
//     if (!words || words.length === 0) return

//     async function renderCloud() {
//       const WordCloud = (await import('wordcloud')).default

//       const wordList = words.map((w) => [
//         w,
//         Math.floor(Math.random() * 40) + 15,
//       ])

//       WordCloud(canvasRef.current, {
//         list: wordList,
//         weightFactor: 2,
//         rotateRatio: 0.4,
//         rotationSteps: 2,
//         backgroundColor: '#ffffff',
//         color: () => '#' + Math.floor(Math.random() * 16777215).toString(16),
//       })
//     }

//     renderCloud()
//   }, [words])

//   return (
//     <canvas
//       ref={canvasRef}
//       width={400}
//       height={250}
//       className='border rounded'
//     />
//   )
// }

// === Advanced Dashboard (Phase 5) — Replace your entire dashboard/page.jsx ===

'use client'
import { useEffect, useState, useRef } from 'react'
import SentimentCharts from '@/components/Charts/SentimentCharts'
import Feed from '@/components/Mentions/Feed'

export default function DashboardPage() {
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
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder='Enter brand (e.g. Apple)'
            className='px-3 py-2 border rounded'
          />

          {/* <button
            onClick={() => {
              fetchClusters()
              checkSpike()
              setFilters((f) => ({ ...f, q: brand }))
            }}
            className='px-3 py-2 bg-blue-600 text-white rounded'
          >
            Monitor
          </button> */}

          <button
            onClick={async () => {
              if (!brand.trim()) {
                alert('Please enter a brand.')
                return
              }

              // 1️⃣ Fetch mentions from all sources
              await fetch('/api/mentions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brand }),
              })

              // 2️⃣ Refresh topic clusters
              await fetchClusters()

              // 3️⃣ Refresh spike alerts
              await checkSpike()

              // 4️⃣ Apply filters for sentiment charts + feed component
              setFilters((f) => ({ ...f, q: brand }))
            }}
            className='px-3 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors'
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

      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
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
                      setFilters((f) => ({ ...f, topic: c.label || c.topic }))
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
          {/* <div className='p-4 border rounded mb-4'>
            <h4 className='font-semibold'>Spike Alerts</h4>
            {spikeInfo ? (
              <div className='mt-2'>
                <div>
                  Recent count: <b>{spikeInfo.recentCount}</b>
                </div>
                <div>
                  Historic rate/min:{' '}
                  <b>{spikeInfo.historicRatePerMinute.toFixed(2)}</b>
                </div>
                <div>
                  Ratio: <b>{spikeInfo.ratio.toFixed(2)}</b>
                </div>
                <div
                  className={`mt-2 ${
                    spikeInfo.isSpike
                      ? 'text-red-600 font-bold'
                      : 'text-green-600'
                  }`}
                >
                  {spikeInfo.isSpike ? 'Spike detected' : 'No spike'}
                </div>
              </div>
            ) : (
              <div className='opacity-75'>No spike data. Click Monitor.</div>
            )}
          </div> */}
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
                  Ratio:
                  <b>{spikeInfo?.ratio?.toFixed?.(2) ?? '0.00'}</b>
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
              {/* SENTIMENT FILTER */}
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

              {/* SOURCE FILTER – FIXED HERE */}
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
                className='w-full mt-2 p-2 bg-blue-600 text-white rounded cursor-pointer hover:to-blue-800'
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
