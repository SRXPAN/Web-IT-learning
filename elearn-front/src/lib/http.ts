import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Визначаємо URL API: використовуємо змінну середовища або дефолтний локальний
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Важливо для Cookies!
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
$api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Якщо є токен в localStorage (резервний варіант), додаємо його
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor
$api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Якщо помилка 401 (Unauthorized) і це не повторний запит
    if (error.response?.status === 401 && error.config && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Пробуємо оновити токен
        await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true } // Обов'язково для відправки Refresh Cookie
        )
        
        // Якщо успішно - повторюємо оригінальний запит
        return $api.request(originalRequest)
      } catch (refreshError) {
        console.error('Session expired or refresh failed', refreshError)
        
        // Очищаємо дані
        localStorage.removeItem('user_data')
        localStorage.removeItem('access_token')
        
        // Даємо React трохи часу перед редіректом, щоб уникнути помилки "insertBefore"
        setTimeout(() => {
            window.location.href = '/login'
        }, 100)
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Named exports for compatibility
export const api = $api
export const http = $api

export default $api
