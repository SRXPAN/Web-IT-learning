import { memo, useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { http as api } from '@/lib/http'
import { useTranslation } from '@/i18n/useTranslation'

type Lang = 'EN' | 'UA' | 'PL'

interface MaterialData {
  id?: string
  title: string
  type: 'VIDEO' | 'TEXT' | 'pdf' | 'link'
  url?: string | null
  content?: string | null
  titleCache?: Record<string, string> | null
  urlCache?: Record<string, string> | null
  contentCache?: Record<string, string> | null
}

interface AdminMaterialModalProps {
  material?: MaterialData | null
  lessonId: string
  preselectedType?: 'VIDEO' | 'TEXT' | 'pdf' | 'link'
  onClose: () => void
  onSave?: () => void
}

interface MaterialFormState {
  EN: { title: string; url: string; content: string }
  UA: { title: string; url: string; content: string }
  PL: { title: string; url: string; content: string }
  type: 'VIDEO' | 'TEXT'
}

const ERROR_MESSAGES = {
  invalidUrl: (lang: Lang, url: string) => `Invalid URL for ${lang}: ${url}`,
  saveFailed: 'Failed to save material. Please try again.',
  titleRequired: 'Title required in English and Ukrainian'
} as const

export const AdminMaterialModal = memo(function AdminMaterialModal({
  material,
  lessonId,
  preselectedType,
  onClose,
  onSave,
}: AdminMaterialModalProps) {
  const { t } = useTranslation()
  const [activeLang, setActiveLang] = useState<Lang>('EN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine if we're in edit mode
  const isEditMode = !!material?.id

  // Initialize form state
  const [formData, setFormData] = useState<MaterialFormState>({
    EN: { title: '', url: '', content: '' },
    UA: { title: '', url: '', content: '' },
    PL: { title: '', url: '', content: '' },
    type: (preselectedType as 'VIDEO' | 'TEXT') || material?.type as 'VIDEO' | 'TEXT' || 'VIDEO'
  })

  // Load material data if editing
  useEffect(() => {
    if (material) {
      setFormData({
        EN: {
          title: material.titleCache?.EN || material.title || '',
          url: material.urlCache?.EN || material.url || '',
          content: material.contentCache?.EN || material.content || ''
        },
        UA: {
          title: material.titleCache?.UA || '',
          url: material.urlCache?.UA || '',
          content: material.contentCache?.UA || ''
        },
        PL: {
          title: material.titleCache?.PL || '',
          url: material.urlCache?.PL || '',
          content: material.contentCache?.PL || ''
        },
        type: (material.type?.toUpperCase() === 'VIDEO' || material.type?.toUpperCase() === 'TEXT') 
          ? material.type.toUpperCase() as 'VIDEO' | 'TEXT'
          : 'VIDEO'
      })
    }
  }, [material])

  // URL validation helper
  const isValidUrl = (str: string) => {
    if (!str) return true // Empty is OK
    try { 
      new URL(str)
      return true
    } catch(e) { 
      return false
    }
  }

  // Helper to update specific field for active language
  const updateField = (field: 'title' | 'url' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [field]: value }
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Validation
    if (!formData.EN.title || !formData.UA.title) {
      setError(ERROR_MESSAGES.titleRequired)
      return
    }

    // Validate URLs for all languages
    const langs: Lang[] = ['EN', 'UA', 'PL']
    for (const lang of langs) {
      const url = formData[lang].url
      if (url && !isValidUrl(url)) {
        setError(ERROR_MESSAGES.invalidUrl(lang, url))
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        type: formData.type,
        titleEN: formData.EN.title,
        linkEN: formData.EN.url,
        contentEN: formData.EN.content,
        titleUA: formData.UA.title,
        linkUA: formData.UA.url,
        contentUA: formData.UA.content,
        titlePL: formData.PL.title,
        linkPL: formData.PL.url,
        contentPL: formData.PL.content,
      }

      if (isEditMode && material?.id) {
        // Update existing material
        await api.put(`/editor/materials/${material.id}`, payload)
      } else {
        // Create new material
        await api.post(`/editor/topics/${lessonId}/materials`, {
          ...payload,
          topicId: lessonId
        })
      }

      onSave?.()
      onClose()
    } catch (err) {
      setError(ERROR_MESSAGES.saveFailed)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Determine modal title
  const modalTitle = isEditMode 
    ? t('editor.edit_material')
    : (preselectedType 
      ? `${t('editor.add_material')} - ${preselectedType === 'VIDEO' ? t('materials.video') : preselectedType === 'TEXT' ? t('materials.text') : preselectedType}`
      : t('editor.add_material'))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Language Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit">
              {(['EN', 'UA', 'PL'] as Lang[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLang(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeLang === lang
                      ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {lang === 'EN' ? '🇬🇧 EN' : lang === 'UA' ? '🇺🇦 UA' : '🇵🇱 PL'}
                </button>
              ))}
            </div>

            {/* Material Type - Only show if not preselected and not editing */}
            {!preselectedType && !isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('editor.label.type')}
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'VIDEO' | 'TEXT' }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="VIDEO">{t('materials.video')}</option>
                  <option value="TEXT">{t('materials.text')}</option>
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('editor.label.title')} ({activeLang}) *
              </label>
              <input
                type="text"
                value={formData[activeLang].title}
                onChange={e => updateField('title', e.target.value)}
                placeholder={activeLang === 'UA' ? 'Назва матеріалу...' : 'Material title...'}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formData.type === 'VIDEO' ? `${t('materials.video')} URL` : `${t('materials.link')}`} ({activeLang})
              </label>
              <input
                type="url"
                value={formData[activeLang].url}
                onChange={e => updateField('url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a specific link for <b>{activeLang}</b> users. If empty, EN link will be used.
              </p>
            </div>

            {/* Content (for TEXT type only) */}
            {formData.type === 'TEXT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('editor.label.content')} ({activeLang})
                </label>
                <textarea
                  value={formData[activeLang].content}
                  onChange={e => updateField('content', e.target.value)}
                  rows={8}
                  placeholder={activeLang === 'UA' ? 'Текст матеріалу...' : 'Material content...'}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? t('common.saving') : t('editor.save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})
