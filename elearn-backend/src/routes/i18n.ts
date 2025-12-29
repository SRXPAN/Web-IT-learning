// src/routes/i18n.ts
import { Router } from 'express'
import { prisma } from '../db.js'
import { z } from 'zod'
import crypto from 'crypto'
import type { Lang } from '@elearn/shared'
import { logger } from '../utils/logger.js'

const router = Router()

// ============================================
// SCHEMAS
// ============================================

const bundleSchema = z.object({
  lang: z.enum(['UA', 'PL', 'EN']).default('EN'),
  ns: z.string().optional(), // "common,auth,quiz" - comma separated
})

const missingKeysSchema = z.object({
  keys: z.array(z.string()).max(100),
  lang: z.enum(['UA', 'PL', 'EN']).optional(),
})

// ============================================
// HELPERS
// ============================================

function generateETag(lang: string, versions: { namespace: string; version: number }[]): string {
  const versionStr = versions.map(v => `${v.namespace}:${v.version}`).sort().join('|')
  return crypto.createHash('md5').update(`${lang}-${versionStr}`).digest('hex').slice(0, 16)
}

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/i18n/bundle?lang=UA&ns=common,auth,quiz
 * 
 * Повертає всі UI переклади для вказаної мови.
 * Підтримує:
 * - ETag кешування (304 Not Modified)
 * - Namespace фільтрацію
 * - Fallback на EN якщо переклад відсутній
 */
router.get('/bundle', async (req, res) => {
  try {
    const parsed = bundleSchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid params', details: parsed.error.flatten() })
    }
    
    const { lang, ns } = parsed.data
    const namespaces = ns?.split(',').map(s => s.trim()).filter(Boolean) || []
    
    // Отримуємо версії для ETag
    const versions = await prisma.translationVersion.findMany({
      where: namespaces.length ? { namespace: { in: namespaces } } : {},
      select: { namespace: true, version: true },
    })
    
    // Якщо версій немає - створюємо дефолтну
    if (versions.length === 0) {
      versions.push({ namespace: 'common', version: 1 })
    }
    
    const etag = `"${generateETag(lang, versions)}"`
    
    // Перевіряємо If-None-Match для кешування
    const clientEtag = req.headers['if-none-match']
    if (clientEtag === etag) {
      return res.status(304).end()
    }
    
    // Отримуємо переклади
    const where = namespaces.length ? { namespace: { in: namespaces } } : {}
    const translations = await prisma.uiTranslation.findMany({
      where,
      select: { key: true, translations: true },
    })
    
    // Формуємо bundle з fallback на EN
    const bundle = translations.reduce((acc, t) => {
      const trans = t.translations as Record<string, string>
      // Пріоритет: запитана мова → EN → ключ
      acc[t.key] = trans?.[lang] || trans?.['EN'] || t.key
      return acc
    }, {} as Record<string, string>)
    
    // Встановлюємо кеш заголовки
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60') // 5 хв кеш
    res.setHeader('Vary', 'Accept-Language')
    
    res.json({
      lang,
      version: etag.replace(/"/g, ''),
      count: Object.keys(bundle).length,
      namespaces: namespaces.length ? namespaces : ['all'],
      translations: bundle,
    })
  } catch (err) {
    logger.error('Failed to get i18n bundle', err as Error)
    res.status(500).json({ error: 'Failed to load translations' })
  }
})

/**
 * GET /api/i18n/version?ns=common,auth
 * 
 * Повертає версії namespace-ів для швидкої перевірки актуальності кешу
 */
router.get('/version', async (req, res) => {
  try {
    const ns = req.query.ns as string | undefined
    const namespaces = ns?.split(',').map(s => s.trim()).filter(Boolean) || []
    
    const versions = await prisma.translationVersion.findMany({
      where: namespaces.length ? { namespace: { in: namespaces } } : {},
      select: { namespace: true, version: true, updatedAt: true },
    })
    
    const result = versions.reduce((acc, v) => {
      acc[v.namespace] = { version: v.version, updatedAt: v.updatedAt }
      return acc
    }, {} as Record<string, { version: number; updatedAt: Date }>)
    
    res.json(result)
  } catch (err) {
    logger.error('Failed to get i18n versions', err as Error)
    res.status(500).json({ error: 'Failed to load versions' })
  }
})

/**
 * POST /api/i18n/missing
 * 
 * Логує відсутні ключі перекладів (для моніторингу)
 * Фронтенд відправляє ключі, яких немає в bundle
 */
router.post('/missing', async (req, res) => {
  try {
    const parsed = missingKeysSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body' })
    }
    
    const { keys, lang } = parsed.data
    
    // Логуємо для аналізу
    if (keys.length > 0) {
      logger.warn('[i18n] Missing translation keys', { 
        keys: keys.slice(0, 20), // Обмежуємо лог
        lang: lang || 'unknown',
        count: keys.length,
      })
    }
    
    res.json({ received: keys.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to report missing keys' })
  }
})

/**
 * GET /api/i18n/keys
 * 
 * Повертає всі ключі (для генерації TypeScript типів)
 */
router.get('/keys', async (_req, res) => {
  try {
    const keys = await prisma.uiTranslation.findMany({
      select: { key: true, namespace: true, description: true },
      orderBy: { key: 'asc' },
    })
    
    res.json(keys)
  } catch (err) {
    logger.error('Failed to get i18n keys', err as Error)
    res.status(500).json({ error: 'Failed to load keys' })
  }
})

export default router
