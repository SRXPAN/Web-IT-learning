import { dailyGoalsDatabase, DailyGoalTemplate } from '@/data/dailyGoals'
import { Lang } from '@/store/i18n'

const STORAGE_KEY = 'daily_goals'
const DATE_KEY = 'daily_goals_date'

export type DailyGoal = {
  id: string
  templateId: string
  done: boolean
}

function getToday(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function getDailySeed(): number {
  const today = getToday()
  return today.split('-').reduce((acc, num) => acc + parseInt(num), 0)
}

function pickWeighted<T extends { weight?: number }>(list: T[], seed: number): T | undefined {
  if (!list.length) return undefined
  const total = list.reduce((acc, item) => acc + (item.weight ?? 1), 0)
  let r = seededRandom(seed) * total
  for (const item of list) {
    r -= item.weight ?? 1
    if (r <= 0) return item
  }
  return list[list.length - 1]
}

export function generateDailyGoals(): DailyGoalTemplate[] {
  const seed = getDailySeed()
  const shuffled = [...dailyGoalsDatabase]
  
  // Fisher-Yates with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const byCategory = shuffled.reduce<Record<string, DailyGoalTemplate[]>>((acc, g) => {
    acc[g.category] = acc[g.category] || []
    acc[g.category].push(g)
    return acc
  }, {})

  const selected: DailyGoalTemplate[] = []
  const categories = Object.keys(byCategory)
  // Ensure diversity by picking one weighted goal per category until 3
  for (let i = 0; i < categories.length && selected.length < 3; i++) {
    const cat = categories[i]
    const pick = pickWeighted(byCategory[cat], seed + i * 17)
    if (pick) selected.push(pick)
  }

  // Fill remaining slots with weighted picks from remaining pool
  const remaining = shuffled.filter(g => !selected.includes(g))
  let idx = 0
  while (selected.length < 3 && idx < remaining.length) {
    const pick = pickWeighted(remaining, seed + 100 + idx)
    if (pick && !selected.includes(pick)) selected.push(pick)
    idx++
  }

  return selected
}

export function getTodayGoals(): DailyGoal[] {
  const today = getToday()
  const savedDate = localStorage.getItem(DATE_KEY)
  
  // Якщо дата змінилась, генеруємо нові цілі
  if (savedDate !== today) {
    const templates = generateDailyGoals()
    const newGoals: DailyGoal[] = templates.map(t => ({
      id: `${today}_${t.id}`,
      templateId: t.id,
      done: false,
    }))
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
    localStorage.setItem(DATE_KEY, today)
    return newGoals
  }
  
  // Повертаємо збережені цілі
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveDailyGoals(goals: DailyGoal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function getGoalText(templateId: string, lang: Lang): string {
  const template = dailyGoalsDatabase.find(t => t.id === templateId)
  return template?.translations[lang] || templateId
}
