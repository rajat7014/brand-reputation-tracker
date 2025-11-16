export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import Mention from '@/lib/models/mention'
import connectDB from '@/lib/db'

export async function POST(req) {
  try {
    const { brand } = await req.json()

    if (!brand) {
      return NextResponse.json({ error: 'Brand is required' }, { status: 400 })
    }

    await connectDB()

    const mentions = await Mention.find({
      text: { $regex: brand, $options: 'i' },
    }).limit(80)

    if (!mentions.length) {
      return NextResponse.json({
        summary: 'No mentions found for this brand.',
      })
    }

    const textData = mentions.map((m) => m.text).join('\n')

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY' },
        { status: 500 }
      )
    }

    // ==== USE SAME WORKING MODEL AS PIZZA HUB ====
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `
Summarize brand conversations.

Brand: ${brand}

Mentions:
${textData}

Return:
- Overall sentiment (positive/neutral/negative)
- Key themes
- Risks
- Opportunities
- A short readable summary
                `,
                },
              ],
            },
          ],
        }),
      }
    )

    const dataText = await response.text()
    let data = {}

    try {
      data = JSON.parse(dataText)
    } catch {
      console.error('Invalid Gemini JSON:', dataText)
      return NextResponse.json(
        { error: 'Invalid response from Gemini API' },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 500 })
    }

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'AI could not generate summary.'

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('AI Summary Error:', err)
    return NextResponse.json(
      { error: 'AI Summary failed', details: String(err) },
      { status: 500 }
    )
  }
}
