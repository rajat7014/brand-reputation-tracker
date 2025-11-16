import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import User from '@/lib/models/user'
import connectDB from '@/lib/db'
import bcrypt from 'bcryptjs'

const authHandler = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
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
          id: user._id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export { authHandler as GET, authHandler as POST }
