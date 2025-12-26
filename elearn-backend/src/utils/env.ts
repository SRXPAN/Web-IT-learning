// src/utils/env.ts

/**
 * Безпечне отримання змінних середовища
 * Кидає помилку якщо обов'язкова змінна відсутня
 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`)
  }
  return value
}

/**
 * Отримання змінної з fallback значенням
 * Використовувати ТІЛЬКИ для некритичних налаштувань
 */
export function getEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

/**
 * Отримання числової змінної
 */
export function getEnvNumber(name: string, fallback: number): number {
  const value = process.env[name]
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Перевірка чи production середовище
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Критичні змінні - завантажуються при старті
let _jwtSecret: string | null = null

export function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret
  _jwtSecret = requireEnv('JWT_SECRET')
  return _jwtSecret
}
