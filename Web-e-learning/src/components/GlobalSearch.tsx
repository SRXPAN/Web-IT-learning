import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, BookOpen, Trophy, FileText, Loader2 } from 'lucide-react'
import useCatalogStore from '@/store/catalog'
import { useTranslation } from '@/i18n/useTranslation'

interface SearchResult {
  id: string
  type: 'topic' | 'quiz' | 'lesson'
  title: string
  description?: string
  url: string
}

export default function GlobalSearch() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { topics } = useCatalogStore()

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const q = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search through topics
    topics.forEach(topic => {
      if (topic.name.toLowerCase().includes(q)) {
        searchResults.push({
          id: topic.id,
          type: 'topic',
          title: topic.name,
          description: `${t('search.topicWith')} ${topic.quizzes.length} ${t('search.quizzes')}`,
          url: `/materials`
        })
      }

      // Search through quizzes
      topic.quizzes.forEach(quiz => {
        if (quiz.title.toLowerCase().includes(q)) {
          searchResults.push({
            id: quiz.id,
            type: 'quiz',
            title: quiz.title,
            description: `${quiz.durationSec} ${t('common.seconds')}`,
            url: `/quiz`
          })
        }
      })
    })

    // Limit results
    setResults(searchResults.slice(0, 10))
    setLoading(false)
    setSelectedIndex(0)
  }, [topics])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Keyboard shortcut to open search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    navigate(result.url)
    setIsOpen(false)
    setQuery('')
  }

  // Keyboard navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'topic': return <BookOpen size={16} />
      case 'quiz': return <Trophy size={16} />
      case 'lesson': return <FileText size={16} />
    }
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
      >
        <Search size={16} />
        <span className="hidden lg:inline">{t('search.placeholder')}</span>
        <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-xs">⌘K</kbd>
      </button>

      {/* Mobile search button */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
      >
        <Search size={20} />
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <Search size={20} className="text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('search.fullPlaceholder')}
                className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              {loading && <Loader2 size={18} className="animate-spin text-neutral-400" />}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} className="text-neutral-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-auto">
              {results.length > 0 ? (
                <ul className="py-2">
                  {results.map((result, index) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-primary-50 dark:bg-primary-950'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          result.type === 'quiz' 
                            ? 'bg-accent-100 text-accent-600 dark:bg-accent-950 dark:text-accent-400'
                            : 'bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                        }`}>
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          {result.description && (
                            <p className="text-sm text-neutral-500 truncate">
                              {result.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400 capitalize">
                          {result.type === 'quiz' ? t('search.type.quiz') : result.type === 'topic' ? t('search.type.topic') : t('search.type.lesson')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query.trim() ? (
                <div className="py-12 text-center text-neutral-500">
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  <p>{t('search.noResults')}</p>
                  <p className="text-sm mt-1">{t('search.tryAnother')}</p>
                </div>
              ) : (
                <div className="py-8 px-4 text-center text-neutral-500">
                  <p className="text-sm">{t('search.startTyping')}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">{t('search.hint.navigation')}</span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">{t('search.hint.select')}</span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">{t('search.hint.close')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
