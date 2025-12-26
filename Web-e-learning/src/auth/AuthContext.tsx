// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { api, fetchCsrfToken } from '../lib/http'
import { startPeriodicSync, stopPeriodicSync, performFullSync } from '../services/progress'
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
  updateUser: (updates: Partial<User>) => void
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
  const syncStartedRef = useRef(false)

  // Запуск синхронізації при авторизації
  const startSync = useCallback((userId: string) => {
    if (!syncStartedRef.current) {
      syncStartedRef.current = true
      // Виконуємо повну синхронізацію при вході
      performFullSync(userId).catch(console.error)
      // Запускаємо періодичну синхронізацію
      startPeriodicSync(userId)
    }
  }, [])

  // Зупинка синхронізації при виході
  const stopSync = useCallback(() => {
    syncStartedRef.current = false
    stopPeriodicSync()
  }, [])

  useEffect(() => {
    // Отримуємо CSRF токен і перевіряємо авторизацію паралельно
    Promise.all([
      fetchCsrfToken().catch(() => null), // CSRF токен - не критично якщо не вдалось
      api<User>('/auth/me').catch(() => null),
    ])
      .then(([, userData]) => {
        setUser(userData)
        if (userData) {
          startSync(userData.id)
        }
      })
      .finally(() => setLoading(false))
    
    return () => stopSync()
  }, [startSync, stopSync])

  async function login(email: string, password: string): Promise<void> {
    const { user: userData } = await api<AuthResponse>('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }), 
    })
    setUser(userData)
    startSync(userData.id)
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const { user: userData } = await api<AuthResponse>('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify({ name, email, password }), 
    })
    setUser(userData)
    startSync(userData.id)
  }

  async function logout(): Promise<void> {
    stopSync()
    await api('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  async function refresh(): Promise<void> {
    const u = await api<User>('/auth/me')
    setUser(u)
  }

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const value = useMemo(() => ({ 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    refresh,
    updateUser 
  }), [user, loading, updateUser])
  
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
