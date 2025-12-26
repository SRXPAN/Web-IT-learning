// src/middleware/sanitize.ts
import type { Request, Response, NextFunction } from 'express'

/**
 * Санітизує рядок від потенційно небезпечних символів
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Видаляємо HTML теги
    .trim()
}

/**
 * Рекурсивно санітизує об'єкт
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Санітизуємо ключі теж
      const safeKey = sanitizeString(key)
      result[safeKey] = sanitizeObject(value)
    }
    return result
  }
  
  return obj
}

/**
 * Middleware для санітизації request body
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  next()
}

/**
 * Middleware для санітизації query параметрів
 */
export function sanitizeQuery(req: Request, _res: Response, next: NextFunction): void {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as typeof req.query
  }
  next()
}

/**
 * Комбінований middleware для санітизації
 */
export function sanitize(req: Request, res: Response, next: NextFunction): void {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, next)
  })
}
