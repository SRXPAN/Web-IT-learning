// src/routes/quiz.ts
import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { validateId } from '../middleware/validateParams.js'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import type { QuizSubmitResult, QuizAnswer, Lang } from '@elearn/shared'
import { localizeObject, localizeArray } from '../utils/i18n'
import { getJwtSecret } from '../utils/env.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Field mappings for localization (JSON fields)
const quizFields = { titleJson: 'title' }
const questionFields = { textJson: 'text', explanationJson: 'explanation' }
const optionFields = { textJson: 'text' }

// Type for quiz with optional i18n fields
interface QuizWithI18n {
  title?: string
  titleJson?: unknown
  [key: string]: unknown
}

interface QuestionWithI18n {
  text?: string
  textJson?: unknown
  explanation?: string | null
  explanationJson?: unknown
  [key: string]: unknown
}

interface OptionWithI18n {
  text?: string
  textJson?: unknown
  [key: string]: unknown
}

// Helper to localize quiz
function localizeQuiz(quiz: QuizWithI18n, lang: Lang): Record<string, unknown> {
  const result: Record<string, unknown> = { ...quiz }
  
  if (quiz.titleJson) {
    const localized = localizeObject(quiz as Record<string, unknown>, lang, quizFields)
    result.title = localized.title
  }
  
  // Clean up internal fields
  delete result.titleJson
  
  return result
}

// Helper to localize question
function localizeQuestion(q: QuestionWithI18n, lang: Lang): Record<string, unknown> {
  const result: Record<string, unknown> = { ...q }
  
  // Localize text
  if (q.textJson) {
    const localized = localizeObject(q as Record<string, unknown>, lang, { textJson: 'text' })
    result.text = localized.text
  }
  
  // Localize explanation
  if (q.explanationJson) {
    const localized = localizeObject(q as Record<string, unknown>, lang, { explanationJson: 'explanation' })
    result.explanation = localized.explanation
  }
  
  // Clean up internal fields
  delete result.textJson
  delete result.explanationJson
  
  return result
}

// Helper to localize option
function localizeOption(opt: OptionWithI18n, lang: Lang): Record<string, unknown> {
  const result: Record<string, unknown> = { ...opt }
  
  if (opt.textJson) {
    const localized = localizeObject(opt as Record<string, unknown>, lang, optionFields)
    result.text = localized.text
  }
  
  // Clean up internal fields
  delete result.textJson
  
  return result
}

router.get('/:id', requireAuth, validateId, async (req, res) => {
  const lang = req.query.lang as Lang | undefined
  
  const quiz = await (prisma.quiz.findUnique as any)({
    where: { id: req.params.id },
    include: {
      questions: { 
        include: { 
          options: { 
            select: { 
              id: true, 
              text: true, 
              textJson: true,
              // NOTE: isCorrect is NOT included - students shouldn't see it
            } 
          } 
        } 
      },
    },
  })
  if (!quiz) {
    return res.status(404).json({ error: 'Not found' })
  }
  
  // Generate quiz token with expiration (quiz duration + 2 min buffer)
  const expiresAt = Date.now() + (quiz.durationSec * 1000) + (120 * 1000)
  const quizPayload = { quizId: quiz.id, userId: req.user!.id, expiresAt }
  const expiresInSeconds = (quiz.durationSec + 120) * 60 // Convert to seconds for JWT
  const quizToken = jwt.sign(quizPayload, getJwtSecret(), { 
    expiresIn: expiresInSeconds
  })
  
  // Apply localization if lang is specified
  if (lang && ['UA', 'PL', 'EN'].includes(lang)) {
    const locQuiz = localizeQuiz(quiz, lang)
    res.json({
      ...locQuiz,
      token: quizToken,
      questions: quiz.questions.map((q: any) => ({
        ...localizeQuestion(q, lang),
        options: q.options.map((o: any) => localizeOption(o, lang)),
      })),
    })
  } else {
    // Return quiz without localization
    res.json({
      ...quiz,
      token: quizToken,
      questions: quiz.questions.map((q: any) => ({
        ...q,
        options: q.options.map((o: any) => ({
          ...o,
        })),
      })),
    })
  }
})

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().min(1).optional(), // allow unanswered
    }),
  ),
  lang: z.enum(['UA', 'PL', 'EN']).optional(),
  token: z.string(), // Quiz token from GET /:id
})

