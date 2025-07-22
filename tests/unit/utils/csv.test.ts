import { describe, it, expect } from 'vitest'
import { parseOccupancyCSV } from '~/utils/csv'

describe('csv utils', () => {
  describe('parseOccupancyCSV', () => {
    it('should parse valid CSV data correctly', () => {
      const csvData = `Date,Day,Time,Occupancy
15.03.2024,Friday,14:30,25
15.03.2024,Friday,14:45,30
16.03.2024,Saturday,09:15,15`

      const result = parseOccupancyCSV(csvData)

      expect(result).toHaveLength(3)

      // Check first record
      expect(result[0]).toMatchObject({
        day: 'Friday',
        time: '14:30',
        occupancy: 25,
        hour: 14,
      })
      expect(result[0].date).toBeInstanceOf(Date)

      // Check second record
      expect(result[1]).toMatchObject({
        day: 'Friday',
        time: '14:45',
        occupancy: 30,
        hour: 14,
      })

      // Check third record
      expect(result[2]).toMatchObject({
        day: 'Saturday',
        time: '09:15',
        occupancy: 15,
        hour: 9,
      })
    })

    it('should handle empty CSV data', () => {
      const csvData = `Date,Day,Time,Occupancy`
      const result = parseOccupancyCSV(csvData)
      expect(result).toHaveLength(0)
    })

    it('should handle CSV with only whitespace', () => {
      const csvData = `   `
      const result = parseOccupancyCSV(csvData)
      expect(result).toHaveLength(0)
    })

    it('should parse occupancy as integer', () => {
      const csvData = `Date,Day,Time,Occupancy
15.03.2024,Friday,14:30,25.5`

      const result = parseOccupancyCSV(csvData)
      expect(result[0].occupancy).toBe(25) // Should be parsed as integer
    })

    it('should handle zero occupancy', () => {
      const csvData = `Date,Day,Time,Occupancy
15.03.2024,Friday,14:30,0`

      const result = parseOccupancyCSV(csvData)
      expect(result[0].occupancy).toBe(0)
    })

    it('should extract hour correctly from different time formats', () => {
      const csvData = `Date,Day,Time,Occupancy
15.03.2024,Friday,6:30,10
15.03.2024,Friday,14:45,20
15.03.2024,Friday,23:59,5`

      const result = parseOccupancyCSV(csvData)
      expect(result[0].hour).toBe(6)
      expect(result[1].hour).toBe(14)
      expect(result[2].hour).toBe(23)
    })
  })
})
