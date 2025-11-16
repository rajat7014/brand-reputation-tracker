'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

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
    <div className='p-6 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Register</h1>

      <form onSubmit={handleSubmit} className='space-y-3'>
        <input
          placeholder='Name'
          className='border p-2 w-full'
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type='email'
          placeholder='Email'
          className='border p-2 w-full'
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type='password'
          placeholder='Password'
          className='border p-2 w-full'
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className='bg-green-600 text-white px-4 py-2 rounded w-full'>
          Register
        </button>
      </form>

      <p className='mt-3'>
        Already have an account?{' '}
        <a href='/login' className='text-blue-500'>
          Login
        </a>
      </p>
    </div>
  )
}
