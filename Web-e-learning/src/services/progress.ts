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
// LOCAL STORAGE SYNC
// ============================================

const LOCAL_STORAGE_KEY = 'elearn_seen_materials'
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
 * Виконує повну синхронізацію
 * @param _userId - опціональний userId (не використовується, бо авторизація через cookie)
 */
export async function performFullSync(_userId?: number | string): Promise<void> {
  const localIds = getLocalViewedMaterials()
  const serverIds = await syncProgress(localIds)
  updateLocalFromServer(serverIds)
}

/**
 * Запускає періодичну синхронізацію
 * @param _userId - опціональний userId (не використовується, бо авторизація через cookie)
 */
export function startPeriodicSync(_userId?: number | string): void {
  stopPeriodicSync()
  
  // Синхронізуємо одразу
  performFullSync()
  
  // Запускаємо періодичну синхронізацію
  syncTimeoutId = window.setInterval(performFullSync, SYNC_INTERVAL)
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
