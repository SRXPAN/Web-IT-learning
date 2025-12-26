// src/utils/storage.ts

/**
 * Безпечне отримання JSON з localStorage
 * Повертає fallback якщо ключ не існує або JSON невалідний
 */
export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return fallback
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error)
    return fallback
  }
}

/**
 * Безпечне збереження JSON в localStorage
 * Повертає true якщо успішно, false якщо помилка
 */
export function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to save localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Безпечне видалення з localStorage
 */
export function safeRemove(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Failed to remove localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Безпечне отримання рядка з localStorage
 */
export function safeGetString(key: string, fallback: string = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch (error) {
    console.warn(`Failed to get localStorage key "${key}":`, error)
    return fallback
  }
}

/**
 * Безпечне збереження рядка в localStorage
 */
export function safeSetString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn(`Failed to save localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Перевірка чи localStorage доступний
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Очищення всіх даних quiz progress
 */
export function clearQuizProgress(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('quiz_progress_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear quiz progress:', error)
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  QUIZ_HISTORY: 'quiz_history',
  QUIZ_PROGRESS: (id: string) => `quiz_progress_${id}`,
  ACTIVITY_LOGS: 'activity_logs',
  DAILY_GOALS: (date: string) => `daily_goals_${date}`,
  THEME: 'theme',
  LANGUAGE: 'language',
} as const
