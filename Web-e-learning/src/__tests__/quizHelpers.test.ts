import { describe, it, expect } from 'vitest'
import { formatTime } from '@/utils/quizHelpers'

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(90)).toBe('1:30')
    expect(formatTime(5)).toBe('0:05')
  })
  it('handles negative and zero safely', () => {
    expect(formatTime(-10)).toBe('0:00')
    expect(formatTime(0)).toBe('0:00')
  })
})
