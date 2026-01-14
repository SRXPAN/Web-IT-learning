// src/routes/editor.ts
import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'
import { validateId, validateTopicId, validateTopicAndId } from '../middleware/validateParams.js'
import { requireEditor } from '../middleware/requireEditor.js'
import { z } from 'zod'
import type { Category, Lang, Status, Difficulty } from '@elearn/shared'
import type { Prisma } from '@prisma/client'
import { logger } from '../utils/logger.js'
import { updateMaterialWithLocalization } from '../services/materials.service.js'

const router = Router()

// Helper to safely extract string from params (handles string | string[])
function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

// ==================== TOPICS ====================

/**
 * @openapi
 * /api/editor/topics:
 *   get:
 *     tags:
 *       - Editor
 *     summary: Get all root topics for editing
 *     description: Returns all root-level topics (parentId = null) for content management
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of root topics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *       401:
 *         description: Unauthorized - requires EDITOR or ADMIN role
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/topics', requireAuth, requireRole(['EDITOR','ADMIN']), async (_req, res) => {
  const topics = await prisma.topic.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true
    }
  })
  res.json(topics)
})

// ==================== MATERIALS ====================

/**
 * @openapi
 * /api/editor/topics/{topicId}/materials:
 *   get:
 *     tags:
 *       - Editor
 *     summary: Get all materials for a topic
 *     description: Returns all learning materials associated with a specific topic
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The topic ID
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       400:
 *         description: Invalid topic ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires EDITOR or ADMIN role
 */
router.get('/topics/:topicId/materials', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const mats = await prisma.material.findMany({
    where: { topicId },
    orderBy: { updatedAt: 'desc' },
  })
  res.json(mats)
})

router.post('/topics/:topicId/materials', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const schema = z.object({
    title: z.string().min(2),
    type: z.enum(['pdf','video','link','text']),
    url: z.string().url().optional(),
    content: z.string().optional(),
    lang: z.enum(['UA','PL','EN']).default('EN'),
    publish: z.boolean().optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const data: Prisma.MaterialCreateInput = {
    title: parsed.data.title,
    type: parsed.data.type,
    url: parsed.data.url,
    content: parsed.data.content,
    lang: parsed.data.lang,
    topic: { connect: { id: topicId } },
    status: parsed.data.publish ? 'Published' : 'Draft',
    publishedAt: parsed.data.publish ? new Date() : null,
  }

  const mat = await prisma.material.create({ data })
  logger.audit(req.user?.id ?? 'unknown', 'material.create', { id: mat.id, topicId })
  res.json(mat)
})

// Manual localization update: accepts flattened EN/UA/PL fields
/**
 * @openapi
 * /api/editor/materials/{id}:
 *   put:
 *     tags:
 *       - Editor
 *     summary: Update material with multi-language content
 *     description: Update a learning material with localized content for EN, UA, and PL languages. All language fields are stored in JSON cache.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - titleEN
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VIDEO, TEXT, PDF, LINK]
 *               titleEN:
 *                 type: string
 *                 description: English title (required, used as fallback)
 *               titleUA:
 *                 type: string
 *                 description: Ukrainian title (optional)
 *               titlePL:
 *                 type: string
 *                 description: Polish title (optional)
 *               linkEN:
 *                 type: string
 *                 format: uri
 *                 description: English URL (for VIDEO/LINK types)
 *               linkUA:
 *                 type: string
 *                 format: uri
 *                 description: Ukrainian URL
 *               linkPL:
 *                 type: string
 *                 format: uri
 *                 description: Polish URL
 *               contentEN:
 *                 type: string
 *                 description: English content (for TEXT type)
 *               contentUA:
 *                 type: string
 *                 description: Ukrainian content
 *               contentPL:
 *                 type: string
 *                 description: Polish content
 *           example:
 *             type: VIDEO
 *             titleEN: Introduction to TypeScript
 *             titleUA: Вступ до TypeScript
 *             titlePL: Wprowadzenie do TypeScript
 *             linkEN: https://youtube.com/watch?v=example_en
 *             linkUA: https://youtube.com/watch?v=example_ua
 *             linkPL: https://youtube.com/watch?v=example_pl
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires EDITOR or ADMIN role
 *       404:
 *         description: Material not found
 */
router.put('/materials/:id', requireEditor, async (req, res) => {
  const id = getParam(req.params.id)
  const { 
    type, 
    titleEN, titleUA, titlePL,
    linkEN, linkUA, linkPL,
    contentEN, contentUA, contentPL
  } = req.body

  try {
    const updated = await updateMaterialWithLocalization(id, {
      type,
      titleEN, titleUA, titlePL,
      linkEN, linkUA, linkPL,
      contentEN, contentUA, contentPL
    })
    
    logger.audit(req.user?.id ?? 'unknown', 'material.update_localization', { id })
    res.json({ success: true, material: updated })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Update failed' })
  }
})

router.delete('/topics/:topicId/materials/:id', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicAndId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const id = getParam(req.params.id)
  await prisma.material.delete({ where: { id } })
  logger.audit(req.user?.id ?? 'unknown', 'material.delete', { id, topicId })
  res.json({ ok: true })
})

