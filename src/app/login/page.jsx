'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (!res.error) {
      router.push('/dashboard')
    } else {
      alert('Invalid email or password')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6'>
      <div className='w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl'>
        <h1 className='text-3xl font-bold text-white text-center mb-6'>
          Brand Reputation Tracker
        </h1>
        <p className='text-gray-300 text-center mb-8'>Login</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email'
            placeholder='Email Address'
            className='w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500'
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type='password'
            placeholder='Password'
            className='w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500'
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className='w-full bg-blue-600 hover:bg-blue-700 transition font-medium text-white py-3 rounded-xl shadow-lg'>
            Login
          </button>
        </form>

        <p className='text-gray-300 text-center mt-6'>
          Don’t have an account?{' '}
          <a href='/register' className='text-blue-400 hover:underline'>
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
