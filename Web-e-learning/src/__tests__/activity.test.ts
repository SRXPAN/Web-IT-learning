import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  initSession, 
  getSessionTime, 
  getUserStats, 
  saveUserStats,
  getLast7DaysStats,
} from '@/utils/activity'

describe('activity utils', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initSession', () => {
    it('initializes session with current timestamp', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      
      initSession()
      
      expect(sessionStorage.getItem('session_start')).toBe(now.toString())
      expect(sessionStorage.getItem('last_ping')).toBe(now.toString())
    })
  })

  describe('getSessionTime', () => {
    it('returns 0 when no session started', () => {
      expect(getSessionTime()).toBe(0)
    })

    it('returns elapsed seconds since session start', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      initSession()
      
      // Advance time by 60 seconds
      vi.setSystemTime(now + 60000)
      
      expect(getSessionTime()).toBe(60)
    })
  })

  describe('getUserStats', () => {
    it('returns default stats when nothing saved', () => {
      const stats = getUserStats()
      
      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        last7DaysActivity: [],
        lastActiveDate: '',
      })
    })

    it('returns saved stats', () => {
      const customStats = {
        currentStreak: 5,
        longestStreak: 10,
        totalTimeSpent: 3600,
        last7DaysActivity: [],
        lastActiveDate: '2024-01-15',
      }
      saveUserStats(customStats)
      
      expect(getUserStats()).toEqual(customStats)
    })

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('user_activity', 'invalid json{')
      
      const stats = getUserStats()
      expect(stats.currentStreak).toBe(0) // Returns default
    })
  })

  describe('getLast7DaysStats', () => {
    it('returns zeros when no activity', () => {
      const stats = getLast7DaysStats()
      
      expect(stats.timeHours).toBe('0.0')
      expect(stats.attempts).toBe(0)
    })

    it('calculates totals correctly', () => {
      saveUserStats({
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        lastActiveDate: '',
        last7DaysActivity: [
          { date: '2024-01-01', timeSpent: 3600, quizAttempts: 2, materialsViewed: 5, goalsMet: 1 },
          { date: '2024-01-02', timeSpent: 1800, quizAttempts: 1, materialsViewed: 3, goalsMet: 0 },
        ],
      })
      
      const stats = getLast7DaysStats()
      
      expect(stats.timeHours).toBe('1.5') // (3600 + 1800) / 3600
      expect(stats.attempts).toBe(3) // 2 + 1
    })
  })
})
