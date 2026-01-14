// src/routes/auth.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../db.js'
import { requireAuth, COOKIE_NAME, REFRESH_COOKIE_NAME } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { setCsrfToken } from '../middleware/csrf.js'
import { 
  emailSchema, 
  passwordSchemaSimple, 
  nameSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  changeEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  avatarSchema,
  resendVerificationEmailSchema,
  updateProfileSchema,
} from '../utils/validation.js'
import { 
  getAccessCookieOptions, 
  getRefreshCookieOptions,
  getClearCookieOptions, 
  getClearRefreshCookieOptions 
} from '../utils/cookie.js'
import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
  logoutAllDevices,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../services/auth.service.js'
import { validateImageBase64 } from '../utils/imageValidation.js'
import { logger } from '../utils/logger.js'
import { deleteFile } from '../services/storage.service.js'
import bcrypt from 'bcryptjs'
const router = Router()

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(COOKIE_NAME, accessToken, getAccessCookieOptions())
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAME, getClearCookieOptions())
  res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshCookieOptions())
}

function getClientInfo(req: Request): { userAgent?: string; ip?: string } {
  const forwardedFor = req.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor) 
    ? forwardedFor[0] 
    : forwardedFor?.split(',')[0]
  
  return {
    userAgent: req.headers['user-agent'],
    ip: req.ip || forwardedIp,
  }
}

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

// ============================================
// AUTH ROUTES
// ============================================

/**
 * @openapi
 * /api/auth/csrf:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get CSRF token
 *     description: Returns a CSRF token that must be included in all mutating requests
 *     responses:
 *       200:
 *         description: CSRF token generated successfully
 *         headers:
 *           X-CSRF-Token:
 *             schema:
 *               type: string
 *             description: CSRF token to include in subsequent requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */
router.get('/csrf', setCsrfToken)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Returns the currently authenticated user's profile information
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   enum: [STUDENT, EDITOR, ADMIN]
 *                 xp:
 *                   type: integer
 *                 avatarId:
 *                   type: string
 *                   nullable: true
 *                 emailVerified:
 *                   type: boolean
 *                 avatarFile:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     key:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        xp: true, 
        avatarId: true,
        emailVerified: true,
        avatarFile: { select: { id: true, key: true, mimeType: true } },
      },
    })
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json(user)
  } catch (e) { next(e) }
})

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new student account with email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Authentication cookies (elearn_token, elearn_refresh_token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please verify your email.
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many registration attempts
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }
    
    const { userAgent, ip } = getClientInfo(req)
    
    const result = await registerUser(parsed.data, userAgent, ip)
    
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)
    
    res.json({ 
      user: result.user,
      message: 'Registration successful. Please verify your email.',
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'User with this email already exists') {
      return res.status(400).json({ error: 'Registration failed. Please try again.' })
    }
    next(e)
  }
})

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: Authenticate a user and receive access/refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Authentication cookies (elearn_token, elearn_refresh_token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['first_steps', 'rising_star']
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }
    
    const { userAgent, ip } = getClientInfo(req)
    
    const result = await loginUser(parsed.data, userAgent, ip)
    
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)
    
    res.json({ user: result.user })
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    next(e)
  }
})

// POST /api/auth/refresh — оновити токени
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }
    
    const { userAgent, ip } = getClientInfo(req)
    
    const tokens = await refreshUserTokens(refreshToken, userAgent, ip)
    
    if (!tokens) {
      clearAuthCookies(res)
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }
    
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// POST /api/auth/logout — вихід
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
    
    if (refreshToken) {
      await logoutUser(refreshToken)
    }
    
    clearAuthCookies(res)
    
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// POST /api/auth/logout-all — вихід з усіх пристроїв
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await logoutAllDevices(req.user!.id)
    
    clearAuthCookies(res)
    
    res.json({ ok: true, message: 'Logged out from all devices' })
  } catch (e) { next(e) }
})

// ============================================
// PASSWORD ROUTES
// ============================================

// PUT /api/auth/password — змінити пароль
router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    await changePassword(req.user!.id, parsed.data.currentPassword, parsed.data.newPassword)
    
    res.json({ ok: true, message: 'Password changed successfully' })
  } catch (e) {
    if (e instanceof Error && e.message === 'Current password is incorrect') {
      return res.status(400).json({ error: 'Incorrect current password' })
    }
    next(e)
  }
})

