import { memo, useCallback, useEffect, useState } from 'react'
import {
  X,
  ExternalLink,
  BookOpen,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Download,
  Maximize2,
  Clock,
  Eye,
} from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { localize } from '@/utils/localize'
import type { Lang, LocalizedString } from '@elearn/shared'
import type { Material } from './types'

interface MaterialModalProps {
  material: Material | null
  lang: Lang
  onClose: () => void
  onMarkComplete: (id: string) => void
}

export const MaterialModal = memo(function MaterialModal({
  material,
  lang,
  onClose,
  onMarkComplete,
}: MaterialModalProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [readTime, setReadTime] = useState(0)

  // Трекінг часу перегляду
  useEffect(() => {
    if (!material) return
    setIsLoading(true)
    setReadTime(0)

    const timer = setInterval(() => {
      setReadTime((prev) => prev + 1)
    }, 1000)

    // Імітація завантаження
    const loadTimer = setTimeout(() => setIsLoading(false), 500)

    return () => {
      clearInterval(timer)
      clearTimeout(loadTimer)
    }
  }, [material?.id])

  // Авто-позначка після 5 секунд
  useEffect(() => {
    if (material && readTime >= 5) {
      onMarkComplete(material.id)
    }
  }, [readTime, material, onMarkComplete])

  // ESC для закриття
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!material) return null

  const m = material
  const title = localize((m as any).titleJson as LocalizedString, m.title, lang)
  const content = localize((m as any).contentJson as LocalizedString, m.content || '', lang)

  // Іконки по типу
  const getTypeConfig = () => {
    switch (m.type) {
      case 'video':
        return {
          Icon: PlayCircle,
          color: 'text-pink-500',
          bg: 'bg-pink-50 dark:bg-pink-900/20',
          label: t('materials.video'),
        }
      case 'pdf':
        return {
          Icon: BookOpen,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          label: 'PDF',
        }
      case 'link':
        return {
          Icon: LinkIcon,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          label: t('materials.link'),
        }
      default:
        return {
          Icon: FileText,
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          label: t('materials.text'),
        }
    }
  }

  const typeConfig = getTypeConfig()
  const TypeIcon = typeConfig.Icon

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}с`
  }

  const openExternal = useCallback(() => {
    if (m.url) window.open(m.url, '_blank', 'noopener,noreferrer')
  }, [m.url])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`flex-shrink-0 p-3 rounded-xl ${typeConfig.bg}`}>
              <TypeIcon size={24} className={typeConfig.color} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} />
                  {formatTime(readTime)}
                </span>
                {readTime >= 5 && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={12} />
                    {t('materials.viewed')}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {m.url && (
              <>
                <button
                  onClick={openExternal}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                  title={t('materials.openExternal') || 'Відкрити у новій вкладці'}
                >
                  <Maximize2 size={18} />
                </button>
                {m.type === 'pdf' && (
                  <a
                    href={m.url}
                    download
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title={t('materials.download') || 'Завантажити'}
                  >
                    <Download size={18} />
                  </a>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="p-6">
              {/* Video */}
              {m.type === 'video' && m.url && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  {m.url.includes('youtube.com') || m.url.includes('youtu.be') ? (
                    <iframe
                      src={getYoutubeEmbedUrl(m.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={title}
                    />
                  ) : (
                    <video
                      src={m.url}
                      controls
                      className="w-full h-full"
                      title={title}
                    />
                  )}
                </div>
              )}

              {/* PDF */}
              {m.type === 'pdf' && m.url && (
                <div className="space-y-4">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <iframe
                      src={`${m.url}#toolbar=1&navpanes=0`}
                      className="w-full h-full"
                      title={title}
                    />
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 font-medium text-sm transition-colors"
                    >
                      <ExternalLink size={16} />
                      {t('materials.openInNewTab') || 'Відкрити у новій вкладці'}
                    </a>
                  </div>
                </div>
              )}

              {/* Link */}
              {m.type === 'link' && m.url && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="p-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                    <LinkIcon size={48} className="text-emerald-500" />
                  </div>
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('materials.externalLink') || 'Зовнішнє посилання'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('materials.externalLinkDesc') || 'Цей матеріал знаходиться на зовнішньому ресурсі'}
                    </p>
                    <code className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 break-all mb-6">
                      {m.url}
                    </code>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors"
                    >
                      <ExternalLink size={18} />
                      {t('materials.goToResource') || 'Перейти до ресурсу'}
                    </a>
                  </div>
                </div>
              )}

              {/* Text */}
              {m.type === 'text' && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {content ? (
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {content}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>{t('materials.noContent') || 'Контент недоступний'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {m.tags && m.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {m.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Eye size={16} />
            <span>{t('materials.viewTime') || 'Час перегляду'}: {formatTime(readTime)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              {t('common.close')}
            </button>
            {m.url && (
              <button
                onClick={openExternal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
              >
                <ExternalLink size={16} />
                {t('materials.openExternal') || 'Відкрити'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
})

// Утиліта для YouTube embed URL
function getYoutubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[2].length === 11 ? match[2] : null
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}
