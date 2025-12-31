/**
 * Reusable Pagination Component
 * Used across all admin pages with pagination
 */
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages} ({totalItems} {t('common.total')})
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
