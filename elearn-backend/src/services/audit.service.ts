/**
 * Audit Log Service
 * Tracks all important actions in the system
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogEntry {
  userId?: string
  action: string // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW
  resource: string // user, topic, material, quiz, file
  resourceId?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
}

export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        metadata: entry.metadata || {},
        ip: entry.ip?.replace('::ffff:', ''), // Remove IPv4-mapped prefix
        userAgent: entry.userAgent?.slice(0, 500), // Limit length
      },
    })
  } catch (error) {
    // Don't throw - audit logging shouldn't break main functionality
    console.error('Audit log error:', error)
  }
}

// Helper for common actions
export const AuditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW: 'VIEW',
  PUBLISH: 'PUBLISH',
  UNPUBLISH: 'UNPUBLISH',
  UPLOAD: 'UPLOAD',
  DOWNLOAD: 'DOWNLOAD',
} as const

export const AuditResources = {
  USER: 'user',
  TOPIC: 'topic',
  MATERIAL: 'material',
  QUIZ: 'quiz',
  QUESTION: 'question',
  FILE: 'file',
  TRANSLATION: 'translation',
  SETTINGS: 'settings',
} as const
