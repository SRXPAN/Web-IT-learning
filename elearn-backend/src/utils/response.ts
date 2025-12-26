// src/utils/response.ts
import { Response } from 'express'

/**
 * Стандартизований формат успішної відповіді
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

/**
 * Стандартизований формат помилки
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * Типи API відповідей
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

/**
 * Коди помилок
 */
export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Permission errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // CSRF
  CSRF_INVALID: 'CSRF_INVALID',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Хелпер для успішної відповіді
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: SuccessResponse['meta']
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  }
  
  if (meta) {
    response.meta = meta
  }
  
  return res.status(statusCode).json(response)
}

/**
 * Хелпер для помилки
 */
export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode = 400,
  details?: Record<string, unknown>
): Response {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  }
  
  if (details) {
    response.error.details = details
  }
  
  return res.status(statusCode).json(response)
}

// Shortcut helpers

export const ok = <T>(res: Response, data: T) => 
  sendSuccess(res, data, 200)

export const created = <T>(res: Response, data: T) => 
  sendSuccess(res, data, 201)

export const noContent = (res: Response) => 
  res.status(204).send()

export const badRequest = (res: Response, message: string, details?: Record<string, unknown>) =>
  sendError(res, ErrorCodes.VALIDATION_ERROR, message, 400, details)

export const unauthorized = (res: Response, code: ErrorCode = ErrorCodes.UNAUTHORIZED, message = 'Unauthorized') =>
  sendError(res, code, message, 401)

export const forbidden = (res: Response, message = 'Forbidden') =>
  sendError(res, ErrorCodes.FORBIDDEN, message, 403)

export const notFound = (res: Response, message = 'Not found') =>
  sendError(res, ErrorCodes.NOT_FOUND, message, 404)

export const conflict = (res: Response, message: string) =>
  sendError(res, ErrorCodes.ALREADY_EXISTS, message, 409)

export const tooManyRequests = (res: Response, message = 'Too many requests') =>
  sendError(res, ErrorCodes.RATE_LIMITED, message, 429)

export const serverError = (res: Response, message = 'Internal server error') =>
  sendError(res, ErrorCodes.INTERNAL_ERROR, message, 500)

/**
 * Pagination helper для списків
 */
export function paginate<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number
): Response {
  return sendSuccess(res, items, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}
