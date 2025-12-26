// src/routes/translations.ts
import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'
import { z } from 'zod'
import type { Lang } from '@elearn/shared'

const router = Router()

// GET /api/translations/ui?lang=UA
// Отримати всі UI переклади для мови (з JSON поля translations)
router.get('/ui', async (req, res) => {
  const lang = (req.query.lang as Lang) || 'EN'
  
  const translations = await prisma.uiTranslation.findMany({
    select: { key: true, translations: true }
  })
  
  // Конвертуємо в об'єкт {key: value}
  const result = translations.reduce((acc, t) => {
    const trans = t.translations as Record<string, string>
    acc[t.key] = trans?.[lang] || trans?.['EN'] || t.key
    return acc
  }, {} as Record<string, string>)
  
  res.json(result)
})

// GET /api/translations/daily-goals?lang=UA
// Отримати всі шаблони щоденних цілей
router.get('/daily-goals', async (req, res) => {
  const lang = (req.query.lang as Lang) || 'EN'
  
  const goals = await prisma.dailyGoalTemplate.findMany({
    where: { isActive: true },
    select: { id: true, category: true, weight: true, translations: true }
  })
  
  // Локалізуємо
  const localized = goals.map(g => ({
    id: g.id,
    category: g.category,
    weight: g.weight,
    text: (g.translations as Record<string, string>)?.[lang] || 
          (g.translations as Record<string, string>)?.['EN'] || ''
  }))
  
  res.json(localized)
})

// GET /api/translations/weak-spots?lang=UA
router.get('/weak-spots', async (req, res) => {
  const lang = (req.query.lang as Lang) || 'EN'
  
  const spots = await prisma.weakSpotTemplate.findMany({
    where: { isActive: true },
    select: { id: true, category: true, weight: true, translations: true }
  })
  
  const localized = spots.map(s => {
    const trans = s.translations as { topic?: Record<string, string>, advice?: Record<string, string> }
    return {
      id: s.id,
      category: s.category,
      weight: s.weight,
      topic: trans?.topic?.[lang] || trans?.topic?.['EN'] || '',
      advice: trans?.advice?.[lang] || trans?.advice?.['EN'] || ''
    }
  })
  
  res.json(localized)
})

// GET /api/translations/achievements?lang=UA
router.get('/achievements', async (req, res) => {
  const lang = (req.query.lang as Lang) || 'EN'
  
  const achievements = await prisma.achievementTemplate.findMany({
    where: { isActive: true },
    select: { id: true, code: true, icon: true, xpReward: true, translations: true }
  })
  
  const localized = achievements.map(a => {
    const trans = a.translations as { name?: Record<string, string>, description?: Record<string, string> }
    return {
      id: a.id,
      code: a.code,
      icon: a.icon,
      xpReward: a.xpReward,
      name: trans?.name?.[lang] || trans?.name?.['EN'] || a.code,
      description: trans?.description?.[lang] || trans?.description?.['EN'] || ''
    }
  })
  
  res.json(localized)
})

// GET /api/translations/categories?lang=UA
router.get('/categories', async (req, res) => {
  const lang = (req.query.lang as Lang) || 'EN'
  
  const categories = await prisma.categoryTranslation.findMany({
    select: { category: true, translations: true }
  })
  
  const result = categories.reduce((acc, c) => {
    const trans = c.translations as Record<string, string>
    acc[c.category] = trans?.[lang] || trans?.['EN'] || c.category
    return acc
  }, {} as Record<string, string>)
  
  res.json(result)
})

// ============================================
// ADMIN ENDPOINTS для управління перекладами
// ============================================

const uiTranslationSchema = z.object({
  key: z.string().min(1),
  translations: z.object({
    UA: z.string(),
    PL: z.string(),
    EN: z.string(),
  })
})

// POST /api/translations/ui - створити/оновити UI переклад
router.post('/ui', requireAuth, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  const parsed = uiTranslationSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  
  const { key, translations } = parsed.data
  
  const translation = await prisma.uiTranslation.upsert({
    where: { key },
    update: { translations },
    create: { key, translations }
  })
  
  res.json(translation)
})

// POST /api/translations/ui/bulk - масове створення перекладів
router.post('/ui/bulk', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const schema = z.object({
    translations: z.array(uiTranslationSchema)
  })
  
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  
  const results = await Promise.all(
    parsed.data.translations.map(t =>
      prisma.uiTranslation.upsert({
        where: { key: t.key },
        update: { translations: t.translations },
        create: { key: t.key, translations: t.translations }
      })
    )
  )
  
  res.json({ created: results.length })
})

// DELETE /api/translations/ui/:key - видалити всі переклади по ключу
router.delete('/ui/:key', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  await prisma.uiTranslation.deleteMany({
    where: { key: req.params.key }
  })
  
  res.json({ success: true })
})

export default router
