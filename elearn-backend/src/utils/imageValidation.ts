// src/utils/imageValidation.ts

/**
 * Допустимі MIME типи для зображень
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
]

/**
 * Максимальний розмір base64 рядка (приблизно 300KB зображення)
 */
const MAX_BASE64_LENGTH = 400000

/**
 * Магічні байти для визначення типу файлу
 */
const IMAGE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
}

interface ValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
}

/**
 * Валідує base64 рядок зображення
 */
export function validateImageBase64(dataUrl: string): ValidationResult {
  // Перевіряємо формат data URL
  if (!dataUrl.startsWith('data:')) {
    return { valid: false, error: 'Invalid data URL format' }
  }

  // Парсимо data URL
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) {
    return { valid: false, error: 'Invalid base64 data URL format' }
  }

  const [, mimeType, base64Data] = matches

  // Перевіряємо MIME тип
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false, error: `Invalid image type: ${mimeType}. Allowed: JPEG, PNG, GIF, WebP` }
  }

  // SVG заборонено (потенційний XSS)
  if (mimeType.includes('svg')) {
    return { valid: false, error: 'SVG images are not allowed for security reasons' }
  }

  // Перевіряємо розмір
  if (base64Data.length > MAX_BASE64_LENGTH) {
    return { valid: false, error: 'Image too large. Maximum size is approximately 300KB' }
  }

  // Декодуємо та перевіряємо магічні байти
  try {
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Перевіряємо що це не порожній файл
    if (buffer.length < 10) {
      return { valid: false, error: 'Image file is too small or empty' }
    }

    // Перевіряємо магічні байти для реального типу файлу
    const realType = detectImageType(buffer)
    if (!realType) {
      return { valid: false, error: 'Could not verify image format. File may be corrupted or invalid.' }
    }

    // Перевіряємо що заявлений тип відповідає реальному
    if (!mimeTypesMatch(mimeType, realType)) {
      return { valid: false, error: `Image type mismatch. Declared: ${mimeType}, actual: ${realType}` }
    }

    // Перевіряємо на підозрілий контент (потенційний XSS в EXIF або коментарях)
    if (containsSuspiciousContent(buffer)) {
      return { valid: false, error: 'Image contains potentially dangerous content' }
    }

    return { valid: true, mimeType: realType }
  } catch {
    return { valid: false, error: 'Failed to decode image data' }
  }
}

/**
 * Визначає тип зображення за магічними байтами
 */
function detectImageType(buffer: Buffer): string | null {
  for (const [mimeType, signature] of Object.entries(IMAGE_SIGNATURES)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      // Додаткова перевірка для WebP
      if (mimeType === 'image/webp') {
        // WebP має RIFF header, потрібно перевірити WEBP signature
        if (buffer.length >= 12 && buffer.toString('ascii', 8, 12) === 'WEBP') {
          return mimeType
        }
        continue
      }
      return mimeType
    }
  }
  return null
}

/**
 * Перевіряє чи MIME типи еквівалентні
 */
function mimeTypesMatch(declared: string, actual: string): boolean {
  // Нормалізуємо типи
  const normalizedDeclared = declared.toLowerCase().replace('jpg', 'jpeg')
  const normalizedActual = actual.toLowerCase().replace('jpg', 'jpeg')
  return normalizedDeclared === normalizedActual
}

/**
 * Перевіряє на підозрілий контент (XSS, script tags тощо)
 */
function containsSuspiciousContent(buffer: Buffer): boolean {
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000)).toLowerCase()
  
  const suspiciousPatterns = [
    '<script',
    'javascript:',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover=',
    '<?php',
    '<%',
    'eval(',
    'expression(',
  ]
  
  return suspiciousPatterns.some(pattern => content.includes(pattern))
}

/**
 * Конвертує та оптимізує base64 зображення
 * (Для майбутнього використання з sharp або подібною бібліотекою)
 */
export async function optimizeImageBase64(dataUrl: string): Promise<string> {
  // TODO: Інтегрувати sharp для оптимізації
  // const sharp = await import('sharp')
  // const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  // const optimized = await sharp(buffer).resize(200, 200).jpeg({ quality: 80 }).toBuffer()
  // return `data:image/jpeg;base64,${optimized.toString('base64')}`
  
  return dataUrl
}
