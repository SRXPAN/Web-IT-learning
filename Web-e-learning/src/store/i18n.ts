import { create } from 'zustand'
import type { Lang } from '@elearn/shared'

// Re-export Lang type for backward compatibility
export type { Lang }

type State = { lang: Lang }
type Actions = { setLang: (lang: Lang) => void }

const key = 'elearn_lang'

export const useI18n = create<State & Actions>((set) => {
  const stored = (localStorage.getItem(key) as Lang | null) || 'UA'
  return {
    lang: stored,
    setLang: (lang: Lang) => {
      localStorage.setItem(key, lang)
      set({ lang })
    }
  }
})
