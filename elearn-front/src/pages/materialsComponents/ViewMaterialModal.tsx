import { memo, useEffect } from 'react'
import { X, ExternalLink, FileText, Video, Link as LinkIcon, BookOpen } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import type { Material } from './types'

interface ViewMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  material: Material | null
}

export const ViewMaterialModal = memo(function ViewMaterialModal({
  isOpen,
  onClose,
  material,
}: ViewMaterialModalProps) {
  const { t } = useTranslation()

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !material) return null

  const url = material.url || material.content || ''
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const isVimeo = url.includes('vimeo.com')

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  // Extract Vimeo video ID
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : null
  }

  const getIcon = () => {
    switch (material.type) {
      case 'video': return <Video size={20} />
      case 'pdf': return <FileText size={20} />
      case 'link': return <LinkIcon size={20} />
      case 'text': return <BookOpen size={20} />
      default: return <FileText size={20} />
    }
  }

  const renderContent = () => {
    switch (material.type) {
      case 'video':
        if (isYouTube) {
          const videoId = getYouTubeId(url)
          return (
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title={material.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )
        }
        if (isVimeo) {
          const videoId = getVimeoId(url)
          return (
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                title={material.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )
        }
        // For direct video URLs
        return (
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <video
              src={url}
              controls
              className="w-full h-full"
              title={material.title}
            >
              {t('common.videoNotSupported', 'Your browser does not support the video tag.')}
            </video>
          </div>
        )

      case 'pdf':
        return (
          <div className="w-full h-[70vh] bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden">
            <iframe
              src={`${url}#toolbar=1&navpanes=0`}
              title={material.title}
              className="w-full h-full"
            />
          </div>
        )

      case 'link':
        // For external links, show in iframe if possible, otherwise show link
        return (
          <div className="space-y-4">
            <div className="w-full h-[60vh] bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden">
              <iframe
                src={url}
                title={material.title}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
            <div className="flex justify-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ExternalLink size={16} />
                {t('common.openInNewTab', 'Open in new tab')}
              </a>
            </div>
          </div>
        )

      case 'text':
      default:
        return (
          <div className="prose prose-neutral dark:prose-invert max-w-none p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-[70vh] overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: url || material.content || '' }} />
          </div>
        )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex items-center justify-center">
        <div
          className="relative w-full max-w-5xl max-h-full bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shrink-0">
                {getIcon()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white truncate">
                  {material.title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                  {material.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shrink-0"
              aria-label={t('common.close', 'Close')}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {renderContent()}
          </div>

          {/* Footer with external link option */}
          {url && material.type !== 'text' && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
              <div className="flex justify-end">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ExternalLink size={16} />
                  {t('common.openInNewTab', 'Open in new tab')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
})
