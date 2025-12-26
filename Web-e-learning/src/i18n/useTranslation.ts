import { useI18n } from '@/store/i18n'
import { translations, t as localTranslate } from './translations'
import { create } from 'zustand'
import { useEffect } from 'react'
import { apiGet } from '@/lib/http'

// Store for API translations
type TranslationsState = {
  data: Record<string, Record<string, string>>
  loading: boolean
  error: string | null
  fetchTranslations: (lang: string) => Promise<void>
}

export const useTranslationsStore = create<TranslationsState>((set, get) => ({
  data: {},
  loading: false,
  error: null,
  fetchTranslations: async (lang: string) => {
    // Skip if already loaded for this language
    if (get().data[lang]) return
    
    set({ loading: true, error: null })
    try {
      const response = await apiGet<Record<string, string>>(`/translations/ui?lang=${lang}`)
      set(state => ({
        data: { ...state.data, [lang]: response },
        loading: false
      }))
    } catch (err) {
      console.warn('Failed to load translations from API, using local fallback')
      set({ loading: false, error: 'Failed to load translations' })
    }
  }
}))

export function useTranslation() {
  const { lang } = useI18n()
  const { data, fetchTranslations } = useTranslationsStore()
  
  // Load translations on mount and when lang changes
  useEffect(() => {
    fetchTranslations(lang)
  }, [lang, fetchTranslations])
  
  const t = (key: Parameters<typeof localTranslate>[0]): string => {
    // Try API translations first
    const apiTranslations = data[lang]
    if (apiTranslations?.[key]) {
      return apiTranslations[key]
    }
    
    // Fallback to local translations
    return localTranslate(key, lang)
  }
  
  return { t, lang }
}

// Hook to preload all translations
export function usePreloadTranslations() {
  const { fetchTranslations } = useTranslationsStore()
  
  useEffect(() => {
    // Preload all languages
    fetchTranslations('UA')
    fetchTranslations('PL')
    fetchTranslations('EN')
  }, [fetchTranslations])
}
