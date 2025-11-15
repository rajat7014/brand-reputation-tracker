import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is missing in .env.local')
}

// Global cache to prevent re-connecting on hot reloads (Next.js feature)
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function connectDB() {
  // If already connected → return existing connection
  if (cached.conn) {
    console.log('⚡ Using existing MongoDB connection')
    return cached.conn
  }

  // If not connected → create a new connection
  if (!cached.promise) {
    console.log('⏳ Connecting to MongoDB...')

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully')
        return mongoose
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err)
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
