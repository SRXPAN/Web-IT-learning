// src/services/progress.ts
import { api, apiGet, apiPost } from '@/lib/http'

export interface UserStats {
  streak: number
  longestStreak: number
  lastActiveDate: string | null
  totalTimeSpent: number
  totalQuizAttempts: number
  totalMaterialsViewed: number
  last7DaysActivity: {
    date: string
    timeSpent: number
    quizAttempts: number
    materialsViewed: number
    goalsCompleted: number
  }[]
}

/**
 * Отримує список ID переглянутих матеріалів з сервера
 */
export async function fetchViewedMaterials(): Promise<string[]> {
  try {
    const data = await apiGet<{ materialIds: string[] }>('/progress/viewed')
    return data.materialIds
  } catch {
    return []
  }
}

/**
 * Позначає матеріал як переглянутий на сервері
 */
export async function markMaterialViewedOnServer(materialId: string, timeSpent?: number): Promise<void> {
  try {
    await apiPost('/progress/viewed', { materialId, timeSpent })
  } catch (e) {
    console.error('Failed to mark material as viewed:', e)
  }
}

/**
 * Синхронізує локальні дані з сервером
 */
export async function syncProgress(localMaterialIds: string[]): Promise<string[]> {
  try {
    const data = await apiPost<{ materialIds: string[] }, { materialIds: string[] }>(
      '/progress/sync', 
      { materialIds: localMaterialIds }
    )
    return data.materialIds
  } catch {
    return localMaterialIds
  }
}

/**
 * Отримує статистику користувача
 */
export async function fetchUserStats(): Promise<UserStats | null> {
  try {
    return await apiGet<UserStats>('/progress/stats')
  } catch {
    return null
  }
}

/**
 * Отримує streak
 */
export async function fetchStreak(): Promise<{ current: number; longest: number } | null> {
  try {
    return await apiGet('/progress/streak')
  } catch {
    return null
  }
}

/**
 * Логує активність (час, квіз, ціль)
 */
export async function logActivity(data: {
  timeSpent?: number
  quizAttempt?: boolean
  goalCompleted?: boolean
}): Promise<void> {
  try {
    await apiPost('/progress/activity', data)
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}

// ============================================
// SYNC API
// ============================================

interface ActivityLog {
  date: string
  timeSpent: number
  quizAttempts: number
  materialsViewed: number
  goalsMet: number
}

interface PullResponse {
  seenMaterials: string[]
  activity: ActivityLog[]
  streak: {
    current: number
    longest: number
    lastActiveDate: string | null
  }
  synced: number
}

/**
 * Push local progress to server
 */
async function pushProgress(data: {
  seenMaterials?: string[]
  activity?: ActivityLog[]
}): Promise<boolean> {
  try {
    await apiPost('/progress/push', data)
    return true
  } catch {
    return false
  }
}

/**
 * Pull all progress from server
 */
async function pullProgress(): Promise<PullResponse | null> {
  try {
    return await apiGet<PullResponse>('/progress/pull')
  } catch {
    return null
  }
}

// ============================================
// LOCAL STORAGE SYNC
// ============================================

const LOCAL_STORAGE_KEY = 'elearn_seen_materials'
const LOCAL_ACTIVITY_KEY = 'user_activity'
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 хвилин

let syncTimeoutId: number | null = null

/**
 * Отримує локальні переглянуті матеріали
 */
export function getLocalViewedMaterials(): string[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Зберігає матеріал локально
 */
export function saveLocalViewedMaterial(materialId: string): void {
  const current = getLocalViewedMaterials()
  if (!current.includes(materialId)) {
    current.push(materialId)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current))
  }
}

/**
 * Оновлює локальний список з серверного
 */
export function updateLocalFromServer(serverIds: string[]): void {
  const current = getLocalViewedMaterials()
  const merged = [...new Set([...current, ...serverIds])]
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged))
}

/**
 * Get local activity logs
 */
function getLocalActivity(): ActivityLog[] {
  try {
    const stored = localStorage.getItem(LOCAL_ACTIVITY_KEY)
    if (!stored) return []
    const stats = JSON.parse(stored)
    return stats.last7DaysActivity || []
  } catch {
    return []
  }
}

/**
 * Update local activity from server
 */
function updateLocalActivity(serverActivity: ActivityLog[]): void {
  try {
    const stored = localStorage.getItem(LOCAL_ACTIVITY_KEY)
    const stats = stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      totalTimeSpent: 0,
      last7DaysActivity: [],
      lastActiveDate: '',
    }
    
    // Merge: take max values for each date
    const merged = new Map<string, ActivityLog>()
    
    for (const log of stats.last7DaysActivity || []) {
      merged.set(log.date, log)
    }
    
    for (const log of serverActivity) {
      const existing = merged.get(log.date)
      if (existing) {
        merged.set(log.date, {
          date: log.date,
          timeSpent: Math.max(existing.timeSpent, log.timeSpent),
          quizAttempts: Math.max(existing.quizAttempts, log.quizAttempts),
          materialsViewed: Math.max(existing.materialsViewed, log.materialsViewed),
          goalsMet: Math.max(existing.goalsMet, log.goalsMet),
        })
      } else {
        merged.set(log.date, log)
      }
    }
    
    // Keep only last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = sevenDaysAgo.toISOString().split('T')[0]
    
    stats.last7DaysActivity = Array.from(merged.values())
      .filter(log => log.date >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date))
    
    localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to update local activity:', e)
  }
}

/**
 * Виконує повну синхронізацію
 * @param _userId - опціональний userId (не використовується, бо авторизація через cookie)
 */
export async function performFullSync(_userId?: number | string): Promise<void> {
  // Collect local data
  const localMaterials = getLocalViewedMaterials()
  const localActivity = getLocalActivity()
  
  // Try to push local data to server
  const pushed = await pushProgress({
    seenMaterials: localMaterials,
    activity: localActivity,
  })
  
  if (!pushed) {
    // Server unavailable - continue working locally
    console.log('Sync: server unavailable, working offline')
    return
  }
  
  // Pull latest from server
  const serverData = await pullProgress()
  
  if (serverData) {
    // Update local storage with server data
    updateLocalFromServer(serverData.seenMaterials)
    updateLocalActivity(serverData.activity)
  }
}

/**
 * Запускає періодичну синхронізацію
 * @param _userId - опціональний userId (не використовується, бо авторизація через cookie)
 */
export function startPeriodicSync(_userId?: number | string): void {
  stopPeriodicSync()
  
  // Синхронізуємо одразу
  performFullSync().catch(console.error)
  
  // Запускаємо періодичну синхронізацію
  syncTimeoutId = window.setInterval(() => {
    performFullSync().catch(console.error)
  }, SYNC_INTERVAL)
}

/**
 * Зупиняє періодичну синхронізацію
 */
export function stopPeriodicSync(): void {
  if (syncTimeoutId) {
    clearInterval(syncTimeoutId)
    syncTimeoutId = null
  }
}

/**
 * Позначає матеріал як переглянутий (локально + сервер)
 */
export async function markMaterialViewed(materialId: string, timeSpent?: number): Promise<void> {
  // Спочатку зберігаємо локально (швидко)
  saveLocalViewedMaterial(materialId)
  
  // Потім відправляємо на сервер (асинхронно)
  await markMaterialViewedOnServer(materialId, timeSpent)
}

/**
 * Перевіряє чи матеріал переглянутий (з локального кешу)
 */
export function isMaterialViewed(materialId: string): boolean {
  return getLocalViewedMaterials().includes(materialId)
}