router.post(
  '/:id/submit',
  requireAuth,
  validateId,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = submitSchema.safeParse(req.body)
      if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() })
      
      // Verify quiz token and check expiration
      let quizPayload: any
      try {
        quizPayload = jwt.verify(parsed.data.token, getJwtSecret()) as any
      } catch (e) {
        logger.error('Quiz token verification failed:', e)
        return res.status(401).json({ error: 'Invalid or expired quiz token' })
      }

      // Check if time is up
      if (Date.now() > quizPayload.expiresAt) {
        return res.status(403).json({ error: 'Quiz time limit exceeded' })
      }

      // Verify token matches this quiz and user
      if (quizPayload.quizId !== req.params.id || quizPayload.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Quiz token mismatch' })
      }
      
      const lang = parsed.data.lang as Lang | undefined
      
      // Fetch quiz for explanations
      const quiz = await (prisma.quiz.findUnique as any)({
        where: { id: req.params.id },
        include: {
          questions: { 
            include: { 
              options: true, // include correctness
            } 
          },
        },
      })
      if (!quiz) return res.status(404).json({ error: 'Not found' })

      const validAnswers = parsed.data.answers.filter(
        (a) => typeof a.optionId === 'string' && a.optionId.length > 0,
      )

      // Build correctMap: questionId -> correctOptionId
      const correctMap: Record<string, string> = {}
      const explanationMap: Record<string, string> = {}
      
      for (const q of quiz.questions) {
        const correct = q.options.find((o: any) => o.correct)
        if (correct) {
          correctMap[q.id] = correct.id
        }
        
        // Get localized explanation
        if (lang && q.explanationJson) {
          const localized = localizeObject(q as Record<string, unknown>, lang, { explanationJson: 'explanation' })
          explanationMap[q.id] = (localized.explanation as string) || ''
        } else if (q.explanation) {
          explanationMap[q.id] = q.explanation
        }
      }

      let correctCount = 0
      const rows = validAnswers.map((a) => {
        const ok = correctMap[a.questionId] === a.optionId!
        if (ok) correctCount += 1
        return {
          userId: req.user!.id,
          questionId: a.questionId,
          optionId: a.optionId!,
          isCorrect: ok,
        }
      })

      const xpEarned = correctCount * 10

      // Використовуємо транзакцію для атомарності операцій
      await prisma.$transaction(async (tx) => {
        // Create quiz attempt record
        const attempt = await tx.quizAttempt.create({
          data: {
            userId: req.user!.id,
            quizId: quiz.id,
            score: correctCount,
            total: quiz.questions.length,
            xpEarned,
          },
        })

        if (rows.length) {
          // Link answers to attempt
          const rowsWithAttempt = rows.map((r) => ({ ...r, attemptId: attempt.id }))
          await tx.answer.createMany({ data: rowsWithAttempt, skipDuplicates: true })
        }
        
        await tx.user.update({
          where: { id: req.user!.id },
          data: { xp: { increment: xpEarned } },
        })
      })

      res.json({ 
        correct: correctCount, 
        total: quiz.questions.length, 
        xpEarned,
        correctMap,
        solutions: explanationMap,
      })
    } catch (e) {
      next(e)
    }
  },
)

// GET /api/quiz/history — отримати історію спроб користувача
router.get('/user/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 100)
    const page = Math.max(parseInt(req.query.page as string) || 1, 1)
    const skip = (page - 1) * limit
    const lang = req.query.lang as Lang | undefined

    // Get quiz attempts from QuizAttempt table
    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId: req.user!.id },
        include: {
          quiz: {
            select: { 
              id: true, 
              title: true,
              titleJson: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quizAttempt.count({ where: { userId: req.user!.id } }),
    ])

    const history = attempts.map((a: any) => {
      let quizTitle = a.quiz.title
      if (lang && a.quiz.titleJson) {
        quizTitle = (a.quiz.titleJson as Record<string, string>)[lang] || a.quiz.title
      }
      return {
        quizId: a.quiz.id,
        quizTitle,
        correct: a.score,
        total: a.total,
        lastAttempt: a.createdAt.toISOString(),
      }
    })

    res.json({
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (e) {
    next(e)
  }
})

export default router
