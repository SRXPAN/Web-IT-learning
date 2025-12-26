// src/hooks/useApiTranslations.ts
import { useEffect, useState } from 'react'
import { useI18n } from '@/store/i18n'
import { apiGet } from '@/lib/http'

interface DailyGoal {
  id: string
  category: string
  weight: number
  text: string
}

interface WeakSpot {
  id: string
  category: string
  weight: number
  topic: string
  advice: string
}

interface Achievement {
  id: string
  code: string
  icon: string
  xpReward: number
  name: string
  description: string
}

interface ApiTranslations {
  dailyGoals: DailyGoal[]
  weakSpots: WeakSpot[]
  achievements: Achievement[]
  categories: Record<string, string>
  loading: boolean
  error: string | null
}

/**
 * Хук для завантаження перекладів з API
 * Автоматично оновлюється при зміні мови
 */
export function useApiTranslations(): ApiTranslations {
  const { lang } = useI18n()
  const [state, setState] = useState<Omit<ApiTranslations, 'loading' | 'error'>>({
    dailyGoals: [],
    weakSpots: [],
    achievements: [],
    categories: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTranslations() {
      setLoading(true)
      setError(null)

      try {
        const [goalsRes, spotsRes, achievementsRes, categoriesRes] = await Promise.all([
          apiGet<DailyGoal[]>(`/translations/daily-goals?lang=${lang}`),
          apiGet<WeakSpot[]>(`/translations/weak-spots?lang=${lang}`),
          apiGet<Achievement[]>(`/translations/achievements?lang=${lang}`),
          apiGet<Record<string, string>>(`/translations/categories?lang=${lang}`),
        ])

        if (!cancelled) {
          setState({
            dailyGoals: goalsRes,
            weakSpots: spotsRes,
            achievements: achievementsRes,
            categories: categoriesRes,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load translations')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTranslations()

    return () => {
      cancelled = true
    }
  }, [lang])

  return { ...state, loading, error }
}

/**
 * Хук для завантаження тільки щоденних цілей
 */
export function useDailyGoals() {
  const { lang } = useI18n()
  const [goals, setGoals] = useState<DailyGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<DailyGoal[]>(`/translations/daily-goals?lang=${lang}`)
      .then(setGoals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lang])

  return { goals, loading }
}

/**
 * Хук для завантаження слабких місць
 */
export function useWeakSpots() {
  const { lang } = useI18n()
  const [spots, setSpots] = useState<WeakSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<WeakSpot[]>(`/translations/weak-spots?lang=${lang}`)
      .then(setSpots)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lang])

  return { spots, loading }
}

/**
 * Хук для завантаження досягнень
 */
export function useAchievements() {
  const { lang } = useI18n()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Achievement[]>(`/translations/achievements?lang=${lang}`)
      .then(setAchievements)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lang])

  return { achievements, loading }
}

/**
 * Хук для завантаження перекладів категорій
 */
export function useCategories() {
  const { lang } = useI18n()
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Record<string, string>>(`/translations/categories?lang=${lang}`)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lang])

  return { categories, loading }
}
