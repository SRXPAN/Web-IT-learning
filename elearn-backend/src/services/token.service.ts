// src/services/token.service.ts
import crypto from 'crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../db.js'
import { getJwtSecret, getEnv } from '../utils/env.js'
import type { Role } from '@elearn/shared'

const JWT_SECRET = getJwtSecret()
const ACCESS_TOKEN_EXPIRES = getEnv('ACCESS_TOKEN_EXPIRES', '15m') as SignOptions['expiresIn']
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(getEnv('REFRESH_TOKEN_EXPIRES_DAYS', '7'))

export interface JwtPayload {
  id: string
  role: Role
  name: string
  email: string
  type: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Генерує випадковий токен
 */
export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Створює access токен (короткоживучий)
 */
export function createAccessToken(user: { id: string; name: string; email: string; role: Role }): string {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  )
}

/**
 * Створює refresh токен та зберігає в БД
 */
export async function createRefreshToken(
  userId: string, 
  userAgent?: string, 
  ip?: string
): Promise<string> {
  const token = generateRandomToken(64)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
  
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      userAgent,
      ip,
      expiresAt,
    },
  })
  
  return token
}

/**
 * Створює пару токенів (access + refresh)
 */
export async function createTokenPair(
  user: { id: string; name: string; email: string; role: Role },
  userAgent?: string,
  ip?: string
): Promise<TokenPair> {
  const accessToken = createAccessToken(user)
  const refreshToken = await createRefreshToken(user.id, userAgent, ip)
  
  return { accessToken, refreshToken }
}

/**
 * Перевіряє refresh токен та повертає нову пару токенів
 */
export async function refreshTokens(
  refreshToken: string,
  userAgent?: string,
  ip?: string
): Promise<TokenPair | null> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })
  
  // Токен не знайдено або відкликано
  if (!tokenRecord || tokenRecord.revokedAt) {
    return null
  }
  
  // Токен протермінований
  if (tokenRecord.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    })
    return null
  }
  
  // Відкликаємо старий токен (token rotation)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  })
  
  // Створюємо нову пару токенів
  const user = tokenRecord.user
  return createTokenPair(
    { id: user.id, name: user.name, email: user.email, role: user.role as Role },
    userAgent,
    ip
  )
}

/**
 * Відкликає конкретний refresh токен
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/**
 * Відкликає всі refresh токени користувача (logout з усіх пристроїв)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/**
 * Верифікує access токен
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    if (payload.type !== 'access') return null
    return payload
  } catch {
    return null
  }
}

/**
 * Очищає протерміновані токени (для cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  })
  return result.count
}
