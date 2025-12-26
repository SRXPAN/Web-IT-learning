// src/middleware/validateParams.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { z } from 'zod'

/**
 * CUID схема валідації (формат Prisma ID)
 * Приклад валідного CUID: clb4s9x0c000008l6g1xv5h2b
 */
const cuidRegex = /^c[a-z0-9]{24}$/

export const cuidSchema = z.string().regex(cuidRegex, 'Invalid ID format')

/**
 * Middleware для валідації параметрів запиту
 * @param paramNames - масив імен параметрів для валідації
 */
export function validateParams(...paramNames: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const name of paramNames) {
      const value = req.params[name]
      
      if (!value) {
        return res.status(400).json({ error: `Parameter '${name}' is required` })
      }
      
      const result = cuidSchema.safeParse(value)
      if (!result.success) {
        return res.status(400).json({ 
          error: `Invalid ${name} format`,
          details: result.error.flatten()
        })
      }
    }
    next()
  }
}

/**
 * Окремі middleware для частих випадків
 */
export const validateId = validateParams('id')
export const validateTopicId = validateParams('topicId')
export const validateQuizId = validateParams('quizId')
export const validateTopicAndId = validateParams('topicId', 'id')
