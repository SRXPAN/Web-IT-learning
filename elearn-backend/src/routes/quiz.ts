// src/routes/quiz.ts
import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { validateId } from '../middleware/validateParams.js'
import { z } from 'zod'
import type { QuizSubmitResult, QuizAnswer } from '@elearn/shared'

const router = Router()

router.get('/:id', requireAuth, validateId, async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: {
      questions: { include: { options: { select: { id: true, text: true } } } },
    },
  })
  if (!quiz) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.json(quiz)
})

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().min(1).optional(), // allow unanswered
    }),
  ),
})

router.post(
  '/:id/submit',
  requireAuth,
  validateId,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.id },
        include: {
          questions: { include: { options: true } }, // include correctness
        },
      })
      if (!quiz) return res.status(404).json({ error: 'Not found' })

      const parsed = submitSchema.safeParse(req.body)
      if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() })

      const validAnswers = parsed.data.answers.filter(
        (a) => typeof a.optionId === 'string' && a.optionId.length > 0,
      )

      const correctByQ = new Map<string, string>()
      for (const q of quiz.questions) {
        const correct = q.options.find((o) => o.correct)
        if (correct) correctByQ.set(q.id, correct.id)
      }

      let correctCount = 0
      const rows = validAnswers.map((a) => {
        const ok = correctByQ.get(a.questionId) === a.optionId!
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
        if (rows.length) {
          await tx.answer.createMany({ data: rows, skipDuplicates: true })
        }
        
        await tx.user.update({
          where: { id: req.user!.id },
          data: { xp: { increment: xpEarned } },
        })
      })

      res.json({ correct: correctCount, total: quiz.questions.length, xpEarned })
    } catch (e) {
      next(e)
    }
  },
)

// GET /api/quiz/history — отримати історію спроб користувача
router.get('/user/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const page = Math.max(parseInt(req.query.page as string) || 1, 1)
    const skip = (page - 1) * limit

    // Get unique quiz attempts with aggregated results
    const answers = await prisma.answer.findMany({
      where: { userId: req.user!.id },
      include: {
        question: {
          include: {
            quiz: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 10, // Get more to group by quiz
    })

    // Group answers by quiz and calculate stats
    const quizMap = new Map<string, {
      quizId: string
      quizTitle: string
      correct: number
      total: number
      lastAttempt: Date
    }>()

    for (const answer of answers) {
      const quizId = answer.question.quiz.id
      const quizTitle = answer.question.quiz.title
      
      if (!quizMap.has(quizId)) {
        quizMap.set(quizId, {
          quizId,
          quizTitle,
          correct: 0,
          total: 0,
          lastAttempt: answer.createdAt
        })
      }
      
      const stats = quizMap.get(quizId)!
      stats.total++
      if (answer.isCorrect) stats.correct++
      if (answer.createdAt > stats.lastAttempt) {
        stats.lastAttempt = answer.createdAt
      }
    }

    // Convert to array and sort by last attempt
    const history = Array.from(quizMap.values())
      .sort((a, b) => b.lastAttempt.getTime() - a.lastAttempt.getTime())
      .slice(skip, skip + limit)

    // Get total count
    const totalQuizzes = quizMap.size

    res.json({
      data: history,
      pagination: {
        page,
        limit,
        total: totalQuizzes,
        totalPages: Math.ceil(totalQuizzes / limit)
      }
    })
  } catch (e) {
    next(e)
  }
})

export default router
