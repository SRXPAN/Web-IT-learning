// src/services/progress.service.ts
import { prisma } from '../db.js'

/**
 * Позначає матеріал як переглянутий
 */
export async function markMaterialViewed(
  userId: string, 
  materialId: string,
  timeSpent?: number
): Promise<void> {
  await prisma.materialView.upsert({
    where: {
      userId_materialId: { userId, materialId },
    },
    create: {
      userId,
      materialId,
      timeSpent,
    },
    update: {
      viewedAt: new Date(),
      timeSpent: timeSpent ? { increment: timeSpent } : undefined,
    },
  })
  
  // Оновлюємо активність за сьогодні
  await updateDailyActivity(userId, { materialsViewed: 1 })
}

/**
 * Отримує список ID переглянутих матеріалів користувача
 */
export async function getViewedMaterialIds(userId: string): Promise<string[]> {
  const views = await prisma.materialView.findMany({
    where: { userId },
    select: { materialId: true },
  })
  return views.map(v => v.materialId)
}

/**
 * Перевіряє чи матеріал переглянутий
 */
export async function isMaterialViewed(userId: string, materialId: string): Promise<boolean> {
  const view = await prisma.materialView.findUnique({
    where: { userId_materialId: { userId, materialId } },
  })
  return !!view
}

/**
 * Отримує статистику переглядів для матеріалів
 */
export async function getMaterialViewStats(materialIds: string[]): Promise<Record<string, number>> {
  const stats = await prisma.materialView.groupBy({
    by: ['materialId'],
    where: { materialId: { in: materialIds } },
    _count: { materialId: true },
  })
  
  return Object.fromEntries(stats.map(s => [s.materialId, s._count.materialId]))
}

/**
 * Оновлює щоденну активність користувача
 */
export async function updateDailyActivity(
  userId: string,
  updates: {
    timeSpent?: number
    quizAttempts?: number
    materialsViewed?: number
    goalsCompleted?: number
  }
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  await prisma.userActivity.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    create: {
      userId,
      date: today,
      timeSpent: updates.timeSpent ?? 0,
      quizAttempts: updates.quizAttempts ?? 0,
      materialsViewed: updates.materialsViewed ?? 0,
      goalsCompleted: updates.goalsCompleted ?? 0,
    },
    update: {
      timeSpent: updates.timeSpent ? { increment: updates.timeSpent } : undefined,
      quizAttempts: updates.quizAttempts ? { increment: updates.quizAttempts } : undefined,
      materialsViewed: updates.materialsViewed ? { increment: updates.materialsViewed } : undefined,
      goalsCompleted: updates.goalsCompleted ? { increment: updates.goalsCompleted } : undefined,
    },
  })
}

/**
 * Отримує активність за останні N днів
 */
export async function getRecentActivity(userId: string, days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)
  
  const activities = await prisma.userActivity.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  })
  
  return activities
}

/**
 * Обчислює streak (серію днів активності)
 */
export async function calculateStreak(userId: string): Promise<{
  current: number
  longest: number
  lastActiveDate: Date | null
}> {
  const activities = await prisma.userActivity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  })
  
  if (activities.length === 0) {
    return { current: 0, longest: 0, lastActiveDate: null }
  }
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastActivityDate = new Date(activities[0].date)
  lastActivityDate.setHours(0, 0, 0, 0)
  
  // Перевіряємо чи є активність сьогодні або вчора
  const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 1) {
    // Streak перервано
    currentStreak = 0
  } else {
    // Рахуємо поточний streak
    currentStreak = 1
    for (let i = 1; i < activities.length; i++) {
      const prevDate = new Date(activities[i - 1].date)
      const currDate = new Date(activities[i].date)
      prevDate.setHours(0, 0, 0, 0)
      currDate.setHours(0, 0, 0, 0)
      
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diff === 1) {
        currentStreak++
        tempStreak++
      } else {
        break
      }
    }
  }
  
  // Знаходимо найдовший streak
  tempStreak = 1
  for (let i = 1; i < activities.length; i++) {
    const prevDate = new Date(activities[i - 1].date)
    const currDate = new Date(activities[i].date)
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)
    
    const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, currentStreak)
  
  return {
    current: currentStreak,
    longest: longestStreak,
    lastActiveDate: activities[0]?.date ?? null,
  }
}

/**
 * Отримує повну статистику користувача
 */
export async function getUserStats(userId: string) {
  const [streak, recentActivity, totalViewed] = await Promise.all([
    calculateStreak(userId),
    getRecentActivity(userId, 7),
    prisma.materialView.count({ where: { userId } }),
  ])
  
  const totalTimeSpent = recentActivity.reduce((sum, a) => sum + a.timeSpent, 0)
  const totalQuizAttempts = recentActivity.reduce((sum, a) => sum + a.quizAttempts, 0)
  
  return {
    streak: streak.current,
    longestStreak: streak.longest,
    lastActiveDate: streak.lastActiveDate,
    totalTimeSpent,
    totalQuizAttempts,
    totalMaterialsViewed: totalViewed,
    last7DaysActivity: recentActivity,
  }
}

/**
 * Синхронізує локальні дані з сервером
 */
export async function syncViewedMaterials(
  userId: string, 
  localMaterialIds: string[]
): Promise<string[]> {
  // Отримуємо те, що вже є на сервері
  const serverViewed = await getViewedMaterialIds(userId)
  const serverSet = new Set(serverViewed)
  
  // Знаходимо нові локальні матеріали
  const newLocal = localMaterialIds.filter(id => !serverSet.has(id))
  
  // Додаємо нові на сервер
  if (newLocal.length > 0) {
    await prisma.materialView.createMany({
      data: newLocal.map(materialId => ({ userId, materialId })),
      skipDuplicates: true,
    })
  }
  
  // Повертаємо повний список
  const allViewed = [...new Set([...serverViewed, ...newLocal])]
  return allViewed
}
