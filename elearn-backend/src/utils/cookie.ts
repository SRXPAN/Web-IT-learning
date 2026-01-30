// src/utils/cookie.ts
import type { CookieOptions } from 'express'
import { getEnv } from './env.js'

const isProd = process.env.NODE_ENV === 'production'
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 // 15 хвилин
const REFRESH_TOKEN_MAX_AGE = parseInt(getEnv('REFRESH_TOKEN_EXPIRES_DAYS', '7')) * 24 * 60 * 60 * 1000

/**
 * Налаштування cookie для access токена (короткоживучий)
 */
export function getAccessCookieOptions(): CookieOptions {
  return {
    httpOnly: true,           // Недоступно для JavaScript
    secure: isProd,           // HTTPS only в production
    sameSite: isProd ? 'none' : 'lax', // 'none' для cross-origin в production
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  }
}

/**
 * Налаштування cookie для refresh токена (довгоживучий)
 */
export function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // 'none' для cross-origin в production
    path: '/api/auth',        // Тільки для auth endpoints
    maxAge: REFRESH_TOKEN_MAX_AGE,
  }
}

/**
 * Застаріла функція - для зворотної сумісності
 * @deprecated Використовуйте getAccessCookieOptions або getRefreshCookieOptions
 */
export function getCookieOptions(): CookieOptions {
  return getAccessCookieOptions()
}

/**
 * Налаштування для очищення cookie
 */
export function getClearCookieOptions(): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  }
}

/**
 * Налаштування для очищення refresh cookie
 */
export function getClearRefreshCookieOptions(): CookieOptions {
  return {
    path: '/api/auth',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  }
}
