// src/utils/cookie.ts
import type { CookieOptions } from 'express'

/**
 * Налаштування cookie для JWT токенів
 * Централізовано для уникнення дублювання
 */
export function getCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,           // Недоступно для JavaScript
    secure: isProd,           // HTTPS only в production
    sameSite: 'strict',       // Захист від CSRF
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  }
}

/**
 * Налаштування для очищення cookie
 */
export function getClearCookieOptions(): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
  }
}
