// src/routes/lessons.ts
import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'
import { localizeObject } from '../utils/i18n'
import type { Lang } from '@elearn/shared'

const router = Router()

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
router.get('/', requireAuth, async (req, res) => {
  const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
  const parsed = querySchema.safeParse(req.query)
  const lang = parsed.success ? parsed.data.lang : undefined
  
  const materials = await (prisma.material.findMany as any)({
    where: isStaff ? {} : { status: 'Published' },
    orderBy: { createdAt: 'desc' },
    include: {
      topic: {
        select: { id: true, name: true, slug: true }
      }
    }
  })
  
  const localizedMaterials = lang
    ? materials.map((m: any) => localizeMaterial(m, lang))
    : materials
  
  res.json({ data: localizedMaterials })
})

// GET /lessons/:id - Get single lesson/material by ID
router.get('/:id', requireAuth, async (req, res) => {
  const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
  const parsed = querySchema.safeParse(req.query)
  const lang = parsed.success ? parsed.data.lang : undefined
  
  const material = await (prisma.material.findUnique as any)({
    where: { id: req.params.id },
    include: {
      topic: {
        select: { 
          id: true, 
          name: true, 
          nameJson: true,
          slug: true,
        }
      },
      file: true, // Include file info for pdf/video/image
    }
  })
  
  if (!material) {
    return res.status(404).json({ error: 'Lesson not found' })
  }
  
  // Check access for non-staff
  if (!isStaff && material.status !== 'Published') {
    return res.status(403).json({ error: 'Access denied' })
  }
  
  // Increment view count (fire and forget)
  prisma.material.update({
    where: { id: req.params.id },
    data: { views: { increment: 1 } }
  }).catch(() => {})
  
  // Apply localization
  if (lang && ['UA', 'PL', 'EN'].includes(lang)) {
    const localized = localizeMaterial(material, lang)
    
    // Also localize topic name if available
    let localizedTopic = material.topic
    if (material.topic?.nameJson) {
      const topicLocalized = localizeObject(material.topic, lang, { nameJson: 'name' })
      localizedTopic = { ...topicLocalized }
      delete (localizedTopic as any).nameJson
    }
    
    res.json({
      ...localized,
      topic: localizedTopic,
    })
  } else {
    res.json(material)
  }
})

// GET /lessons/by-topic/:topicId - Get lessons by topic
router.get('/by-topic/:topicId', requireAuth, async (req, res) => {
  const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'EDITOR'
  const parsed = querySchema.safeParse(req.query)
  const lang = parsed.success ? parsed.data.lang : undefined
  
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
  
  res.json({ data: localizedMaterials })
})

export default router
