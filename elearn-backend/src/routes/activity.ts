// src/routes/activity.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/activity/ping
 * Track user activity (simple heartbeat)
 */
router.post('/ping', requireAuth, async (req, res) => {
  // In a real app, you might update lastActiveAt or log activity
  // For now, just acknowledge the ping
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

export default router
