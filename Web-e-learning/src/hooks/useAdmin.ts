/**
 * Admin API Hooks
 * For user management, audit logs, system stats
 */
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/http'

// Types
interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'EDITOR' | 'ADMIN'
  xp: number
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    answers: number
    topicsCreated: number
    materialsCreated: number
  }
}

interface AuditLog {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  metadata: Record<string, any> | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface PaginatedResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface UsersResponse extends PaginatedResponse<User> {
  users: User[]
}

interface AuditLogsResponse extends PaginatedResponse<AuditLog> {
  logs: AuditLog[]
}

interface SystemStats {
  users: {
    total: number
    byRole: Record<string, number>
  }
  content: {
    topics: number
    materials: number
    quizzes: number
    questions: number
    files: number
  }
  activity: {
    last7days: Record<string, {
      timeSpent: number
      quizAttempts: number
      materialsViewed: number
    }>
  }
}

// Users Hook
export function useAdminUsers(initialPage = 1, initialLimit = 20) {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (params?: {
    page?: number
    limit?: number
    role?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', params.page.toString())
      if (params?.limit) query.set('limit', params.limit.toString())
      if (params?.role) query.set('role', params.role)
      if (params?.search) query.set('search', params.search)

      const response = await apiGet<UsersResponse>(`/admin/users?${query}`)
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRole = useCallback(async (userId: string, role: string) => {
    try {
      await apiPut(`/admin/users/${userId}/role`, { role })
      // Refresh list
      fetchUsers({ page: pagination.page, limit: pagination.limit })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      return false
    }
  }, [fetchUsers, pagination])

  const createUser = useCallback(async (data: {
    email: string
    name: string
    password: string
    role?: string
  }) => {
    try {
      await apiPost('/admin/users', data)
      fetchUsers({ page: 1, limit: pagination.limit })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      return false
    }
  }, [fetchUsers, pagination])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await apiDelete(`/admin/users/${userId}`)
      fetchUsers({ page: pagination.page, limit: pagination.limit })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      return false
    }
  }, [fetchUsers, pagination])

  useEffect(() => {
    fetchUsers({ page: initialPage, limit: initialLimit })
  }, [])

  return {
    users,
    pagination,
    loading,
    error,
    fetchUsers,
    updateRole,
    createUser,
    deleteUser,
  }
}

// Audit Logs Hook
export function useAdminAuditLogs(initialPage = 1, initialLimit = 50) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async (params?: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    resource?: string
    startDate?: string
    endDate?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', params.page.toString())
      if (params?.limit) query.set('limit', params.limit.toString())
      if (params?.userId) query.set('userId', params.userId)
      if (params?.action) query.set('action', params.action)
      if (params?.resource) query.set('resource', params.resource)
      if (params?.startDate) query.set('startDate', params.startDate)
      if (params?.endDate) query.set('endDate', params.endDate)

      const response = await apiGet<AuditLogsResponse>(`/admin/audit-logs?${query}`)
      setLogs(response.logs)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs({ page: initialPage, limit: initialLimit })
  }, [])

  return {
    logs,
    pagination,
    loading,
    error,
    fetchLogs,
  }
}

// System Stats Hook
export function useAdminStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiGet<SystemStats>('/admin/stats')
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
