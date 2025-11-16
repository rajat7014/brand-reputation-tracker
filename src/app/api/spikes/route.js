// import { NextResponse } from 'next/server'
// import connectDB from '@/lib/db'
// import Mention from '@/lib/models/mention'

// // Basic spike detection: compare last N minutes count to historical average
// export async function POST(req) {
//   try {
//     await connectDB()
//     const body = await req.json().catch(() => ({}))
//     const brand = body.brand || body.q || ''
//     const windowMinutes = Number(body.windowMinutes) || 30 // last X minutes
//     const lookbackHours = Number(body.lookbackHours) || 6 // historical span

//     const now = new Date()
//     const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)
//     const lookbackStart = new Date(
//       now.getTime() - lookbackHours * 60 * 60 * 1000
//     )

//     const queryRecent = { createdAt: { $gte: windowStart } }
//     const queryHistoric = {
//       createdAt: { $gte: lookbackStart, $lt: windowStart },
//     }

//     if (brand) {
//       queryRecent.text = { $regex: brand, $options: 'i' }
//       queryHistoric.text = { $regex: brand, $options: 'i' }
//     }

//     const recentCount = await Mention.countDocuments(queryRecent)
//     const historicCount = await Mention.countDocuments(queryHistoric)

//     const historicMinutes = lookbackHours * 60 - windowMinutes
//     const historicRatePerMinute =
//       historicMinutes > 0 ? historicCount / historicMinutes : 0
//     const recentRatePerMinute = recentCount / Math.max(1, windowMinutes)

//     // spike if recent rate > 3x historic rate OR recent absolute threshold
//     const ratio =
//       historicRatePerMinute > 0
//         ? recentRatePerMinute / historicRatePerMinute
//         : Infinity
//     const isSpike = ratio >= 3 || recentCount >= 50 // tweak thresholds as needed

//     const result = {
//       recentCount,
//       historicCount,
//       recentRatePerMinute,
//       historicRatePerMinute,
//       ratio,
//       isSpike,
//       windowMinutes,
//       lookbackHours,
//     }

//     return NextResponse.json(result)
//   } catch (err) {
//     console.error('Spike API error', err)
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Mention from '@/lib/models/mention'

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json().catch(() => ({}))

    const brand = body.brand || body.q || ''
    const windowMinutes = Number(body.windowMinutes) || 30 // last 30 minutes
    const lookbackHours = Number(body.lookbackHours) || 6 // last 6 hours

    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)
    const lookbackStart = new Date(
      now.getTime() - lookbackHours * 60 * 60 * 1000
    )

    const queryRecent = { createdAt: { $gte: windowStart } }
    const queryHistoric = {
      createdAt: { $gte: lookbackStart, $lt: windowStart },
    }

    if (brand) {
      queryRecent.text = { $regex: brand, $options: 'i' }
      queryHistoric.text = { $regex: brand, $options: 'i' }
    }

    const recentCount = await Mention.countDocuments(queryRecent)
    const historicCount = await Mention.countDocuments(queryHistoric)

    const historicMinutes = lookbackHours * 60 - windowMinutes
    const historicRatePerMinute =
      historicMinutes > 0 ? historicCount / historicMinutes : 0

    const recentRatePerMinute = recentCount / Math.max(1, windowMinutes)

    let ratio = 0
    if (historicRatePerMinute > 0) {
      ratio = recentRatePerMinute / historicRatePerMinute
    }

    // ---------------------------
    // FINAL SPIKE LOGIC (NO FALSE ALERTS)
    // ---------------------------
    let isSpike = false

    if (recentCount >= 5) {
      // Must have at least 5 mentions
      if (historicRatePerMinute >= 0.5) {
        // Baseline must be meaningful
        if (ratio >= 2) {
          // At least 2x jump
          isSpike = true
        }
      }
    }

    return NextResponse.json({
      recentCount,
      historicCount,
      recentRatePerMinute,
      historicRatePerMinute,
      ratio,
      isSpike,
      windowMinutes,
      lookbackHours,
    })
  } catch (err) {
    console.error('Spike API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
