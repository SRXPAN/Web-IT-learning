// src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '@elearn/shared'
import { getJwtSecret, getEnv } from '../utils/env.js'

export interface JwtPayload {
  id: string
  role: Role
  name: string
  email: string
}

declare global {
  namespace Express {
    interface Request { user?: JwtPayload }
  }
}

const SECRET = getJwtSecret()
export const COOKIE_NAME = getEnv('COOKIE_NAME', 'access')

function readToken(req: Request): string | null {
  // 1) пріоритет: cookie (HttpOnly)
  const fromCookie = req.cookies?.[COOKIE_NAME]
  if (typeof fromCookie === 'string' && fromCookie.length > 10) return fromCookie

  // 2) fallback: Authorization: Bearer ...
  const h = req.headers.authorization || ''
  const fromHeader = h.startsWith('Bearer ') ? h.slice(7) : ''
  return fromHeader || null
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded as JwtPayload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(roles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
