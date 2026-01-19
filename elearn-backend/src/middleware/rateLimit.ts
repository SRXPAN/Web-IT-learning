import rateLimit from 'express-rate-limit'
import 'dotenv/config'

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Загальний ліміт для більшості API (читальні та легкі мутації).
 * Напр.: 100 запитів за 1 хв / IP (500 у dev режимі).
 */
export const generalLimiter = rateLimit({
  windowMs: Number(process.env.RL_GENERAL_WINDOW_MS ?? 60_000), // 1 хв
  limit: Number(process.env.RL_GENERAL_LIMIT ?? (isDev ? 500 : 100)),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
  skip: () => isDev, // Skip rate limiting in development
})

/**
 * Жорсткіший ліміт для чутливих ендпоїнтів (логін/реєстрація/інвайт/чекаут).
 * Напр.: 20 запитів за 15 хв / IP (100 у dev режимі).
 */
export const authLimiter = rateLimit({
  windowMs: Number(process.env.RL_AUTH_WINDOW_MS ?? 15 * 60_000), // 15 хв
  limit: Number(process.env.RL_AUTH_LIMIT ?? (isDev ? 100 : 20)),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again later.' },
  skip: () => isDev, // Skip rate limiting in development
})

/**
 * М’який ліміт на webhook Stripe (дубль занадто частих нотифікацій).
 * Робимо ліміт широким, але не безкінечним.
 */
export const webhookLimiter = rateLimit({
  windowMs: Number(process.env.RL_WEBHOOK_WINDOW_MS ?? 60_000), // 1 хв
  limit: Number(process.env.RL_WEBHOOK_LIMIT ?? 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many webhook calls.' }
})
