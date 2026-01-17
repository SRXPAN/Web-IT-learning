import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { http as api } from '@/lib/http'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  lessonId: string
  type: string // 'TEXT' | 'VIDEO' | 'PDF' | 'link'
  material?: any // If present, Editing mode. If null, Creating mode.
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lessonId,
  type,
  material,
}) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(material?.title || material?.titleCache?.EN || '')
      setContent(material?.content || material?.url || material?.contentCache?.EN || material?.urlCache?.EN || '')
      setError(null)
    }
  }, [isOpen, material])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        topicId: lessonId,
        type: type.toUpperCase(),
        titleCache: { EN: title, UA: title, PL: title },
        ...(type.toUpperCase() === 'TEXT'
          ? { contentCache: { EN: content, UA: content, PL: content } }
          : { urlCache: { EN: content, UA: content, PL: content } }),
      }

      if (material?.id) {
        await api.put(`/editor/materials/${material.id}`, payload)
      } else {
        await api.post('/editor/materials', payload)
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save material')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose, isLoading])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {material ? t('editor.edit_material') : t('editor.add_material')}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('editor.label.title')}
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Material Title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {type.toUpperCase() === 'TEXT' ? t('editor.label.content') : t('editor.label.url')}
            </label>
            {type.toUpperCase() === 'TEXT' ? (
              <textarea
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-vertical"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter text content..."
              />
            ) : (
              <input
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://..."
              />
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MaterialModal
