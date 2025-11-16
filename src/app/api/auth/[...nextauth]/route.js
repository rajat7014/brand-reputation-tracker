export const runtime = 'nodejs' // ⭐ REQUIRED FOR NEXTAUTH TO WORK

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import User from '@/lib/models/user'
import connectDB from '@/lib/db'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        await connectDB()

        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login', // ⭐ Prevents unwanted HTML returning from API
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
