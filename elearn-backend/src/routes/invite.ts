// src/routes/invite.ts
import { Router } from 'express'
import { prisma } from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { COOKIE_NAME } from '../middleware/auth'
import { getJwtSecret } from '../utils/env.js'
import { getCookieOptions } from '../utils/cookie.js'

const router = Router()
const SECRET = getJwtSecret()

const acceptSchema = z.object({
  token: z.string().min(10),
  name: z.string().min(2),
  password: z.string().min(6),
})

router.post('/accept', async (req, res) => {
  const parsed = acceptSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { token, name, password } = parsed.data

  const inv = await prisma.inviteToken.findUnique({ where: { token } })
  if (!inv || inv.used || inv.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired token' })

  const exists = await prisma.user.findUnique({ where: { email: inv.email } })
  if (exists) return res.status(409).json({ error: 'User already exists' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email: inv.email, name, password: hash, role: 'STUDENT' },
    select: { id: true, name: true, email: true, role: true, xp: true },
  })

  await prisma.inviteToken.update({ where: { token }, data: { used: true } })

  const jwtToken = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' })
  res.cookie(COOKIE_NAME, jwtToken, getCookieOptions())
  res.json({ user })
})

export default router
