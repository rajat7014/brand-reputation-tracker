// import axios from 'axios'

// // 1️⃣ Fetch from Reddit API
// export async function fetchRedditMentions(brand) {
//   try {
//     const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
//       brand
//     )}&limit=10`
//     const response = await axios.get(url)

//     const posts = response.data.data.children.map((post) => ({
//       source: 'reddit',
//       text: post.data.title,
//       url: `https://reddit.com${post.data.permalink}`,
//       timestamp: new Date(post.data.created_utc * 1000),
//     }))

//     return posts
//   } catch (error) {
//     console.error('Reddit Fetch Error:', error)
//     return []
//   }
// }

// // 2️⃣ Fetch from News API (use newsdata.io free API or any other news API)
// export async function fetchNewsMentions(brand) {
//   try {
//     const API_KEY = process.env.NEWS_API_KEY
//     const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(
//       brand
//     )}`

//     const response = await axios.get(url)

//     const articles = response.data.results?.map((news) => ({
//       source: 'news',
//       text: news.title || '',
//       url: news.link || '',
//       timestamp: new Date(news.pubDate),
//     }))

//     return articles || []
//   } catch (error) {
//     console.error('News Fetch Error:', error)
//     return []
//   }
// }

import axios from 'axios'

// -----------------------------------------
// 1️⃣ Reddit Mentions (Free)
// -----------------------------------------
export async function fetchRedditMentions(brand) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
      brand
    )}&limit=10`

    const response = await axios.get(url)

    return response.data.data.children.map((post) => ({
      source: 'reddit',
      text: post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      timestamp: new Date(post.data.created_utc * 1000),
    }))
  } catch (error) {
    console.error('Reddit Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// 2️⃣ NewsData.io (Free API Key Required)
// -----------------------------------------
export async function fetchNewsMentions(brand) {
  try {
    const API_KEY = process.env.NEWS_API_KEY

    const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(
      brand
    )}`

    const response = await axios.get(url)

    return (
      response.data.results?.map((news) => ({
        source: 'news',
        text: news.title || '',
        url: news.link || '',
        timestamp: new Date(news.pubDate),
      })) || []
    )
  } catch (error) {
    console.error('News Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// 3️⃣ Hacker News (Free)
// -----------------------------------------
export async function fetchHackerNewsMentions(brand) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
      brand
    )}`

    const response = await axios.get(url)

    return response.data.hits.map((post) => ({
      source: 'hackernews',
      text: post.title,
      url: post.url || `https://news.ycombinator.com/item?id=${post.objectID}`,
      timestamp: new Date(post.created_at),
    }))
  } catch (error) {
    console.error('HN Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// 4️⃣ GitHub Repo/Issue Mentions (Free)
// -----------------------------------------
export async function fetchGitHubMentions(brand) {
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
      brand
    )}&per_page=10`

    const response = await axios.get(url)

    return response.data.items.map((issue) => ({
      source: 'github',
      text: issue.title,
      url: issue.html_url,
      timestamp: new Date(issue.created_at),
    }))
  } catch (error) {
    console.error('GitHub Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// 5️⃣ RSS Feed (Free)
// -----------------------------------------
// Example RSS Parser using a public RSS2JSON API
export async function fetchRssMentions(rssUrl) {
  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
      rssUrl
    )}`

    const response = await axios.get(url)

    return response.data.items.map((item) => ({
      source: 'rss',
      text: item.title,
      url: item.link,
      timestamp: new Date(item.pubDate),
    }))
  } catch (error) {
    console.error('RSS Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// 6️⃣ YouTube Mentions (Free API Key Required)
// -----------------------------------------
export async function fetchYouTubeMentions(brand) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY

    const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
      brand
    )}&key=${API_KEY}`

    const response = await axios.get(url)

    return response.data.items.map((video) => ({
      source: 'youtube',
      text: video.snippet.title,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      timestamp: new Date(video.snippet.publishedAt),
    }))
  } catch (error) {
    console.error('YouTube Fetch Error:', error)
    return []
  }
}

// -----------------------------------------
// Final Export: Fetch from All Sources
// -----------------------------------------
export async function fetchAllBrandMentions(brand) {
  const results = await Promise.all([
    fetchRedditMentions(brand),
    fetchNewsMentions(brand),
    fetchHackerNewsMentions(brand),
    fetchGitHubMentions(brand),
    fetchYouTubeMentions(brand),
  ])

  return results.flat().sort((a, b) => b.timestamp - a.timestamp)
}
