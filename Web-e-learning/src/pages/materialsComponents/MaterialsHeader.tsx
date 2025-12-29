import { memo, useState, useRef, useEffect } from 'react'
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type { Category } from './types'
import { getCategoryLabel, CAT_LABELS } from './types'
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
  const { t, lang } = useTranslation()
  const [showDropdown, setShowDropdown] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const catArray = Array.from(categories.keys()) as Category[]

  // Перевірка можливості скролу
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
      }
    }
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  // Закриття dropdown при кліку за межами
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
          setCanScrollLeft(scrollLeft > 0)
          setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
        }
      }, 300)
    }
  }

  return (
    <header className="rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Top Section */}
      <div className="px-4 sm:px-6 md:px-7 py-5 md:py-6 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('materials.title')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {catArray.length} {t('materials.categoriesAvailable') || 'категорій доступно'}
              </p>
            </div>
          </div>

          {/* Mobile Dropdown */}
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-600 dark:text-blue-400">
                  <CategoryIcon category={activeCat} />
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getCategoryLabel(activeCat, lang as Lang)}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-80 overflow-auto">
                {catArray.map((cat) => {
                  const isActive = activeCat === cat
                  const count = categories.get(cat)?.length || 0
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        onCategoryChange(cat)
                        setShowDropdown(false)
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                          <CategoryIcon category={cat} />
                        </span>
                        <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          {getCategoryLabel(cat, lang as Lang)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
                        {isActive && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Category Pills */}
      <div className="hidden sm:block relative px-4 sm:px-6 md:px-7 py-4 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={() => {
            if (scrollRef.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
              setCanScrollLeft(scrollLeft > 0)
              setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
            }
          }}
        >
          {catArray.map((cat) => {
            const isActive = activeCat === cat
            const count = categories.get(cat)?.length || 0
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
                }`}
              >
                <span className={isActive ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'}>
                  <CategoryIcon category={cat} />
                </span>
                <span>{getCategoryLabel(cat, lang as Lang)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-blue-500 text-blue-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
})
