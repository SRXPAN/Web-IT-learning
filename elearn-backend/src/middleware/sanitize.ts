// src/middleware/sanitize.ts
import type { Request, Response, NextFunction } from 'express'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window as any)

/**
 * Рекурсивно очищає рядки в об'єкті від XSS
 */
function cleanObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = DOMPurify.sanitize(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanObject(obj[key])
    }
  }
}

export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    cleanObject(req.body)
  }
  next()
}

// Залиште інші функції як alias або видаліть, якщо не використовуються
export const sanitize = sanitizeBody
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => next()
