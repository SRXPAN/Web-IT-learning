/**
 * File Upload Hook
 * Handles S3/R2 presigned URL uploads
 */
import { useState, useCallback } from 'react'
import { apiPost, apiGet, apiDelete } from '@/lib/http'

interface PresignResponse {
  fileId: string
  uploadUrl: string
  key: string
}

interface FileInfo {
  id: string
  url: string
  originalName: string
  mimeType: string
  size: number
}

interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

type FileCategory = 'avatars' | 'materials' | 'attachments'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (
    file: File,
    category: FileCategory = 'attachments'
  ): Promise<FileInfo | null> => {
    setUploading(true)
    setError(null)
    setProgress(null)

    try {
      // Step 1: Get presigned URL
      const presign = await apiPost<PresignResponse>('/files/presign-upload', {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        category,
      })

      // Step 2: Upload directly to S3/R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress({
              loaded: e.loaded,
              total: e.total,
              percent: Math.round((e.loaded / e.total) * 100),
            })
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('PUT', presign.uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // Step 3: Confirm upload
      const fileInfo = await apiPost<FileInfo>('/files/confirm', {
        fileId: presign.fileId,
      })

      setProgress({ loaded: file.size, total: file.size, percent: 100 })
      return fileInfo
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const getFile = useCallback(async (fileId: string): Promise<FileInfo | null> => {
    try {
      return await apiGet<FileInfo>(`/files/${fileId}`)
    } catch {
      return null
    }
  }, [])

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      await apiDelete(`/files/${fileId}`)
      return true
    } catch {
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(null)
    setError(null)
  }, [])

  return {
    upload,
    getFile,
    deleteFile,
    uploading,
    progress,
    error,
    reset,
  }
}
