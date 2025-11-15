import { NextResponse } from 'next/server'
import { getSentiment } from '@/utils/analyzeSentiment'

export async function POST(req) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  const result = getSentiment(text)

  return NextResponse.json({
    text,
    sentiment: result.label,
    score: result.score,
  })
}
