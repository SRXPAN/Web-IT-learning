/**
 * Admin Files Management Page
 * View and manage uploaded files
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { apiGet, apiDelete } from '@/lib/http'
import {
  FolderOpen,
  Search,
  Trash2,
  Download,
  Image,
  FileText,
  File,
  Film,
  Music,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
} from 'lucide-react'
import { Loading } from '@/components/Loading'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface FileRecord {
  id: string
  originalName: string
  mimeType: string
  size: number
  category: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'SIGNED'
  createdAt: string
  uploadedBy?: {
    id: string
    name: string
    email: string
  }
}

interface FilesResponse {
  files: FileRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const categoryColors: Record<string, string> = {
  avatar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  material: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  attachment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Film
  if (mimeType.startsWith('audio/')) return Music
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
  return File
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export default function AdminFiles() {
  const { t } = useTranslation()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<FileRecord | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchFiles = useCallback(async (params?: {
    page?: number
    limit?: number
    category?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', params.page.toString())
      if (params?.limit) query.set('limit', params.limit.toString())
      if (params?.category) query.set('category', params.category)

      const response = await apiGet<FilesResponse>(`/files?${query}`)
      setFiles(response.files)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiDelete(`/files/${deleteConfirm.id}`)
      fetchFiles({ page: pagination.page, category: categoryFilter })
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await apiGet<{ url: string }>(`/files/${fileId}`)
      // Open download link
      const link = document.createElement('a')
      link.href = response.url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file')
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  if (loading && files.length === 0) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FolderOpen className="w-7 h-7 mr-3" />
            {t('admin.files')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('admin.filesDescription')} ({pagination.total} {t('common.total')})
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            fetchFiles({ page: 1, category: e.target.value })
          }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">{t('admin.allCategories')}</option>
          <option value="avatar">{t('admin.avatars')}</option>
          <option value="material">{t('admin.materials')}</option>
          <option value="attachment">{t('admin.attachments')}</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const FileIcon = getFileIcon(file.mimeType)

          return (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FileIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[file.category] || categoryColors.other}`}>
                      {file.category}
                    </span>
                  </div>
                  {file.uploadedBy && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {t('admin.uploadedBy')}: {file.uploadedBy.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleDownload(file.id, file.originalName)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  {t('common.download')}
                </button>
                <button
                  onClick={() => setDeleteConfirm(file)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {files.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FolderOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">{t('admin.noFilesFound')}</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.page')} {pagination.page} {t('common.of')} {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchFiles({ page: pagination.page - 1, category: categoryFilter })}
              disabled={pagination.page <= 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchFiles({ page: pagination.page + 1, category: categoryFilter })}
              disabled={pagination.page >= pagination.pages}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title={t('admin.deleteFile')}
          description={`${t('admin.deleteFileConfirm').replace('{name}', deleteConfirm.originalName)}`}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={handleDelete}
          onClose={() => setDeleteConfirm(null)}
          variant="danger"
        />
      )}
    </div>
  )
}
