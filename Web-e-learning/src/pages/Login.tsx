// src/pages/Login.tsx
import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PasswordInput from '@/components/PasswordInput'
import { Loader2, LogIn } from 'lucide-react'

interface LocationState {
  from?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const state = loc.state as LocationState | null
  const from = state?.from || '/'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await login(email, password)
      nav(from, { replace: true })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-md mx-auto">
      <h2 className="text-2xl font-display font-bold mb-6 text-center">Вхід</h2>
      
      <label className="block mb-2 text-sm font-medium">Email</label>
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        type="email" 
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" 
        placeholder="your@email.com"
        required
        disabled={loading}
      />
      
      <label className="block mt-4 mb-2 text-sm font-medium">Пароль</label>
      <PasswordInput 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="••••••••"
        required
        disabled={loading}
      />
      
      <button 
        type="submit" 
        className="btn mt-6 w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Вхід...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Увійти
          </>
        )}
      </button>
      
      {err && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>
        </div>
      )}
      
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Немає акаунту?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Зареєструватися
        </Link>
      </p>
    </form>
  )
}
