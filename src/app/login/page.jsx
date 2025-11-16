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
    <div className='p-6 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Login</h1>

      <form onSubmit={handleSubmit} className='space-y-3'>
        <input
          type='email'
          placeholder='Email'
          className='border p-2 w-full'
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type='password'
          placeholder='Password'
          className='border p-2 w-full'
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className='bg-blue-600 text-white px-4 py-2 rounded w-full'>
          Login
        </button>
      </form>

      <p className='mt-3'>
        No account?{' '}
        <a href='/register' className='text-blue-500'>
          Register
        </a>
      </p>
    </div>
  )
}
