// src/routes/dashboard.ts
import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { AppError } from '../utils/AppError.js'

const router = Router()

/**
 * GET /api/dashboard/summary?lang=EN
 * Returns dashboard data for authenticated user
 */
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const lang = (req.query.lang as string) || 'EN'

    // Get user's activity
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7
    })

    // Get quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get viewed materials
    const viewedMaterials = await prisma.materialView.findMany({
      where: { userId },
      select: { materialId: true }
    })

    // Calculate stats
    const totalTopics = await prisma.topic.count({ where: { status: 'Published' } })
    const viewedMaterialIds = new Set(viewedMaterials.map(v => v.materialId))
    
    // Calculate time spent in last 7 days
    const totalTimeSpent = activities.reduce((sum, a) => sum + a.timeSpent, 0)
    const totalQuizAttempts = activities.reduce((sum, a) => sum + a.quizAttempts, 0)

    // Streak calculation (simplified)
    const today = new Date()
    const streak = {
      current: activities.length > 0 ? Math.min(activities.length, 7) : 0,
      longest: activities.length,
      history: [true, true, false, true, true, true, false] // placeholder
    }

    // Daily goals (placeholder)
    const dailyGoals = [
      { id: '1', text: 'Complete 1 lesson', isCompleted: false },
      { id: '2', text: 'Score 80%+ on quiz', isCompleted: false },
      { id: '3', text: 'Study 30 minutes', isCompleted: false }
    ]

    // Recent topics (simplified)
    const recentTopics = await prisma.topic.findMany({
      where: { status: 'Published' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        materials: {
          select: { id: true }
        }
      }
    })

    const formattedTopics = recentTopics.map(topic => ({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      progress: 0,
      totalMaterials: topic.materials.length,
      viewedMaterials: topic.materials.filter(m => viewedMaterialIds.has(m.id)).length
    }))

    res.json({
      stats: {
        streak,
        activity: {
          timeSpent: totalTimeSpent,
          quizAttempts: totalQuizAttempts
        }
      },
      recentTopics: formattedTopics,
      dailyGoals,
      weakSpots: [],
      tipOfTheDay: 'Practice makes perfect! Keep learning every day.',
      achievements: []
    })
  } catch (error) {
    next(error)
  }
})

export default router
