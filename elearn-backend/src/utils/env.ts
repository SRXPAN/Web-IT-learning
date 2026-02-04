// src/utils/env.ts
import { logger } from './logger.js'

/**
 * Безпечне отримання змінних середовища
 * Виводить зрозуміле повідомлення та завершує процес якщо критична змінна відсутня
 */
export function requireEnv(name: string, description?: string): string {
  const value = process.env[name]
  if (!value) {
    const message = description 
      ? `❌ Missing required environment variable: ${name}\n   Description: ${description}\n   Please set this variable in your .env file or environment.`
      : `❌ Missing required environment variable: ${name}\n   Please set this variable in your .env file or environment.`
    
    logger.error(message)
    
    // В продакшені - завершуємо процес
    if (process.env.NODE_ENV === 'production') {
      logger.error('Application cannot start without required environment variables. Exiting...')
      process.exit(1)
    } else {
      // В dev режимі - кидаємо помилку для розробника
      throw new Error(message)
    }
  }
  return value
}

/**
 * Отримання змінної з fallback значенням
 * Використовувати ТІЛЬКИ для некритичних налаштувань
 */
export function getEnv(name: string, fallback: string): string {
  const value = process.env[name]
  if (!value) {
    logger.warn(`⚠️  Using fallback value for ${name}: "${fallback}"`)
    return fallback
  }
  return value
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
let _geminiApiKey: string | null = null

export function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret
  _jwtSecret = requireEnv('JWT_SECRET', 'Secret key for JWT token signing (use a long random string)')
  return _jwtSecret
}

/**
 * Get Gemini API key for AI-powered features (quiz generation, etc.)
 * Returns null if not configured (feature will be disabled)
 */
export function getGeminiApiKey(): string | null {
  if (_geminiApiKey !== null) return _geminiApiKey
  
  const value = process.env.GEMINI_API_KEY
  if (!value) {
    logger.warn('⚠️  GEMINI_API_KEY not configured. AI-powered features will be disabled.')
    _geminiApiKey = ''
    return null
  }
  
  _geminiApiKey = value
  return _geminiApiKey
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey()
}
