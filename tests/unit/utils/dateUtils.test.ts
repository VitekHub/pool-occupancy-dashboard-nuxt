import { describe, it, expect } from 'vitest'
import {
  parseDate,
  getWeekId,
  formatWeekId,
  getHourFromTime,
  getDayName,
  isDayToday,
  createPragueDate,
  nowInPrague,
} from '~/utils/dateUtils'

describe('dateUtils', () => {
  describe('parseDate', () => {
    it('should parse date string in dd.MM.yyyy format', () => {
      const result = parseDate('15.03.2024')
      expect(result.getDate()).toBe(15)
      expect(result.getMonth()).toBe(2) // March is month 2 (0-indexed)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should handle single digit dates and months', () => {
      const result = parseDate('5.1.2024')
      expect(result.getDate()).toBe(5)
      expect(result.getMonth()).toBe(0) // January is month 0
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('getHourFromTime', () => {
    it('should extract hour from time string', () => {
      expect(getHourFromTime('14:30')).toBe(14)
      expect(getHourFromTime('09:15')).toBe(9)
      expect(getHourFromTime('23:59')).toBe(23)
      expect(getHourFromTime('00:00')).toBe(0)
    })

    it('should handle single digit hours', () => {
      expect(getHourFromTime('6:30')).toBe(6)
      expect(getHourFromTime('8:45')).toBe(8)
    })
  })

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

  describe('createPragueDate', () => {
    it('should create a date when no parameter provided', () => {
      const pragueDate = createPragueDate()
      expect(pragueDate).toBeInstanceOf(Date)
      expect(pragueDate.getTime()).toBeCloseTo(Date.now(), -2) // Within 100ms
    })

    it('should convert provided date to Prague timezone', () => {
      const inputDate = new Date('2024-03-15T12:00:00Z')
      const pragueDate = createPragueDate(inputDate)
      expect(pragueDate).toBeInstanceOf(Date)
    })

    it('should handle string date input', () => {
      const pragueDate = createPragueDate('2024-03-15')
      expect(pragueDate).toBeInstanceOf(Date)
      expect(pragueDate.getFullYear()).toBe(2024)
    })
  })

  describe('nowInPrague', () => {
    it('should return current time as Date object', () => {
      const now = nowInPrague()
      expect(now).toBeInstanceOf(Date)
      expect(now.getTime()).toBeCloseTo(Date.now(), -2) // Within 100ms
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

      // Get a different day name
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
