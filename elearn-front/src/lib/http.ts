import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { dispatchToast } from '@/utils/toastEmitter'

// Визначаємо API URL
const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
export const API_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`

// CSRF token storage
let csrfToken: string | null = null

// Helper: Отримання CSRF токена з куків
function getCsrfFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Створюємо інстанс axios
const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// === Request Interceptor ===
$api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Add Authorization header
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add CSRF token for mutating methods (POST, PUT, PATCH, DELETE)
  const mutatingMethods = ['post', 'put', 'delete', 'patch']
  if (config.method && mutatingMethods.includes(config.method.toLowerCase())) {
    const csrf = csrfToken || getCsrfFromCookie()
    if (csrf && config.headers) {
      config.headers['x-csrf-token'] = csrf
    }
  }
  
  return config
})

// === Response Interceptor ===
$api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // ВАЖЛИВО: Якщо ми вже на /login - НЕ робимо нічого (зупиняємо цикл)
    if (error.response?.status === 401 && window.location.pathname === '/login') {
      return Promise.reject(error)
    }

    // Логіка оновлення токена (Refresh) - тільки для 401
    if (error.response?.status === 401 && error.config && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: { 'x-csrf-token': getCsrfFromCookie() || '' }
          }
        )
        // Повторюємо оригінальний запит
        return $api.request(originalRequest)
      } catch (refreshError) {
        console.error('Session expired', refreshError)
        localStorage.removeItem('user_data')
        localStorage.removeItem('access_token')
        
        // Перенаправляємо на логін тільки якщо ми НЕ там
        // Використовуємо replace замість href, щоб не засмічувати історію
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.replace('/login')
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Глобальний Toast для помилок (крім 401, 403, 429)
    const status = error.response?.status
    if (status !== 401 && status !== 403 && status !== 429) {
      try {
        const data = error.response?.data as any
        const message = data?.message || data?.error || 'Request failed'
        if (typeof dispatchToast === 'function') {
          dispatchToast(typeof message === 'string' ? message : 'Error', 'error')
        }
      } catch (e) {
        console.error('Toast dispatch error:', e)
      }
    }

    return Promise.reject(error)
  }
)

export default $api

// === Fetch-style API wrapper ===
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: string
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function api<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, signal } = options
  
  const config = {
    method,
    url,
    data: body ? JSON.parse(body) : undefined,
    headers,
    signal,
  }
  
  const response = await $api.request<T>(config)
  return response.data
}

// === Compatibility Layer ===

// Функція для отримання CSRF токена
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    const res = await $api.get('/auth/csrf')
    const token = res.data.csrfToken || ''
    csrfToken = token
    return token
  } catch (e) {
    console.warn('CSRF Fetch Error', e)
    csrfToken = getCsrfFromCookie()
    return csrfToken || ''
  }
}

// Force refresh CSRF token
export const refreshCsrfToken = async (): Promise<void> => {
  await fetchCsrfToken()
}

// Обгортки для методів
export const apiGet = async <T>(url: string, config?: any): Promise<T> => {
  const response = await $api.get<T>(url, config)
  return response.data
}

export const apiPost = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await $api.post<T>(url, data, config)
  return response.data
}

export const apiPut = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await $api.put<T>(url, data, config)
  return response.data
}

export const apiDelete = async <T>(url: string, config?: any): Promise<T> => {
  const response = await $api.delete<T>(url, config)
  return response.data
}

export const http = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
}
