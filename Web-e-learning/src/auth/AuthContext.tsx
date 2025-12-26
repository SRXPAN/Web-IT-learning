// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, fetchCsrfToken } from '../lib/http'
import type { User, AuthResponse } from '@elearn/shared'

// Re-export User type for backward compatibility
export type { User }

type AuthState = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)
export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('AuthContext not found')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Отримуємо CSRF токен і перевіряємо авторизацію паралельно
    Promise.all([
      fetchCsrfToken().catch(() => null), // CSRF токен - не критично якщо не вдалось
      api<User>('/auth/me').catch(() => null),
    ])
      .then(([, userData]) => {
        setUser(userData)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const { user } = await api<AuthResponse>('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }), 
    })
    setUser(user)
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const { user } = await api<AuthResponse>('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify({ name, email, password }), 
    })
    setUser(user)
  }

  async function logout(): Promise<void> {
    await api('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  async function refresh(): Promise<void> {
    const u = await api<User>('/auth/me')
    setUser(u)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh }), [user, loading])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
