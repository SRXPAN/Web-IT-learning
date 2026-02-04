// src/routes/activity.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { updateDailyActivity } from '../services/progress.service.js'

const router = Router()

/**
 * POST /api/activity/ping
 * Track user activity (heartbeat every 60 seconds)
 * Each ping = 60 seconds of activity time
 */
router.post('/ping', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id
    
    // Each ping represents 60 seconds of active time
    await updateDailyActivity(userId, { timeSpent: 60 })
    
    res.json({ ok: true, timestamp: new Date().toISOString() })
  } catch (error) {
    // Don't fail the request on tracking errors
    console.error('Activity ping error:', error)
    res.json({ ok: true, timestamp: new Date().toISOString() })
  }
})

export default router
