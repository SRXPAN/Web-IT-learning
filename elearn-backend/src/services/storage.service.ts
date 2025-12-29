/**
 * S3/R2 Compatible Storage Service
 * Works with AWS S3, Cloudflare R2, MinIO, etc.
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import path from 'path'

// Configuration from environment
const config = {
  endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
  region: process.env.S3_REGION || 'auto',
  accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  bucket: process.env.S3_BUCKET || 'elearn-files',
  publicUrl: process.env.S3_PUBLIC_URL || '', // For public files (CDN URL)
}

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: config.endpoint,
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  forcePathStyle: true, // Required for R2 and MinIO
})

// File categories for organized storage
export type FileCategory = 'avatars' | 'materials' | 'attachments' | 'temp'

// Generate unique file key
export function generateFileKey(category: FileCategory, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const uuid = randomUUID()
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
  return `${category}/${date}/${uuid}${ext}`
}

// Get presigned URL for upload
export async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
  expiresIn = 3600 // 1 hour
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: mimeType,
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn })
  return { url, key }
}

// Get presigned URL for download (private files)
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

// Get public URL (for public files)
export function getPublicUrl(key: string): string {
  if (config.publicUrl) {
    return `${config.publicUrl}/${key}`
  }
  // Fallback to S3 URL pattern
  return `${config.endpoint}/${config.bucket}/${key}`
}

// Delete file from storage
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  await s3Client.send(command)
}

// Allowed MIME types per category
export const allowedMimeTypes: Record<FileCategory, string[]> = {
  avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  materials: [
    'application/pdf',
    'video/mp4',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
  ],
  attachments: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'text/plain',
  ],
  temp: ['*/*'], // Allow anything for temp uploads
}

// Max file sizes per category (in bytes)
export const maxFileSizes: Record<FileCategory, number> = {
  avatars: 2 * 1024 * 1024, // 2MB
  materials: 100 * 1024 * 1024, // 100MB
  attachments: 50 * 1024 * 1024, // 50MB
  temp: 100 * 1024 * 1024, // 100MB
}

// Validate file
export function validateFile(
  category: FileCategory,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  const allowedTypes = allowedMimeTypes[category]
  const maxSize = maxFileSizes[category]

  if (!allowedTypes.includes('*/*') && !allowedTypes.includes(mimeType)) {
    return { valid: false, error: `File type ${mimeType} not allowed for ${category}` }
  }

  if (size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  }

  return { valid: true }
}

export { config as storageConfig }
