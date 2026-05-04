import { describe, it, expect } from 'vitest'
import {
  getWeekId,
  formatWeekId,
  getDayName,
  isDayToday,
  nowInPrague,
} from '~/utils/dateUtils'

describe('dateUtils', () => {
  describe('getWeekId', () => {
    it('should return week start date in YYYY-MM-DD format', () => {
      // March 15, 2024 is a Friday
      const friday = new Date(2024, 2, 15)
      const weekId = getWeekId(friday)

      // Week should start on Monday (March 11, 2024)
      expect(weekId).toBe('2024-03-11')
    })

    it('should handle Monday as week start', () => {
      // March 11, 2024 is a Monday
      const monday = new Date(2024, 2, 11)
      const weekId = getWeekId(monday)

      expect(weekId).toBe('2024-03-11')
    })

    it('should handle Sunday correctly', () => {
      // March 17, 2024 is a Sunday
      const sunday = new Date(2024, 2, 17)
      const weekId = getWeekId(sunday)

      // Week should start on Monday (March 11, 2024)
      expect(weekId).toBe('2024-03-11')
    })
  })

  describe('formatWeekId', () => {
    it('should format week ID for Czech locale', () => {
      const formatted = formatWeekId('2024-03-11', 'cs')
      expect(formatted).toMatch(/11\. bře\. 2024|11\. 3\. 2024/)
    })

    it('should format week ID for English locale', () => {
      const formatted = formatWeekId('2024-03-11', 'en')
      expect(formatted).toMatch(/Mar 11, 2024/)
    })

    it('should handle invalid date gracefully', () => {
      const formatted = formatWeekId('invalid-date', 'en')
      expect(formatted).toBe('invalid-date')
    })
  })

  describe('getDayName', () => {
    it('should return correct day name in English', () => {
      const monday = new Date(2024, 2, 11) // March 11, 2024 is Monday
      const tuesday = new Date(2024, 2, 12)
      const sunday = new Date(2024, 2, 17)

      expect(getDayName(monday)).toBe('Monday')
      expect(getDayName(tuesday)).toBe('Tuesday')
      expect(getDayName(sunday)).toBe('Sunday')
    })
  })

  describe('nowInPrague', () => {
    it('should return current time as Date object', () => {
      const now = nowInPrague()
      expect(now).toBeInstanceOf(Date)
      expect(isNaN(now.getTime())).toBe(false)
    })
  })

  describe('isDayToday', () => {
    it('should return true for current day', () => {
      const today = nowInPrague()
      const todayName = getDayName(today)
      expect(isDayToday(todayName)).toBe(true)
    })

    it('should return false for different day', () => {
      const today = nowInPrague()
      const todayName = getDayName(today)

      const dayNames = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
      const differentDay = dayNames.find((day) => day !== todayName) || 'Monday'

      expect(isDayToday(differentDay)).toBe(false)
    })

    it('should handle case insensitive comparison', () => {
      const today = nowInPrague()
      const todayName = getDayName(today).toLowerCase()
      expect(isDayToday(todayName)).toBe(true)
    })
  })
})
