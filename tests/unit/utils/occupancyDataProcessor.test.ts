import { describe, it, expect, beforeEach } from 'vitest'
import OccupancyDataProcessor from '~/utils/occupancyDataProcessor'
import type { OccupancyRecord } from '~/types'
import { parseISO } from 'date-fns'

describe('OccupancyDataProcessor', () => {
  let processor: OccupancyDataProcessor

  beforeEach(() => {
    processor = new OccupancyDataProcessor()
  })

  // Helper function to create OccupancyRecord
  const createRecord = (
    dateStr: string,
    day: string,
    time: string,
    occupancy: number
  ): OccupancyRecord => ({
    date: parseISO(dateStr),
    day,
    time,
    occupancy,
    hour: parseInt(time.split(':')[0]),
  })

  describe('single day/hour processing', () => {
    it('should process data for a single hour correctly', () => {
      const records = [
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 25),
        createRecord('2024-03-11T14:15:00Z', 'Monday', '14:15', 30),
        createRecord('2024-03-11T14:30:00Z', 'Monday', '14:30', 20),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const overallMap = processor.getOverallOccupancyMap()

      // Check weekly data structure
      expect(weeklyMap).toHaveProperty('2024-03-11')
      expect(weeklyMap['2024-03-11'].days).toHaveProperty('Monday')
      expect(weeklyMap['2024-03-11'].days.Monday).toHaveProperty('14')

      const hourlyData = weeklyMap['2024-03-11'].days.Monday[14]
      expect(hourlyData.minOccupancy).toBe(20)
      expect(hourlyData.maxOccupancy).toBe(30)
      expect(hourlyData.averageOccupancy).toBe(25) // (25+30+20)/3 = 25
      expect(hourlyData.utilizationRate).toBe(25) // 25/100 * 100 = 25%
      expect(hourlyData.remainingCapacity).toBe(75) // 100 - 25 = 75
      expect(hourlyData.maximumCapacity).toBe(100)

      // Check overall data structure
      expect(overallMap.days).toHaveProperty('Monday')
      expect(overallMap.days.Monday).toHaveProperty('14')
      expect(overallMap.days.Monday[14].averageUtilizationRate).toBe(25)
    })

    it('should handle zero occupancy correctly', () => {
      const records = [
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 0),
        createRecord('2024-03-11T14:15:00Z', 'Monday', '14:15', 0),
        createRecord('2024-03-11T14:30:00Z', 'Monday', '14:30', 0),
      ]

      records.forEach((record) => processor.processRecord(record, 50))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const hourlyData = weeklyMap['2024-03-11'].days.Monday[14]

      expect(hourlyData.minOccupancy).toBe(0)
      expect(hourlyData.maxOccupancy).toBe(0)
      expect(hourlyData.averageOccupancy).toBe(0)
      expect(hourlyData.utilizationRate).toBe(0)
      expect(hourlyData.remainingCapacity).toBe(50)
    })

    it('should handle full capacity correctly', () => {
      const records = [
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 50),
        createRecord('2024-03-11T14:15:00Z', 'Monday', '14:15', 50),
      ]

      records.forEach((record) => processor.processRecord(record, 50))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const hourlyData = weeklyMap['2024-03-11'].days.Monday[14]

      expect(hourlyData.utilizationRate).toBe(100)
      expect(hourlyData.remainingCapacity).toBe(0)
    })
  })

  describe('multiple hours processing', () => {
    it('should handle transitions between hours correctly', () => {
      const records = [
        // Hour 14
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 20),
        createRecord('2024-03-11T14:30:00Z', 'Monday', '14:30', 30),
        // Hour 15
        createRecord('2024-03-11T15:00:00Z', 'Monday', '15:00', 40),
        createRecord('2024-03-11T15:30:00Z', 'Monday', '15:30', 50),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const mondayData = weeklyMap['2024-03-11'].days.Monday

      // Check hour 14
      expect(mondayData[14].averageOccupancy).toBe(25) // (20+30)/2
      expect(mondayData[14].utilizationRate).toBe(25)

      // Check hour 15
      expect(mondayData[15].averageOccupancy).toBe(45) // (40+50)/2
      expect(mondayData[15].utilizationRate).toBe(45)

      // Check max values
      expect(mondayData.maxDayValues.utilizationRate).toBe(45)
      expect(weeklyMap['2024-03-11'].maxWeekValues.utilizationRate).toBe(45)
    })

    it('should process multiple hours on same day', () => {
      const records = [
        createRecord('2024-03-11T10:00:00Z', 'Monday', '10:00', 10),
        createRecord('2024-03-11T11:00:00Z', 'Monday', '11:00', 20),
        createRecord('2024-03-11T12:00:00Z', 'Monday', '12:00', 30),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const mondayData = weeklyMap['2024-03-11'].days.Monday

      expect(mondayData).toHaveProperty('10')
      expect(mondayData).toHaveProperty('11')
      expect(mondayData).toHaveProperty('12')

      expect(mondayData[10].utilizationRate).toBe(10)
      expect(mondayData[11].utilizationRate).toBe(20)
      expect(mondayData[12].utilizationRate).toBe(30)
    })
  })

  describe('multiple days processing', () => {
    it('should handle data spanning multiple days', () => {
      const records = [
        // Monday
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 25),
        // Tuesday
        createRecord('2024-03-12T14:00:00Z', 'Tuesday', '14:00', 35),
        // Wednesday
        createRecord('2024-03-13T14:00:00Z', 'Wednesday', '14:00', 45),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const weekData = weeklyMap['2024-03-11'].days

      expect(weekData).toHaveProperty('Monday')
      expect(weekData).toHaveProperty('Tuesday')
      expect(weekData).toHaveProperty('Wednesday')

      expect(weekData.Monday[14].utilizationRate).toBe(25)
      expect(weekData.Tuesday[14].utilizationRate).toBe(35)
      expect(weekData.Wednesday[14].utilizationRate).toBe(45)

      // Check overall data accumulation
      const overallMap = processor.getOverallOccupancyMap()
      // Since we only have one week of data, the overall averages should equal the weekly values
      expect(overallMap.days).toHaveProperty('Monday')
      expect(overallMap.days).toHaveProperty('Tuesday')
      expect(overallMap.days).toHaveProperty('Wednesday')
      expect(overallMap.days.Monday).toHaveProperty('14')
      expect(overallMap.days.Tuesday).toHaveProperty('14')
      expect(overallMap.days.Wednesday).toHaveProperty('14')
      expect(overallMap.days.Monday[14].averageUtilizationRate).toBe(25)
      expect(overallMap.days.Tuesday[14].averageUtilizationRate).toBe(35)
      expect(overallMap.days.Wednesday[14].averageUtilizationRate).toBe(45)
    })
  })

  describe('multiple weeks processing', () => {
    it('should handle data across week boundaries', () => {
      const records = [
        // Week 1 (2024-03-11)
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 20),
        createRecord('2024-03-12T14:00:00Z', 'Tuesday', '14:00', 30),
        // Week 2 (2024-03-18)
        createRecord('2024-03-18T14:00:00Z', 'Monday', '14:00', 40),
        createRecord('2024-03-19T14:00:00Z', 'Tuesday', '14:00', 50),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()

      // Check both weeks exist
      expect(weeklyMap).toHaveProperty('2024-03-11')
      expect(weeklyMap).toHaveProperty('2024-03-18')

      // Week 1 data
      expect(weeklyMap['2024-03-11'].days.Monday[14].utilizationRate).toBe(20)
      expect(weeklyMap['2024-03-11'].days.Tuesday[14].utilizationRate).toBe(30)
      expect(weeklyMap['2024-03-11'].maxWeekValues.utilizationRate).toBe(30)

      // Week 2 data
      expect(weeklyMap['2024-03-18'].days.Monday[14].utilizationRate).toBe(40)
      expect(weeklyMap['2024-03-18'].days.Tuesday[14].utilizationRate).toBe(50)
      expect(weeklyMap['2024-03-18'].maxWeekValues.utilizationRate).toBe(50)

      // Check overall accumulation across weeks
      const overallMap = processor.getOverallOccupancyMap()
      // Monday should have average of 20 and 40 = 30
      expect(overallMap.days.Monday[14].averageUtilizationRate).toBe(30)
      // Tuesday should have average of 30 and 50 = 40
      expect(overallMap.days.Tuesday[14].averageUtilizationRate).toBe(40)
    })

    it('should accumulate overall statistics correctly across multiple weeks', () => {
      const records = [
        // Week 1: Very Low utilization
        createRecord('2024-03-04T14:00:00Z', 'Monday', '14:00', 8), // 0.8%
        // Week 2: Low utilization
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 40), // 4%
        // Week 3: Medium utilization
        createRecord('2024-03-18T14:00:00Z', 'Monday', '14:00', 300), // 30%
        // Week 4: High utilization
        createRecord('2024-03-25T14:00:00Z', 'Monday', '14:00', 500), // 50%
      ]

      records.forEach((record) => processor.processRecord(record, 1000))
      processor.finalizeProcessing()

      const overallMap = processor.getOverallOccupancyMap()
      const mondayHour14 = overallMap.days.Monday[14]

      // Average: (0.8 + 4 + 30 + 50) / 4 = 21
      expect(mondayHour14.averageUtilizationRate).toBe(21)

      // Weighted average should consider different weights for different utilization rates
      // 0.8% gets weight 0.1, 4% gets weight 0.5, 30% gets weight 1, 50% gets weight 1
      // (0.8 * 0.1 + 4*0.5 + 30*1 + 50*1) / (0.1 + 0.5 + 1 + 1) = 82.08 / 2.6 = 32
      expect(mondayHour14.weightedAverageUtilizationRate).toBe(32)

      // Median of [0.8, 4, 30, 50] = (4 + 30) / 2 = 17
      expect(mondayHour14.medianUtilizationRate).toBe(17)
    })
  })

  describe('edge cases', () => {
    it('should handle single record correctly', () => {
      const record = createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 25)

      processor.processRecord(record, 100)
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const hourlyData = weeklyMap['2024-03-11'].days.Monday[14]

      expect(hourlyData.minOccupancy).toBe(25)
      expect(hourlyData.maxOccupancy).toBe(25)
      expect(hourlyData.averageOccupancy).toBe(25)
      expect(hourlyData.utilizationRate).toBe(25)
    })

    it('should handle mixed zero and non-zero occupancy', () => {
      const records = [
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 0),
        createRecord('2024-03-11T14:15:00Z', 'Monday', '14:15', 20),
        createRecord('2024-03-11T14:30:00Z', 'Monday', '14:30', 0),
        createRecord('2024-03-11T14:45:00Z', 'Monday', '14:45', 30),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const hourlyData = weeklyMap['2024-03-11'].days.Monday[14]

      expect(hourlyData.minOccupancy).toBe(0)
      expect(hourlyData.maxOccupancy).toBe(30)
      // Average should only include non-zero values: (20 + 30) / 2 = 25
      expect(hourlyData.averageOccupancy).toBe(25)
      expect(hourlyData.utilizationRate).toBe(25)
    })

    it('should handle very low utilization rates for weighted average', () => {
      const records = [
        // Very low utilization (< 1%) - should get weight 0.1
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 0.5),
        // Low utilization (1-10%) - should get weight 0.5
        createRecord('2024-03-18T14:00:00Z', 'Monday', '14:00', 5),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const overallMap = processor.getOverallOccupancyMap()
      const mondayHour14 = overallMap.days.Monday[14]

      // Average: (0.5 + 5) / 2 = 2.75 ≈ 3 (rounded)
      expect(mondayHour14.averageUtilizationRate).toBe(3)

      // Weighted average: (0.5*0.1 + 5*0.5) / (0.1 + 0.5) = 2.55 / 0.6 ≈ 4.25 ≈ 4 (rounded)
      expect(mondayHour14.weightedAverageUtilizationRate).toBe(4)
    })
  })

  describe('data structure integrity', () => {
    it('should maintain proper data structure hierarchy', () => {
      const records = [
        createRecord('2024-03-11T14:00:00Z', 'Monday', '14:00', 25),
        createRecord('2024-03-11T15:00:00Z', 'Monday', '15:00', 35),
        createRecord('2024-03-12T14:00:00Z', 'Tuesday', '14:00', 45),
      ]

      records.forEach((record) => processor.processRecord(record, 100))
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const overallMap = processor.getOverallOccupancyMap()

      // Check weekly map structure
      expect(weeklyMap['2024-03-11']).toHaveProperty('maxWeekValues')
      expect(weeklyMap['2024-03-11']).toHaveProperty('days')
      expect(weeklyMap['2024-03-11'].days.Monday).toHaveProperty('maxDayValues')
      expect(weeklyMap['2024-03-11'].days.Monday).toHaveProperty('14')
      expect(weeklyMap['2024-03-11'].days.Monday).toHaveProperty('15')

      // Check overall map structure
      expect(overallMap).toHaveProperty('maxOverallValues')
      expect(overallMap).toHaveProperty('days')
      expect(overallMap.days.Monday).toHaveProperty('maxDayValues')
      expect(overallMap.days.Monday).toHaveProperty('14')
      expect(overallMap.days.Monday).toHaveProperty('15')
      expect(overallMap.days.Tuesday).toHaveProperty('14')

      // Verify max values are calculated correctly
      expect(overallMap.maxOverallValues.averageUtilizationRate).toBe(45)
      expect(weeklyMap['2024-03-11'].maxWeekValues.utilizationRate).toBe(45)
    })

    it('should handle empty processing gracefully', () => {
      processor.finalizeProcessing()

      const weeklyMap = processor.getWeeklyOccupancyMap()
      const overallMap = processor.getOverallOccupancyMap()

      expect(Object.keys(weeklyMap)).toHaveLength(0)
      expect(Object.keys(overallMap.days)).toHaveLength(0)
      expect(overallMap.maxOverallValues.averageUtilizationRate).toBe(0)
    })
  })
})
