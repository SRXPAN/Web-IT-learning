// src/utils/logger.ts
import { isProd } from './env.js'
import winston from 'winston'

const { combine, timestamp, printf, colorize, json } = winston.format

// Human-readable dev formatter
const devFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 2)}` : ''
    return `[${level.toUpperCase()}] ${timestamp} ${message}${metaStr}`
  })
)

// JSON formatter for prod
const prodFormat = combine(timestamp(), json())

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProd() ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
  ],
  exitOnError: false,
})

// Convenience methods mirroring previous API
export default logger

export function httpLog(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: string
): void {
  logger.info('HTTP Request', { method, path, statusCode, durationMs, userId })
}

export function auditLog(action: string, userId: string | undefined, payload: unknown): void {
  logger.info('[AUDIT] ' + action, { userId, payload, action })
}
