import mongoose from 'mongoose'

const mentionSchema = new mongoose.Schema(
  {
    source: String,
    text: String,
    timestamp: Date,
    url: String,
    sentiment: String,
    score: Number,
    topic: String,
  },
  { timestamps: true }
)

export default mongoose.models.Mention ||
  mongoose.model('Mention', mentionSchema)
