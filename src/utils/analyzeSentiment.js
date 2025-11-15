import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export function getSentiment(text) {
  const result = sentiment.analyze(text)

  let label = 'neutral'
  if (result.score > 0) label = 'positive'
  else if (result.score < 0) label = 'negative'

  return {
    label,
    score: result.score,
  }
}
