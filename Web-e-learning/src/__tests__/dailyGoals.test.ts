import { describe, it, expect, beforeEach } from 'vitest'
import { generateDailyGoals, getTodayGoals, saveDailyGoals, getGoalText } from '@/utils/dailyGoals'

describe('dailyGoals utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generateDailyGoals', () => {
    it('generates exactly 3 goals', () => {
      const goals = generateDailyGoals()
      expect(goals.length).toBe(3)
    })

    it('generates goals with required properties', () => {
      const goals = generateDailyGoals()
      
      goals.forEach(goal => {
        expect(goal).toHaveProperty('id')
        expect(goal).toHaveProperty('category')
        expect(goal).toHaveProperty('translations')
        expect(goal.translations).toHaveProperty('UA')
        expect(goal.translations).toHaveProperty('PL')
        expect(goal.translations).toHaveProperty('EN')
      })
    })

    it('generates same goals for same day (deterministic)', () => {
      const goals1 = generateDailyGoals()
      const goals2 = generateDailyGoals()
      
      expect(goals1.map(g => g.id)).toEqual(goals2.map(g => g.id))
    })
  })

  describe('getTodayGoals', () => {
    it('creates new goals when none saved', () => {
      const goals = getTodayGoals()
      
      expect(goals.length).toBe(3)
      goals.forEach(goal => {
        expect(goal.done).toBe(false)
      })
    })

    it('returns saved goals for same day', () => {
      const goals = getTodayGoals()
      goals[0].done = true
      saveDailyGoals(goals)
      
      const loadedGoals = getTodayGoals()
      expect(loadedGoals[0].done).toBe(true)
    })
  })

  describe('getGoalText', () => {
    it('returns text for specified language', () => {
      const goals = generateDailyGoals()
      const template = goals[0]
      
      const uaText = getGoalText(template.id, 'UA')
      const plText = getGoalText(template.id, 'PL')
      const enText = getGoalText(template.id, 'EN')

      // getGoalText returns the localized string from template.translations
      expect(uaText).toBe(template.translations.UA)
      expect(plText).toBe(template.translations.PL)
      expect(enText).toBe(template.translations.EN)
    })

    it('returns templateId for unknown template', () => {
      const result = getGoalText('unknown-id', 'UA')
      expect(result).toBe('unknown-id')
    })
  })
})
