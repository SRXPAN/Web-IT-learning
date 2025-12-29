/**
 * Admin API Routes
 * User management, system settings, audit logs
 * Requires ADMIN role
 */
import { Router, Request, Response } from 'express'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { ok, created, badRequest, notFound, forbidden, serverError, conflict } from '../utils/response'
import { auditLog, AuditActions, AuditResources } from '../services/audit.service'

const prisma = new PrismaClient()
const router = Router()

// All routes require ADMIN role
router.use(requireAuth, requireRole(['ADMIN']))

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /admin/users
 * List all users with pagination and filters
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      role, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const where: any = {}
    
    if (role) {
      where.role = role as Role
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          xp: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              answers: true,
              topicsCreated: true,
              materialsCreated: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return ok(res, {
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (err) {
    console.error('List users error:', err)
    return serverError(res, 'Failed to list users')
  }
})

/**
 * GET /admin/users/:id
 * Get single user details
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            answers: true,
            topicsCreated: true,
            materialsCreated: true,
            quizzesCreated: true,
          },
        },
      },
    })

    if (!user) {
      return notFound(res, 'User not found')
    }

    return ok(res, user)
  } catch (err) {
    console.error('Get user error:', err)
    return serverError(res, 'Failed to get user')
  }
})

/**
 * PUT /admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!role || !['STUDENT', 'EDITOR', 'ADMIN'].includes(role)) {
      return badRequest(res, 'Valid role required')
    }

    // Prevent self-demotion
    if (id === req.user!.id && role !== 'ADMIN') {
      return badRequest(res, 'Cannot change own role')
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    await auditLog({
      userId: req.user!.id,
      action: AuditActions.UPDATE,
      resource: AuditResources.USER,
      resourceId: id,
      metadata: { newRole: role },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return ok(res, user)
  } catch (err) {
    console.error('Update role error:', err)
    return serverError(res, 'Failed to update role')
  }
})

/**
 * POST /admin/users
 * Create new user (admin)
 */
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name, password, role = 'STUDENT' } = req.body

    if (!email || !name || !password) {
      return badRequest(res, 'email, name, and password are required')
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return conflict(res, 'Email already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as Role,
        emailVerified: true, // Admin-created users are pre-verified
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    await auditLog({
      userId: req.user!.id,
      action: AuditActions.CREATE,
      resource: AuditResources.USER,
      resourceId: user.id,
      metadata: { email, role },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return created(res, user)
  } catch (err) {
    console.error('Create user error:', err)
    return serverError(res, 'Failed to create user')
  }
})

/**
 * DELETE /admin/users/:id
 * Delete user (soft delete - just removes access)
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Prevent self-deletion
    if (id === req.user!.id) {
      return badRequest(res, 'Cannot delete yourself')
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return notFound(res, 'User not found')
    }

    // Delete related data
    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
      prisma.answer.deleteMany({ where: { userId: id } }),
      prisma.materialView.deleteMany({ where: { userId: id } }),
      prisma.userActivity.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ])

    await auditLog({
      userId: req.user!.id,
      action: AuditActions.DELETE,
      resource: AuditResources.USER,
      resourceId: id,
      metadata: { email: user.email },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return ok(res, { deleted: true })
  } catch (err) {
    console.error('Delete user error:', err)
    return serverError(res, 'Failed to delete user')
  }
})

// ============================================
// AUDIT LOGS
// ============================================

/**
 * GET /admin/audit-logs
 * View audit logs with filters
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      userId,
      action,
      resource,
      startDate,
      endDate,
    } = req.query

    const where: any = {}

    if (userId) where.userId = userId
    if (action) where.action = action
    if (resource) where.resource = resource
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return ok(res, {
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (err) {
    console.error('List audit logs error:', err)
    return serverError(res, 'Failed to list audit logs')
  }
})

// ============================================
// STATISTICS
// ============================================

/**
 * GET /admin/stats
 * Get system statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      usersByRole,
      totalTopics,
      totalMaterials,
      totalQuizzes,
      totalQuestions,
      totalFiles,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.topic.count(),
      prisma.material.count(),
      prisma.quiz.count(),
      prisma.question.count(),
      prisma.file.count({ where: { confirmed: true } }),
      prisma.userActivity.findMany({
        where: {
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: {
          date: true,
          timeSpent: true,
          quizAttempts: true,
          materialsViewed: true,
        },
      }),
    ])

    // Aggregate recent activity by date
    const activityByDate = recentActivity.reduce<Record<string, { timeSpent: number; quizAttempts: number; materialsViewed: number }>>((acc, curr) => {
      const date = curr.date.toISOString().slice(0, 10)
      if (!acc[date]) {
        acc[date] = { timeSpent: 0, quizAttempts: 0, materialsViewed: 0 }
      }
      acc[date].timeSpent += curr.timeSpent
      acc[date].quizAttempts += curr.quizAttempts
      acc[date].materialsViewed += curr.materialsViewed
      return acc
    }, {})

    return ok(res, {
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce<Record<string, number>>((acc, curr) => {
          acc[curr.role] = curr._count
          return acc
        }, {}),
      },
      content: {
        topics: totalTopics,
        materials: totalMaterials,
        quizzes: totalQuizzes,
        questions: totalQuestions,
        files: totalFiles,
      },
      activity: {
        last7days: activityByDate,
      },
    })
  } catch (err) {
    console.error('Get stats error:', err)
    return serverError(res, 'Failed to get stats')
  }
})

export default router
