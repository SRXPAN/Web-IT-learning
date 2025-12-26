import type { Request, Response, NextFunction } from 'express'

export function requireEditor(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'No token' })
  if (req.user.role === 'ADMIN' || req.user.role === 'EDITOR') return next()
  return res.status(403).json({ error: 'Forbidden' })
}