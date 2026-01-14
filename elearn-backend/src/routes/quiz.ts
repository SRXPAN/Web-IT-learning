// src/routes/quiz.ts
import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { quizSchemas } from '../schemas/quiz.schema.js'
import type { Lang } from '@elearn/shared'
import { logger } from '../utils/logger.js'
import { getQuizWithToken, submitQuizAttempt, getUserQuizHistory } from '../services/quiz.service.js'

const router = Router()

// Helper to safely extract string from params (handles string | string[])
function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

// Validation moved to quizSchemas.submitQuiz

router.get(
  '/:id',
  requireAuth,
  validateResource(quizSchemas.idParam, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const lang = req.query.lang as Lang | undefined
    const id = getParam(req.params.id)

    const quiz = await getQuizWithToken(id, req.user!.id, lang)
    if (!quiz) {
      throw AppError.notFound('Quiz not found')
    }
    return res.json(quiz)
  })
)

router.post(
  '/:id/submit',
  requireAuth,
  validateResource(quizSchemas.submitQuiz, { body: quizSchemas.submitQuiz, params: quizSchemas.idParam }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = getParam(req.params.id)
    try {
      const result = await submitQuizAttempt(
        id,
        req.user!.id,
        req.body.token,
        req.body.answers,
        (req.body.lang as Lang | undefined) || 'EN'
      )
      return res.json(result)
    } catch (e: any) {
      if (e.message === 'Invalid or expired quiz token') {
        throw AppError.unauthorized(e.message)
      }
      if (e.message === 'Quiz time limit exceeded' || e.message === 'Quiz token mismatch') {
        throw AppError.forbidden(e.message)
      }
      if (e.message === 'Quiz not found') {
        throw AppError.notFound(e.message)
      }
      throw e
    }
  })
)

// GET /api/quiz/history — отримати історію спроб користувача
router.get(
  '/user/history',
  requireAuth,
  validateResource(quizSchemas.pagination, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 100)
    const page = Math.max(parseInt(req.query.page as string) || 1, 1)
    const lang = req.query.lang as Lang | undefined

    const history = await getUserQuizHistory(req.user!.id, { page, limit, lang })
    return res.json(history)
  })
)

export default router
