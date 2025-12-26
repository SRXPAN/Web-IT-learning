import { weakSpotsDatabase, tipsDatabase, WeakSpotTemplate, TipTemplate } from '@/data/weakSpots'
import { Lang } from '@/store/i18n'

const STORAGE_KEY = 'weak_spots'
const TIP_STORAGE_KEY = 'daily_tip'
const DATE_KEY = 'weak_spots_date'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function getDailySeed(): number {
  const today = getToday()
  return today.split('-').reduce((acc, num) => acc + parseInt(num), 0)
}

export function getTodayWeakSpots(): WeakSpotTemplate[] {
  const today = getToday()
  const savedDate = localStorage.getItem(DATE_KEY)
  
  if (savedDate !== today) {
    const seed = getDailySeed()
    const shuffled = [...weakSpotsDatabase]
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    // Беремо 3 рекомендації
    const selected = shuffled.slice(0, 3)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    localStorage.setItem(DATE_KEY, today)
    return selected
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function getTodayTip(): TipTemplate {
  const today = getToday()
  const saved = localStorage.getItem(TIP_STORAGE_KEY)
  
  try {
    const parsed = saved ? JSON.parse(saved) : null
    if (parsed && parsed.date === today) {
      return parsed.tip
    }
  } catch {}
  
  // Генеруємо нову пораду
  const seed = getDailySeed()
  const index = Math.floor(seededRandom(seed + 999) * tipsDatabase.length)
  const tip = tipsDatabase[index]
  
  localStorage.setItem(TIP_STORAGE_KEY, JSON.stringify({ date: today, tip }))
  return tip
}

export function getWeakSpotText(spot: WeakSpotTemplate, lang: Lang) {
  return {
    topic: spot.translations.topic[lang],
    advice: spot.translations.advice[lang]
  }
}

export function getTipText(tip: TipTemplate, lang: Lang): string {
  return tip.translations[lang]
}
