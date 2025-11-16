import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    await connectDB()

    const exists = await User.findOne({ email })
    if (exists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashed,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}