// POST /api/auth/forgot-password — запит на скидання паролю
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    await requestPasswordReset(parsed.data.email)
    
    // Завжди повертаємо успіх щоб не розкривати існування email
    res.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  } catch (e) { next(e) }
})

// POST /api/auth/reset-password — скидання паролю за токеном
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const success = await resetPassword(parsed.data.token, parsed.data.password)
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }
    
    res.json({ ok: true, message: 'Password has been reset successfully' })
  } catch (e) { next(e) }
})

// ============================================
// EMAIL VERIFICATION ROUTES
// ============================================

// POST /api/auth/verify-email — верифікація email
router.post('/verify-email', async (req, res, next) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const success = await verifyEmail(parsed.data.token)
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired verification token' })
    }
    
    res.json({ ok: true, message: 'Email verified successfully' })
  } catch (e) { next(e) }
})

// POST /api/auth/resend-verification — повторне відправлення верифікації
router.post('/resend-verification', requireAuth, authLimiter, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, emailVerified: true },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' })
    }
    
    await resendVerificationEmail(user.email)
    
    res.json({ ok: true, message: 'Verification email sent' })
  } catch (e) { next(e) }
})

// ============================================
// EMAIL & PROFILE ROUTES
// ============================================

// PUT /api/auth/email — змінити email
router.put('/email', requireAuth, async (req, res, next) => {
  try {
    const parsed = changeEmailSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }
    
    const { newEmail, password } = parsed.data
    const userId = req.user!.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect password' })
    }
    
    if (newEmail.toLowerCase() !== user.email.toLowerCase()) {
      const exists = await prisma.user.findUnique({ where: { email: newEmail.toLowerCase() } })
      if (exists) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        email: newEmail.toLowerCase(),
        emailVerified: false, // Потрібна повторна верифікація
      },
      select: { 
        id: true, name: true, email: true, role: true, xp: true, 
        avatarId: true, emailVerified: true,
        avatarFile: { select: { id: true, key: true, mimeType: true } }
      },
    })
    
    // Відправляємо новий verification email
    await resendVerificationEmail(newEmail.toLowerCase())
    
    logger.audit(userId, 'user.email_changed', { oldEmail: user.email, newEmail })
    
    res.json({ 
      ok: true, 
      message: 'Email changed. Please verify your new email address.', 
      user: updatedUser 
    })
  } catch (e) { next(e) }
})

// POST /api/auth/avatar — завантажити аватар (deprecated - use /files API instead)
router.post('/avatar', requireAuth, async (req, res, next) => {
  try {
    const { fileId } = req.body
    
    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required. Use /files/presign-upload first.' })
    }
    
    // Verify file exists and is owned by user
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })
    
    if (!file || file.uploadedById !== req.user!.id) {
      return res.status(400).json({ error: 'Invalid file' })
    }

    // Get current user with avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { avatarFile: true }
    })

    // If new avatar is different from old one, delete old file from S3
    if (fileId && currentUser?.avatarId && fileId !== currentUser.avatarId) {
      if (currentUser.avatarFile?.key) {
        deleteFile(currentUser.avatarFile.key).catch(err => 
          logger.error('Failed to cleanup old avatar:', err)
        )
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarId: fileId },
      select: { 
        id: true, name: true, email: true, role: true, xp: true, 
        avatarId: true, emailVerified: true,
        avatarFile: { select: { id: true, key: true, mimeType: true } }
      },
    })
    
    res.json({ ok: true, user: updatedUser })
  } catch (e) { next(e) }
})

// DELETE /api/auth/avatar — видалити аватар
router.delete('/avatar', requireAuth, async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarId: null },
      select: { 
        id: true, name: true, email: true, role: true, xp: true, 
        avatarId: true, emailVerified: true,
        avatarFile: { select: { id: true, key: true, mimeType: true } }
      },
    })
    
    res.json({ ok: true, user: updatedUser })
  } catch (e) { next(e) }
})

// ============================================
// LEADERBOARD
// ============================================

// GET /api/auth/leaderboard — топ користувачів
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
        avatarId: true,
        avatarFile: { select: { id: true, key: true, mimeType: true } },
        createdAt: true,
      },
    })
    
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      level: Math.floor(user.xp / 100) + 1,
      badges: getBadges(user.xp),
    }))
    
    res.json(leaderboard)
  } catch (e) { next(e) }
})

export default router
