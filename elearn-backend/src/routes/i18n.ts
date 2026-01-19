// src/routes/i18n.ts
import { Router } from 'express'
import { z } from 'zod'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const langSchema = z.enum(['UA', 'PL', 'EN'])

/**
 * GET /api/i18n/bundle?lang=UA
 * Returns translation bundle for specified language
 */
router.get('/bundle', async (req, res, next) => {
  try {
    const result = langSchema.safeParse(req.query.lang)
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid language',
        details: 'Supported languages: UA, PL, EN'
      })
    }

    const lang = result.data
    
    // Path to frontend translations (adjust as needed)
    const translationsPath = path.resolve(
      __dirname,
      '../../../Web-e-learning/src/i18n/locales',
      `${lang.toLowerCase()}.json`
    )

    try {
      const data = await fs.readFile(translationsPath, 'utf-8')
      const translations = JSON.parse(data)
      
      res.json({
        lang,
        translations
      })
    } catch (err) {
      // If file not found, return empty translations
      res.json({
        lang,
        translations: {}
      })
    }
  } catch (error) {
    next(error)
  }
})

export default router
