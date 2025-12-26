// src/routes/auth.ts
import { Router } from 'express'
import { prisma } from '../db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { COOKIE_NAME } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimit.js'
import { setCsrfToken } from '../middleware/csrf.js'
import { emailSchema, passwordSchemaSimple, nameSchema } from '../utils/validation.js'
import { getJwtSecret } from '../utils/env.js'
import { getCookieOptions, getClearCookieOptions } from '../utils/cookie.js'
import type { User, Role } from '@elearn/shared'

const router = Router()
const SECRET = getJwtSecret()

// Bcrypt cost factor - вище = безпечніше, але повільніше
const BCRYPT_ROUNDS = 12

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchemaSimple,
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

function signUser(user: { id: string; name: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '7d' }
  )
}

// GET /api/auth/csrf — отримати CSRF токен
router.get('/csrf', setCsrfToken)

// GET /api/auth/me — повертає поточного користувача по cookie/JWT (БЕЗ ліміту)
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'No token' })
    
    const payload = jwt.verify(token, SECRET) as { id: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, xp: true, avatar: true },
    })
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const { name, email, password } = parsed.data

    // Перевірка на існуючого користувача
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      // Не розкриваємо, чи email існує - загальне повідомлення
      return res.status(400).json({ error: 'Registration failed. Please try again.' })
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await prisma.user.create({
      data: { name: name.trim(), email, password: hash, role: 'STUDENT' },
      select: { id: true, name: true, email: true, role: true, xp: true },
    })

    const token = signUser(user)
    res.cookie(COOKIE_NAME, token, getCookieOptions())
    res.json({ user })
  } catch (e) { next(e) }
})

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp }
    const token = signUser(payload)

    res.cookie(COOKIE_NAME, token, getCookieOptions())
    res.json({ user: payload })
  } catch (e) { next(e) }
})

router.post('/logout', async (_req, res) => {
  res.clearCookie(COOKIE_NAME, getClearCookieOptions())
  res.json({ ok: true })
})

// PUT /api/auth/password — змінити пароль
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchemaSimple,
})

router.put('/password', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    
    const payload = jwt.verify(token, SECRET) as { id: string }
    const parsed = changePasswordSchema.safeParse(req.body)
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const { currentPassword, newPassword } = parsed.data
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, password: true }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    res.json({ ok: true, message: 'Password changed successfully' })
  } catch (e) { next(e) }
})

// GET /api/auth/leaderboard — топ користувачів по XP
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        xp: true,
        createdAt: true,
      }
    })
    
    // Calculate rank and add badges based on XP
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      level: Math.floor(user.xp / 100) + 1,
      badges: getBadges(user.xp),
    }))
    
    res.json(leaderboard)
  } catch (e) { next(e) }
})

// Helper to determine badges based on XP
function getBadges(xp: number): string[] {
  const badges: string[] = []
  if (xp >= 10) badges.push('first_steps')
  if (xp >= 50) badges.push('rising_star')
  if (xp >= 100) badges.push('dedicated_learner')
  if (xp >= 250) badges.push('quiz_master')
  if (xp >= 500) badges.push('expert')
  if (xp >= 1000) badges.push('legend')
  return badges
}

// PUT /api/auth/email — змінити email
const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

router.put('/email', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    
    const payload = jwt.verify(token, SECRET) as { id: string }
    const parsed = changeEmailSchema.safeParse(req.body)
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const { newEmail, password } = parsed.data
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, password: true, email: true }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect password' })
    }
    
    // Check if new email already exists
    if (newEmail !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email: newEmail } })
      if (exists) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }
    
    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
      select: { id: true, name: true, email: true, role: true, xp: true, avatar: true }
    })
    
    // Issue new token with updated email
    const newToken = signUser(updatedUser)
    res.cookie(COOKIE_NAME, newToken, getCookieOptions())
    
    res.json({ ok: true, message: 'Email changed successfully', user: updatedUser })
  } catch (e) { next(e) }
})

// POST /api/auth/avatar — завантажити аватар (base64)
const avatarSchema = z.object({
  avatar: z.string().max(500000, 'Avatar too large'), // Max ~370KB base64
})

router.post('/avatar', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    
    const payload = jwt.verify(token, SECRET) as { id: string }
    const parsed = avatarSchema.safeParse(req.body)
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const { avatar } = parsed.data
    
    // Validate that it's a proper data URL
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' })
    }
    
    // Update avatar
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: { avatar },
      select: { id: true, name: true, email: true, role: true, xp: true, avatar: true }
    })
    
    res.json({ ok: true, user: updatedUser })
  } catch (e) { next(e) }
})

// DELETE /api/auth/avatar — видалити аватар
router.delete('/avatar', async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    
    const payload = jwt.verify(token, SECRET) as { id: string }
    
    // Remove avatar
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: { avatar: null },
      select: { id: true, name: true, email: true, role: true, xp: true, avatar: true }
    })
    
    res.json({ ok: true, user: updatedUser })
  } catch (e) { next(e) }
})

export default router
