// src/components/LanguageSelector.tsx
import { Globe, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import type { Lang } from '@/store/i18n'

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'pills'
  className?: string
}

const languages: { code: Lang; name: string; flag: string }[] = [
  { code: 'UA', name: 'Українська', flag: '🇺🇦' },
  { code: 'PL', name: 'Polski', flag: '🇵🇱' },
  { code: 'EN', name: 'English', flag: '🇬🇧' },
]

export default function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { t, lang, setLang } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = languages.find(l => l.code === lang) || languages[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'pills') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              lang === l.code
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span className="mr-1.5">{l.flag}</span>
            {l.code}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        aria-label={t('profile.language')}
      >
        <Globe size={18} className="text-neutral-600 dark:text-neutral-400" />
        <span className="text-sm font-medium">{current.flag} {current.code}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50 animate-in fade-in slide-in-from-top-2">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                lang === l.code ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{l.flag}</span>
                {l.name}
              </span>
              {lang === l.code && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
