// src/routes/progress.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { z } from 'zod'
import { prisma } from '../db.js'
import {
  markMaterialViewed,
  getViewedMaterialIds,
  isMaterialViewed,
  updateDailyActivity,
  getRecentActivity,
  calculateStreak,
  getUserStats,
  syncViewedMaterials,
} from '../services/progress.service.js'

const router = Router()

// GET /api/progress/viewed — отримати список переглянутих матеріалів
router.get('/viewed', requireAuth, async (req, res, next) => {
  try {
    const materialIds = await getViewedMaterialIds(req.user!.id)
    res.json({ materialIds })
  } catch (e) { next(e) }
})

// POST /api/progress/viewed — позначити матеріал як переглянутий
const markViewedSchema = z.object({
  materialId: z.string().min(1),
  timeSpent: z.number().int().min(0).optional(),
})

router.post('/viewed', requireAuth, async (req, res, next) => {
  try {
    const parsed = markViewedSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }
    
    await markMaterialViewed(req.user!.id, parsed.data.materialId, parsed.data.timeSpent)
    
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// GET /api/progress/viewed/:materialId — перевірити чи матеріал переглянутий
router.get('/viewed/:materialId', requireAuth, async (req, res, next) => {
  try {
    const viewed = await isMaterialViewed(req.user!.id, req.params.materialId)
    res.json({ viewed })
  } catch (e) { next(e) }
})

// POST /api/progress/sync — синхронізувати локальні дані з сервером
const syncSchema = z.object({
  materialIds: z.array(z.string()),
})

router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    const parsed = syncSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }
    
    const allViewed = await syncViewedMaterials(req.user!.id, parsed.data.materialIds)
    
    res.json({ materialIds: allViewed })
  } catch (e) { next(e) }
})

// GET /api/progress/stats — отримати статистику користувача
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const stats = await getUserStats(req.user!.id)
    res.json(stats)
  } catch (e) { next(e) }
})

// GET /api/progress/streak — отримати streak
router.get('/streak', requireAuth, async (req, res, next) => {
  try {
    const streak = await calculateStreak(req.user!.id)
    res.json(streak)
  } catch (e) { next(e) }
})

// POST /api/progress/visit — записати відвідування (для streak)
router.post('/visit', requireAuth, async (req, res, next) => {
  try {
    // Просто записуємо що користувач був активний сьогодні
    await updateDailyActivity(req.user!.id, { timeSpent: 1 })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// GET /api/progress/activity — отримати активність за останні дні
router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 7, 30)
    const activity = await getRecentActivity(req.user!.id, days)
    res.json(activity)
  } catch (e) { next(e) }
})

// POST /api/progress/activity — оновити активність
const activitySchema = z.object({
  timeSpent: z.number().int().min(0).optional(),
  quizAttempt: z.boolean().optional(),
  goalCompleted: z.boolean().optional(),
})

router.post('/activity', requireAuth, async (req, res, next) => {
  try {
    const parsed = activitySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }
    
    await updateDailyActivity(req.user!.id, {
      timeSpent: parsed.data.timeSpent,
      quizAttempts: parsed.data.quizAttempt ? 1 : 0,
      goalsCompleted: parsed.data.goalCompleted ? 1 : 0,
    })
    
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// GET /api/progress/recent-topics — отримати останні переглянуті теми
router.get('/recent-topics', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 2, 10)
    
    // Отримуємо останні переглянуті матеріали
    const recentViews = await prisma.materialView.findMany({
      where: { userId: req.user!.id },
      orderBy: { viewedAt: 'desc' },
      take: 50, // Беремо більше, щоб знайти унікальні теми
      select: {
        materialId: true,
        viewedAt: true,
      },
    })
    
    if (recentViews.length === 0) {
      return res.json({ topics: [] })
    }
    
    // Отримуємо матеріали з їх темами
    const materials = await prisma.material.findMany({
      where: {
        id: { in: recentViews.map(v => v.materialId) },
      },
      select: {
        id: true,
        title: true,
        topic: {
          select: {
            id: true,
            name: true,
            nameJson: true,
            slug: true,
            _count: {
              select: { materials: true },
            },
          },
        },
      },
    })
    
    // Групуємо по темах та рахуємо прогрес
    const topicMap = new Map<string, {
      id: string
      name: string
      nameJson: Record<string, string> | null
      slug: string
      lastViewedAt: Date
      totalMaterials: number
      viewedMaterials: number
    }>()
    
    // Отримуємо всі переглянуті матеріали користувача для підрахунку прогресу
    const allViewedIds = new Set(await getViewedMaterialIds(req.user!.id))
    
    for (const view of recentViews) {
      const material = materials.find(m => m.id === view.materialId)
      if (!material || !material.topic) continue
      
      const topic = material.topic
      if (!topicMap.has(topic.id)) {
        // Рахуємо скільки матеріалів цієї теми користувач переглянув
        const topicMaterials = await prisma.material.findMany({
          where: { topicId: topic.id },
          select: { id: true },
        })
        const viewedCount = topicMaterials.filter(m => allViewedIds.has(m.id)).length
        
        topicMap.set(topic.id, {
          id: topic.id,
          name: topic.name,
          nameJson: topic.nameJson as Record<string, string> | null,
          slug: topic.slug,
          lastViewedAt: view.viewedAt,
          totalMaterials: topic._count.materials,
          viewedMaterials: viewedCount,
        })
      }
      
      if (topicMap.size >= limit) break
    }
    
    // Конвертуємо в масив та сортуємо по останньому перегляду
    const topics = Array.from(topicMap.values())
      .sort((a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime())
      .map(t => ({
        id: t.id,
        name: t.name,
        nameJson: t.nameJson,
        slug: t.slug,
        progress: t.totalMaterials > 0 
          ? Math.round((t.viewedMaterials / t.totalMaterials) * 100) 
          : 0,
        totalMaterials: t.totalMaterials,
        viewedMaterials: t.viewedMaterials,
      }))
    
    res.json({ topics })
  } catch (e) { next(e) }
})

export default router
