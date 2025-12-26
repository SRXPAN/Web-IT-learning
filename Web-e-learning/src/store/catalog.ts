import { create } from 'zustand'
import { fetchTopicsTree, type TopicTree } from '@/services/topics'
import { fetchQuiz, type Quiz } from '@/services/quiz'

type CatalogState = {
  topics: TopicTree[]
  topicsLoading: boolean
  topicsError?: string
  quizMap: Record<string, Quiz>
  quizLoading: Record<string, boolean>
  quizError: Record<string, string | undefined>
  loadTopics: () => Promise<void>
  loadQuiz: (id: string) => Promise<Quiz>
  invalidateTopics: () => void
  invalidateQuiz: (id: string) => void
  invalidateAll: () => void
}

const useCatalogStore = create<CatalogState>((set, get) => ({
  topics: [],
  topicsLoading: false,
  topicsError: undefined,
  quizMap: {},
  quizLoading: {},
  quizError: {},
  
  async loadTopics() {
    if (get().topicsLoading || get().topics.length) return
    set({ topicsLoading: true, topicsError: undefined })
    try {
      const data = await fetchTopicsTree()
      set({ topics: data, topicsLoading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load topics'
      set({ topicsLoading: false, topicsError: message })
      throw e
    }
  },
  
  async loadQuiz(id) {
    const cached = get().quizMap[id]
    if (cached) return cached
    set((s) => ({ quizLoading: { ...s.quizLoading, [id]: true }, quizError: { ...s.quizError, [id]: undefined } }))
    try {
      const q = await fetchQuiz(id)
      set((s) => ({ quizMap: { ...s.quizMap, [id]: q }, quizLoading: { ...s.quizLoading, [id]: false } }))
      return q
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load quiz'
      set((s) => ({ quizLoading: { ...s.quizLoading, [id]: false }, quizError: { ...s.quizError, [id]: message } }))
      throw e
    }
  },
  
  // Інвалідація кешу
  invalidateTopics() {
    set({ topics: [], topicsError: undefined })
  },
  
  invalidateQuiz(id) {
    set((s) => {
      const { [id]: _, ...rest } = s.quizMap
      return { quizMap: rest }
    })
  },
  
  invalidateAll() {
    set({ 
      topics: [], 
      topicsError: undefined,
      quizMap: {},
      quizError: {},
    })
  },
}))

export default useCatalogStore
