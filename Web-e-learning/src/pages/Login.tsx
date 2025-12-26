// src/pages/Login.tsx
import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PasswordInput from '@/components/PasswordInput'
import LanguageSelector from '@/components/LanguageSelector'
import { useTranslation } from '@/i18n/useTranslation'
import { Loader2, LogIn } from 'lucide-react'

interface LocationState {
  from?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
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
    <div className="h-screen flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Top bar with logo and language selector */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-display font-bold text-lg">E</span>
          </div>
          <span className="font-display font-semibold text-xl text-neutral-900 dark:text-white">E-Learn</span>
        </div>
        <LanguageSelector />
      </div>
      
      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-4 -mt-16">
        <form onSubmit={onSubmit} className="card max-w-md w-full shadow-xl">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">{t('auth.login')}</h2>
          
          <label className="block mb-2 text-sm font-medium">{t('profile.email')}</label>
          <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            type="email" 
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" 
            placeholder="your@email.com"
            required
            disabled={loading}
          />
          
          <label className="block mt-4 mb-2 text-sm font-medium">{t('auth.password')}</label>
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
                {t('common.loading')}
              </>
            ) : (
              <>
                <LogIn size={18} />
                {t('auth.signIn')}
              </>
            )}
          </button>
          
          {err && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>
            </div>
          )}
          
          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('nav.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
