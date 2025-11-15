// import { NextResponse } from 'next/server'
// import connectDB from '@/lib/db'
// import Mention from '@/lib/models/mention'
// import { fetchRedditMentions, fetchNewsMentions } from '@/utils/fetchers'

// export async function POST(req) {
//   try {
//     await connectDB()

//     const body = await req.json()
//     const { brand } = body

//     if (!brand) {
//       return NextResponse.json({ error: 'Brand is required' }, { status: 400 })
//     }

//     // 1. Fetch from sources
//     const reddit = await fetchRedditMentions(brand)
//     const news = await fetchNewsMentions(brand)

//     const combinedMentions = [...reddit, ...news]

//     // 2. Save to MongoDB
//     const saved = await Mention.insertMany(combinedMentions)

//     return NextResponse.json({
//       message: 'Mentions fetched & stored successfully',
//       count: saved.length,
//       data: saved,
//     })
//   } catch (error) {
//     console.error('Mentions API Error:', error)
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Mention from '@/lib/models/mention'
import { getSentiment } from '@/utils/analyzeSentiment'

import {
  fetchRedditMentions,
  fetchNewsMentions,
  fetchHackerNewsMentions,
  fetchGitHubMentions,
  fetchYouTubeMentions,
} from '@/utils/fetchers'

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()
    const { brand } = body

    if (!brand || brand.trim() === '') {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // --- Fetch from ALL sources in parallel ---
    const [reddit, news, hackernews, github, youtube] = await Promise.all([
      fetchRedditMentions(brand),
      fetchNewsMentions(brand),
      fetchHackerNewsMentions(brand),
      fetchGitHubMentions(brand),
      fetchYouTubeMentions(brand),
    ])

    // Merge all results
    const combinedMentions = [
      ...reddit,
      ...news,
      ...hackernews,
      ...github,
      ...youtube,
    ]

    if (combinedMentions.length === 0) {
      return NextResponse.json(
        { message: 'No mentions found', data: [] },
        { status: 200 }
      )
    }

    // ⭐ Add Sentiment Analysis to Each Mention
    const mentionsWithSentiment = combinedMentions.map((item) => {
      const sentiment = getSentiment(item.text)

      return {
        ...item,
        sentiment: sentiment.label,
        score: sentiment.score,
      }
    })

    // 3. Save the updated array
    const savedData = await Mention.insertMany(mentionsWithSentiment)

    return NextResponse.json(
      {
        message: 'Mentions fetched & stored successfully',
        total: savedData.length,
        sources: {
          reddit: reddit.length,
          news: news.length,
          hackernews: hackernews.length,
          github: github.length,
          youtube: youtube.length,
        },
        data: savedData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Mentions API Error:', error)
    return NextResponse.json(
      { error: 'Server Error. Please check the logs.' },
      { status: 500 }
    )
  }
}
