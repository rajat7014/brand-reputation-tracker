// // Server-Sent Events stream for live updates (mentions + spikes)
// import { NextResponse } from 'next/server'
// import connectDB from '@/lib/db'
// import Mention from '@/lib/models/mention'

// export async function GET(req) {
//   // simple SSE that emits a snapshot every 5 seconds
//   const stream = new ReadableStream({
//     async start(controller) {
//       await connectDB()

//       const sendSnapshot = async () => {
//         try {
//           const recent = await Mention.find()
//             .sort({ createdAt: -1 })
//             .limit(100)
//             .lean()
//           const payload = JSON.stringify({ type: 'snapshot', data: recent })
//           controller.enqueue(`data: ${payload}\n\n`)
//         } catch (err) {
//           console.error('SSE error', err)
//         }
//       }

//       // send initial
//       await sendSnapshot()

//       const id = setInterval(sendSnapshot, 5000)

//       // cleanup when closed
//       controller.onCancel = () => clearInterval(id)
//     },
//   })

//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       Connection: 'keep-alive',
//     },
//   })
// }

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Mention from '@/lib/models/mention'

export async function GET(req) {
  await connectDB()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendSnapshot = async () => {
        try {
          const recent = await Mention.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .lean()

          const payload = JSON.stringify({
            type: 'snapshot',
            data: recent,
          })

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
        } catch (err) {
          console.error('SSE error', err)
        }
      }

      // initial snapshot
      await sendSnapshot()

      // send every 5 seconds
      const intervalId = setInterval(sendSnapshot, 5000)

      // cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        console.log('Client disconnected. Closing SSE...')
        clearInterval(intervalId)
        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
