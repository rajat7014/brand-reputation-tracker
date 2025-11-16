'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  async function handleSubmit(e) {
    e.preventDefault()

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (data.success) {
      router.push('/login')
    } else {
      alert(data.error || 'Error registering user')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6'>
      <div className='w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl'>
        <h1 className='text-3xl font-bold text-white text-center mb-6'>
          Create Account
        </h1>
        <p className='text-gray-300 text-center mb-8'>
          Join us and access your dashboard
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            placeholder='Full Name'
            className='w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-500'
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type='email'
            placeholder='Email Address'
            className='w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-500'
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type='password'
            placeholder='Password'
            className='w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-green-500'
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className='w-full bg-green-600 hover:bg-green-700 transition font-medium text-white py-3 rounded-xl shadow-lg'>
            Create Account
          </button>
        </form>

        <p className='text-gray-300 text-center mt-6'>
          Already registered?{' '}
          <a href='/login' className='text-blue-400 hover:underline'>
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