// ==================== QUIZZES ====================

router.get('/topics/:topicId/quizzes', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const quizzes = await prisma.quiz.findMany({
    where: { topicId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, durationSec: true, status: true, updatedAt: true }
  })
  res.json(quizzes)
})

router.post('/topics/:topicId/quizzes', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const schema = z.object({
    title: z.string().min(2),
    durationSec: z.number().int().min(10).max(3600),
    publish: z.boolean().optional()
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const data: Prisma.QuizCreateInput = {
    title: parsed.data.title,
    durationSec: parsed.data.durationSec,
    topic: { connect: { id: topicId } },
    createdBy: req.user?.id ? { connect: { id: req.user.id } } : undefined,
    status: parsed.data.publish ? 'Published' : 'Draft',
    publishedAt: parsed.data.publish ? new Date() : null,
  }

  const quiz = await prisma.quiz.create({ data })
  logger.audit(req.user?.id ?? 'unknown', 'quiz.create', { id: quiz.id, topicId })
  res.json(quiz)
})

router.put('/topics/:topicId/quizzes/:id', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicAndId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const id = getParam(req.params.id)
  const schema = z.object({
    title: z.string().min(2).optional(),
    durationSec: z.number().int().min(10).max(3600).optional(),
    publish: z.boolean().optional(),
    status: z.enum(['Draft','Published']).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const data: Prisma.QuizUpdateInput = { ...parsed.data }
  if (typeof parsed.data.publish === 'boolean') {
    data.status = parsed.data.publish ? 'Published' : 'Draft'
    data.publishedAt = parsed.data.publish ? new Date() : null
    delete (data as Record<string, unknown>).publish
  }

  const quiz = await prisma.quiz.update({ where: { id }, data })
  logger.audit(req.user?.id ?? 'unknown', 'quiz.update', { id, topicId })
  res.json(quiz)
})

router.delete('/topics/:topicId/quizzes/:id', requireAuth, requireRole(['EDITOR','ADMIN']), validateTopicAndId, async (req, res) => {
  const topicId = getParam(req.params.topicId)
  const id = getParam(req.params.id)
  await prisma.quiz.delete({ where: { id } })
  logger.audit(req.user?.id ?? 'unknown', 'quiz.delete', { id, topicId })
  res.json({ ok: true })
})

// ==================== QUESTIONS ====================

// Get questions for a quiz
router.get('/quizzes/:quizId/questions', requireAuth, requireRole(['EDITOR','ADMIN']), async (req, res) => {
  const quizId = getParam(req.params.quizId)
  const questions = await prisma.question.findMany({
    where: { quizId },
    orderBy: { id: 'asc' },
    include: {
      options: {
        orderBy: { id: 'asc' },
        select: { id: true, text: true, textJson: true, correct: true }
      }
    }
  })
  res.json(questions)
})

// Create question
router.post('/quizzes/:quizId/questions', requireAuth, requireRole(['EDITOR','ADMIN']), async (req, res) => {
  const quizId = getParam(req.params.quizId)
  const schema = z.object({
    text: z.string().min(5),
    textJson: z.object({
      UA: z.string().optional(),
      PL: z.string().optional(),
      EN: z.string().optional(),
    }).optional(),
    explanation: z.string().optional(),
    explanationJson: z.object({
      UA: z.string().optional(),
      PL: z.string().optional(),
      EN: z.string().optional(),
    }).optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
    tags: z.array(z.string()).default([]),
    options: z.array(z.object({
      text: z.string().min(1),
      textJson: z.object({
        UA: z.string().optional(),
        PL: z.string().optional(),
        EN: z.string().optional(),
      }).optional(),
      correct: z.boolean().default(false)
    })).min(2).max(6)
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  // Ensure at least one correct answer
  const hasCorrect = parsed.data.options.some(o => o.correct)
  if (!hasCorrect) return res.status(400).json({ error: 'At least one option must be correct' })

  const question = await prisma.question.create({
    data: {
      text: parsed.data.text,
      textJson: parsed.data.textJson || {},
      explanation: parsed.data.explanation,
      explanationJson: parsed.data.explanationJson || {},
      difficulty: parsed.data.difficulty,
      tags: parsed.data.tags,
      quiz: { connect: { id: quizId } },
      options: {
        create: parsed.data.options.map(o => ({
          text: o.text,
          textJson: o.textJson || {},
          correct: o.correct
        }))
      }
    },
    include: { options: true }
  })

  logger.audit(req.user?.id ?? 'unknown', 'question.create', { id: question.id, quizId })
  res.json(question)
})

// Update question
router.put('/quizzes/:quizId/questions/:id', requireAuth, requireRole(['EDITOR','ADMIN']), async (req, res) => {
  const quizId = getParam(req.params.quizId)
  const id = getParam(req.params.id)
  const schema = z.object({
    text: z.string().min(5).optional(),
    textJson: z.object({
      UA: z.string().optional(),
      PL: z.string().optional(),
      EN: z.string().optional(),
    }).optional(),
    explanation: z.string().optional(),
    explanationJson: z.object({
      UA: z.string().optional(),
      PL: z.string().optional(),
      EN: z.string().optional(),
    }).optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    tags: z.array(z.string()).optional(),
    options: z.array(z.object({
      id: z.string().optional(),
      text: z.string().min(1),
      textJson: z.object({
        UA: z.string().optional(),
        PL: z.string().optional(),
        EN: z.string().optional(),
      }).optional(),
      correct: z.boolean().default(false)
    })).min(2).max(6).optional()
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  // Update question fields
  const questionData: Prisma.QuestionUpdateInput = {}
  if (parsed.data.text) questionData.text = parsed.data.text
  if (parsed.data.textJson) questionData.textJson = parsed.data.textJson
  if (parsed.data.explanation !== undefined) questionData.explanation = parsed.data.explanation
  if (parsed.data.explanationJson) questionData.explanationJson = parsed.data.explanationJson
  if (parsed.data.difficulty) questionData.difficulty = parsed.data.difficulty
  if (parsed.data.tags) questionData.tags = parsed.data.tags

  // Update options if provided
  if (parsed.data.options) {
    const hasCorrect = parsed.data.options.some(o => o.correct)
    if (!hasCorrect) return res.status(400).json({ error: 'At least one option must be correct' })

    // Delete existing options and create new ones
    await prisma.option.deleteMany({ where: { questionId: id } })
    await prisma.option.createMany({
      data: parsed.data.options.map(o => ({
        text: o.text,
        textJson: o.textJson || {},
        correct: o.correct,
        questionId: id
      }))
    })
  }

  const question = await prisma.question.update({
    where: { id },
    data: questionData,
    include: { options: true }
  })

  logger.audit(req.user?.id ?? 'unknown', 'question.update', { id, quizId })
  res.json(question)
})

// Delete question
router.delete('/quizzes/:quizId/questions/:id', requireAuth, requireRole(['EDITOR','ADMIN']), async (req, res) => {
  const quizId = getParam(req.params.quizId)
  const id = getParam(req.params.id)
  await prisma.question.delete({ where: { id } })
  logger.audit(req.user?.id ?? 'unknown', 'question.delete', { id, quizId })
  res.json({ ok: true })
})

export default router
