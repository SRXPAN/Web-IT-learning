import { ActivityLog, UserStats } from '@/types/activity'

const STORAGE_KEY = 'user_activity'
const SESSION_START_KEY = 'session_start'
const LAST_PING_KEY = 'last_ping'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getDaysAgo(daysBack: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysBack)
  return date.toISOString().split('T')[0]
}

export function initSession() {
  const now = Date.now()
  sessionStorage.setItem(SESSION_START_KEY, now.toString())
  sessionStorage.setItem(LAST_PING_KEY, now.toString())
}

export function getSessionTime(): number {
  const start = sessionStorage.getItem(SESSION_START_KEY)
  if (!start) return 0
  return Math.floor((Date.now() - parseInt(start)) / 1000)
}

export function updateActivity() {
  const now = Date.now()
  const lastPing = sessionStorage.getItem(LAST_PING_KEY)
  
  if (!lastPing) return
  
  const diff = Math.floor((now - parseInt(lastPing)) / 1000)
  
  // Якщо минуло більше 5 хвилин, вважаємо що користувач був неактивний
  if (diff > 300) {
    sessionStorage.setItem(LAST_PING_KEY, now.toString())
    return
  }
  
  // Оновлюємо час
  const today = getToday()
  const stats = getUserStats()
  const todayLog = stats.last7DaysActivity.find(log => log.date === today)
  
  if (todayLog) {
    todayLog.timeSpent += diff
  } else {
    stats.last7DaysActivity.push({
      date: today,
      timeSpent: diff,
      quizAttempts: 0,
      materialsViewed: 0,
      goalsMet: 0,
    })
  }
  
  // Залишаємо тільки останні 7 днів
  const sevenDaysAgo = getDaysAgo(7)
  stats.last7DaysActivity = stats.last7DaysActivity
    .filter(log => log.date >= sevenDaysAgo)
    .sort((a, b) => a.date.localeCompare(b.date))
  
  stats.lastActiveDate = today
  saveUserStats(stats)
  
  sessionStorage.setItem(LAST_PING_KEY, now.toString())
}

export function getUserStats(): UserStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {}
  
  // Дефолтні статистики
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    last7DaysActivity: [],
    lastActiveDate: '',
  }
}

export function saveUserStats(stats: UserStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function calculateStreak(): { current: number; weekDays: boolean[] } {
  const stats = getUserStats()
  const today = getToday()
  
  let streak = 0
  let checkDate = today
  const weekDays: boolean[] = []
  
  // Перевіряємо останні 7 днів
  for (let i = 0; i < 7; i++) {
    const log = stats.last7DaysActivity.find(l => l.date === checkDate)
    const isActive = log && (log.timeSpent > 0 || log.quizAttempts > 0 || log.materialsViewed > 0)
    
    weekDays.unshift(!!isActive)
    
    if (isActive) {
      streak++
    } else if (checkDate !== today) {
      // Якщо день пропущений (не сьогодні), стрік обривається
      break
    }
    
    // Переходимо на день назад
    const date = new Date(checkDate)
    date.setDate(date.getDate() - 1)
    checkDate = date.toISOString().split('T')[0]
  }
  
  // Оновлюємо статистику
  if (streak > 0) {
    stats.currentStreak = streak
    if (streak > stats.longestStreak) {
      stats.longestStreak = streak
    }
    saveUserStats(stats)
  }
  
  return { current: streak, weekDays }
}

export function getLast7DaysStats() {
  const stats = getUserStats()
  
  let totalTime = 0
  let totalAttempts = 0
  
  stats.last7DaysActivity.forEach(log => {
    totalTime += log.timeSpent
    totalAttempts += log.quizAttempts
  })
  
  return {
    timeHours: (totalTime / 3600).toFixed(1),
    attempts: totalAttempts,
  }
}

export function logQuizAttempt() {
  const today = getToday()
  const stats = getUserStats()
  const todayLog = stats.last7DaysActivity.find(log => log.date === today)
  
  if (todayLog) {
    todayLog.quizAttempts++
  } else {
    stats.last7DaysActivity.push({
      date: today,
      timeSpent: 0,
      quizAttempts: 1,
      materialsViewed: 0,
      goalsMet: 0,
    })
  }
  
  saveUserStats(stats)
}

export function logMaterialView() {
  const today = getToday()
  const stats = getUserStats()
  const todayLog = stats.last7DaysActivity.find(log => log.date === today)
  
  if (todayLog) {
    todayLog.materialsViewed++
  } else {
    stats.last7DaysActivity.push({
      date: today,
      timeSpent: 0,
      quizAttempts: 0,
      materialsViewed: 1,
      goalsMet: 0,
    })
  }
  
  saveUserStats(stats)
}

export function logGoalComplete() {
  const today = getToday()
  const stats = getUserStats()
  const todayLog = stats.last7DaysActivity.find(log => log.date === today)
  
  if (todayLog) {
    todayLog.goalsMet++
  } else {
    stats.last7DaysActivity.push({
      date: today,
      timeSpent: 0,
      quizAttempts: 0,
      materialsViewed: 0,
      goalsMet: 1,
    })
  }
  
  saveUserStats(stats)
}
