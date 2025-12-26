import { memo, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import type { Category } from './types'
import { getCategoryLabel } from './types'
import { CategoryIcon } from './CategoryIcon'
import { useTranslation } from '@/i18n/useTranslation'
import type { Lang } from '@elearn/shared'

interface MaterialsHeaderProps {
  activeCat: Category
  categories: Map<Category, unknown[]>
  onCategoryChange: (cat: Category) => void
}

export const MaterialsHeader = memo(function MaterialsHeader({
  activeCat,
  categories,
  onCategoryChange,
}: MaterialsHeaderProps) {
  const { lang } = useTranslation()
  
  return (
    <header className="rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 px-4 sm:px-5 md:px-7 py-5 md:py-7 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-blue-600 dark:text-blue-400" />
            {getCategoryLabel(activeCat, lang as Lang)}
          </h1>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
          {(Array.from(categories.keys()) as Category[]).map((cat) => {
            const active = activeCat === cat
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  active
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700'
                }`}
              >
                <span
                  className={
                    active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                >
                  <CategoryIcon category={cat} />
                </span>
                <span className="hidden sm:inline">{getCategoryLabel(cat, lang as Lang)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
})
