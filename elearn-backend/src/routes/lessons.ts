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
  let contentLang: string = 'EN'; // Default
  
  // Localize title from titleJson
  if (material.titleJson) {
    const localized = localizeObject(material as Record<string, unknown>, lang, { titleJson: 'title' })
    result.title = localized.title
    
    // Check if translation exists for requested language
    if (material.titleJson && typeof material.titleJson === 'object' && (material.titleJson as any)[lang]) {
      contentLang = lang;
    }
  }
  
  // Localize content from contentJson
  if (material.contentJson) {
    const localized = localizeObject(material as Record<string, unknown>, lang, { contentJson: 'content' })
    result.content = localized.content
  }
  
  // Clean up internal fields from response
  delete result.titleJson
  delete result.contentJson
  
  // Add metadata for frontend
  result.meta = {
    requestedLang: lang,
    contentLang: contentLang
  };
  
  return result as Omit<T, 'titleJson' | 'contentJson'>
}

// Schema for query params
const querySchema = z.object({
  lang: z.enum(['UA', 'PL', 'EN']).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
})

// GET /lessons - List all lessons/materials
router.get(
  '/',
  requireAuth,
  validateResource(querySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as z.infer<typeof querySchema>;
    const { lang, page = '1', limit = '10' } = query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user!.role);

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where: isStaff ? {} : { status: 'Published' },
        orderBy: { createdAt: 'desc' },
        take, skip,
        include: { 
          topic: { 
            select: { id: true, name: true, slug: true, nameJson: true } 
          } 
        },
      }),
      prisma.material.count({ where: isStaff ? {} : { status: 'Published' } })
    ])

    const localizedMaterials = lang
      ? materials.map((m: any) => localizeMaterial(m, lang as Lang))
      : materials

    return ok(res, { data: localizedMaterials, pagination: { page: parseInt(page), limit: parseInt(limit), total } })
  })
)

// GET /lessons/:id - Get single lesson/material by ID
router.get(
  '/:id',
  requireAuth,
  validateResource(z.object({ id: z.string().uuid() }), 'params'),
  validateResource(querySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user!.role)
    const query = req.query as unknown as z.infer<typeof querySchema>;
    const { lang } = query;
    const id = getParam(req.params.id)

    const material = await prisma.material.findUnique({
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
      const localized = localizeMaterial(material, lang as Lang)
      let localizedTopic = material.topic
      if (material.topic?.nameJson) {
        const topicLocalized = localizeObject(material.topic, lang as Lang, { nameJson: 'name' })
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
    const isStaff = ['ADMIN', 'EDITOR'].includes(req.user!.role)
    const query = req.query as unknown as z.infer<typeof querySchema>;
    const { lang, page = '1', limit = '10' } = query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const topicId = getParam(req.params.topicId)

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where: {
          topicId: topicId,
          ...(isStaff ? {} : { status: 'Published' }),
        },
        orderBy: { createdAt: 'asc' },
        take, skip,
      }),
      prisma.material.count({
        where: {
          topicId: topicId,
          ...(isStaff ? {} : { status: 'Published' }),
        },
      }),
    ])

    const localizedMaterials = lang
      ? materials.map((m: any) => localizeMaterial(m, lang as Lang))
      : materials

    return ok(res, { data: localizedMaterials, pagination: { page: parseInt(page), limit: parseInt(limit), total } })
  })
)

export default router
