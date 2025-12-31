import { create } from 'zustand'
import { fetchTopicsTree, type TopicTree, type Lang } from '@/services/topics'
import { fetchQuiz, type Quiz } from '@/services/quiz'

type CatalogState = {
  topics: TopicTree[]
  topicsLoading: boolean
  topicsError?: string
  topicsLang?: Lang // Track which lang was used to load
  quizMap: Record<string, Quiz>
  quizLoading: Record<string, boolean>
  quizError: Record<string, string | undefined>
  loadTopics: (lang?: Lang) => Promise<void>
  loadQuiz: (id: string, lang?: Lang) => Promise<Quiz>
  invalidateTopics: () => void
  invalidateQuiz: (id: string) => void
  invalidateAll: () => void
}

const useCatalogStore = create<CatalogState>((set, get) => ({
  topics: [],
  topicsLoading: false,
  topicsError: undefined,
  topicsLang: undefined,
  quizMap: {},
  quizLoading: {},
  quizError: {},
  
  async loadTopics(lang) {
    // Reload if lang changed or no topics
    const state = get()
    if (state.topicsLoading) return
    if (state.topics.length && state.topicsLang === lang) return
    
    set({ topicsLoading: true, topicsError: undefined })
    try {
      const data = await fetchTopicsTree(lang ? { lang } : undefined)
      set({ topics: data, topicsLoading: false, topicsLang: lang })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load topics'
      set({ topicsLoading: false, topicsError: message })
      throw e
    }
  },
  
  async loadQuiz(id, lang) {
    // Create cache key with lang
    const cacheKey = lang ? `${id}_${lang}` : id
    const cached = get().quizMap[cacheKey]
    if (cached) return cached
    
    set((s) => ({ quizLoading: { ...s.quizLoading, [id]: true }, quizError: { ...s.quizError, [id]: undefined } }))
    try {
      const q = await fetchQuiz(id, lang)
      set((s) => ({ quizMap: { ...s.quizMap, [cacheKey]: q }, quizLoading: { ...s.quizLoading, [id]: false } }))
      return q
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load quiz'
      set((s) => ({ quizLoading: { ...s.quizLoading, [id]: false }, quizError: { ...s.quizError, [id]: message } }))
      throw e
    }
  },
  
  // Інвалідація кешу
  invalidateTopics() {
    set({ topics: [], topicsError: undefined, topicsLang: undefined })
  },
  
  invalidateQuiz(id) {
    set((s) => {
      // Remove all cached versions of this quiz (with any lang suffix)
      const newMap = { ...s.quizMap }
      Object.keys(newMap).forEach(key => {
        if (key === id || key.startsWith(`${id}_`)) {
          delete newMap[key]
        }
      })
      return { quizMap: newMap }
    })
  },
  
  invalidateAll() {
    set({ 
      topics: [], 
      topicsError: undefined,
      topicsLang: undefined,
      quizMap: {},
      quizError: {},
    })
  },
}))

export default useCatalogStore
