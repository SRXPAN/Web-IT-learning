import { describe, it, expect, beforeEach } from 'vitest'
import { countSeen, isMaterialSeen, markMaterialSeen } from '@/utils/progress'

describe('progress utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('countSeen', () => {
    it('returns 0 for empty array', () => {
      expect(countSeen([])).toBe(0)
    })

    it('returns 0 when no materials are seen', () => {
      expect(countSeen(['mat1', 'mat2', 'mat3'])).toBe(0)
    })

    it('counts seen materials correctly', () => {
      markMaterialSeen('mat1')
      markMaterialSeen('mat3')
      expect(countSeen(['mat1', 'mat2', 'mat3'])).toBe(2)
    })

    it('handles duplicates in seen list', () => {
      markMaterialSeen('mat1')
      markMaterialSeen('mat1') // duplicate
      expect(countSeen(['mat1'])).toBe(1)
    })
  })

  describe('isMaterialSeen', () => {
    it('returns false for unseen material', () => {
      expect(isMaterialSeen('mat1')).toBe(false)
    })

    it('returns true for seen material', () => {
      markMaterialSeen('mat1')
      expect(isMaterialSeen('mat1')).toBe(true)
    })
  })

  describe('markMaterialSeen', () => {
    it('marks material as seen', () => {
      expect(isMaterialSeen('mat1')).toBe(false)
      markMaterialSeen('mat1')
      expect(isMaterialSeen('mat1')).toBe(true)
    })

    it('does not duplicate entries', () => {
      markMaterialSeen('mat1')
      markMaterialSeen('mat1')
      const seen = JSON.parse(localStorage.getItem('elearn_seen_materials') || '[]')
      expect(seen.length).toBe(1)
    })

    it('preserves existing seen materials', () => {
      markMaterialSeen('mat1')
      markMaterialSeen('mat2')
      expect(isMaterialSeen('mat1')).toBe(true)
      expect(isMaterialSeen('mat2')).toBe(true)
    })
  })
})
