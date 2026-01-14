// src/routes/lessons.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { validateResource } from '../middleware/validateResource.js'
import { z } from 'zod'
import { localizeObject } from '../utils/i18n.js'
import { ok } from '../utils/response.js'
import type { Lang } from '@elearn/shared'

const router = Router()

// Helper to safely extract string from params (handles string | string[])
function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

// Type for material with optional i18n fields
interface MaterialWithI18n {
  title?: string
  titleJson?: unknown
  content?: string | null
  contentJson?: unknown
  [key: string]: unknown
}

// Helper to localize material using JSON fields
function localizeMaterial<T extends MaterialWithI18n>(
  material: T,
  lang: Lang
): Omit<T, 'titleJson' | 'contentJson'> {
  const result: Record<string, unknown> = { ...material }
  
  // Localize title from titleJson
  if (material.titleJson) {
    const localized = localizeObject(material as Record<string, unknown>, lang, { titleJson: 'title' })
    result.title = localized.title
  }
  
  // Localize content from contentJson
  if (material.contentJson) {
    const localized = localizeObject(material as Record<string, unknown>, lang, { contentJson: 'content' })
    result.content = localized.content
  }
  
  // Clean up internal fields from response
  delete result.titleJson
  delete result.contentJson
  
  return result as Omit<T, 'titleJson' | 'contentJson'>
}

// Schema for query params
const querySchema = z.object({
  lang: z.enum(['UA', 'PL', 'EN']).optional(),
})

// GET /lessons - List all lessons/materials
router.get(
  '/',
  requireAuth,
  validateResource(querySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
    const lang = (req.query.lang as any) as Lang | undefined

    const materials = await (prisma.material.findMany as any)({
      where: isStaff ? {} : { status: 'Published' },
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    const localizedMaterials = lang
      ? materials.map((m: any) => localizeMaterial(m, lang))
      : materials

    return ok(res, { data: localizedMaterials })
  })
)

// GET /lessons/:id - Get single lesson/material by ID
router.get(
  '/:id',
  requireAuth,
  validateResource(z.object({ id: z.string().uuid() }), 'params'),
  validateResource(querySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
    const lang = (req.query.lang as any) as Lang | undefined
    const id = getParam(req.params.id)

    const material = await (prisma.material.findUnique as any)({
      where: { id },
      include: {
        topic: {
          select: { id: true, name: true, nameJson: true, slug: true },
        },
        file: true,
      },
    })

    if (!material) {
      throw AppError.notFound('Lesson not found')
    }

    if (!isStaff && material.status !== 'Published') {
      throw AppError.forbidden('Access denied')
    }

    prisma.material
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {})

    if (lang && ['UA', 'PL', 'EN'].includes(lang)) {
      const localized = localizeMaterial(material, lang)
      let localizedTopic = material.topic
      if (material.topic?.nameJson) {
        const topicLocalized = localizeObject(material.topic, lang, { nameJson: 'name' })
        localizedTopic = { ...topicLocalized }
        delete (localizedTopic as any).nameJson
      }

      return res.json({ ...localized, topic: localizedTopic })
    } else {
      return res.json(material)
    }
  })
)

// GET /lessons/by-topic/:topicId - Get lessons by topic
router.get(
  '/by-topic/:topicId',
  requireAuth,
  validateResource(z.object({ topicId: z.string().uuid() }), 'params'),
  validateResource(querySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
    const lang = (req.query.lang as any) as Lang | undefined

    const materials = await (prisma.material.findMany as any)({
      where: {
        topicId: req.params.topicId,
        ...(isStaff ? {} : { status: 'Published' }),
      },
      orderBy: { createdAt: 'asc' },
    })

    const localizedMaterials = lang
      ? materials.map((m: any) => localizeMaterial(m, lang))
      : materials

    return ok(res, { data: localizedMaterials })
  })
)

export default router
