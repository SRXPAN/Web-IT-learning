// src/utils/logger.ts
import { isProd } from './env.js'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  error?: Error
}

/**
 * Простий структурований logger для production
 * В майбутньому можна замінити на Winston або Pino
 */
class Logger {
  private formatEntry(entry: LogEntry): string {
    const base = {
      level: entry.level,
      timestamp: entry.timestamp,
      message: entry.message,
      ...(entry.data ? { data: entry.data } : {}),
      ...(entry.error ? { 
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        }
      } : {}),
    }
    
    if (isProd()) {
      // JSON формат для production (легше парсити в Datadog/ELK)
      return JSON.stringify(base)
    }
    
    // Readable формат для development
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`
    if (entry.error) {
      return `${prefix} ${entry.message}\n${entry.error.stack}`
    }
    if (entry.data) {
      return `${prefix} ${entry.message} ${JSON.stringify(entry.data, null, 2)}`
    }
    return `${prefix} ${entry.message}`
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    }

    const formatted = this.formatEntry(entry)

    switch (level) {
      case 'debug':
        if (!isProd()) console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        // TODO: Тут можна додати Sentry
        // if (isProd() && typeof Sentry !== 'undefined') {
        //   Sentry.captureException(error || new Error(message), { extra: data })
        // }
        break
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const err = error instanceof Error ? error : undefined
    this.log('error', message, data, err)
  }

  /**
   * Логування HTTP запитів
   */
  http(method: string, path: string, statusCode: number, durationMs: number, userId?: string): void {
    this.info('HTTP Request', {
      method,
      path,
      statusCode,
      durationMs,
      userId,
    })
  }

  /**
   * Логування аудиту дій
   */
  audit(action: string, userId: string | undefined, payload: unknown): void {
    this.info(`[AUDIT] ${action}`, {
      userId,
      payload,
      action,
    })
  }
}

export const logger = new Logger()
export default logger
