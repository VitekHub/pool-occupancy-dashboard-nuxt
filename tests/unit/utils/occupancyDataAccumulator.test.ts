import { describe, it, expect, beforeEach } from 'vitest'
import OccupancyDataAccumulator from '~/utils/occupancyDataAccumulator'

describe('OccupancyDataAccumulator', () => {
  let accumulator: OccupancyDataAccumulator

  beforeEach(() => {
    accumulator = new OccupancyDataAccumulator()
  })

  describe('initializeOverallAccumulator', () => {
    it('should initialize accumulator for a new day and hour', () => {
      accumulator.initializeOverallAccumulator('Monday', 14)

      // Access private property for testing
      const overallAccumulator = (accumulator as any).overallAccumulator

      expect(overallAccumulator).toHaveProperty('Monday')
      expect(overallAccumulator.Monday).toHaveProperty('14')
      expect(overallAccumulator.Monday[14]).toEqual({
        average: { sum: 0, count: 0 },
        weightedAverage: { sum: 0, count: 0 },
        median: { weeklyItems: [] },
      })
    })

    it('should not overwrite existing accumulator data', () => {
      accumulator.initializeOverallAccumulator('Monday', 14)

      // Modify the data
      const overallAccumulator = (accumulator as any).overallAccumulator
      overallAccumulator.Monday[14].average.sum = 100

      // Initialize again
      accumulator.initializeOverallAccumulator('Monday', 14)

      // Should not be reset
      expect(overallAccumulator.Monday[14].average.sum).toBe(100)
    })

    it('should handle multiple days and hours', () => {
      accumulator.initializeOverallAccumulator('Monday', 14)
      accumulator.initializeOverallAccumulator('Monday', 15)
      accumulator.initializeOverallAccumulator('Tuesday', 14)

      const overallAccumulator = (accumulator as any).overallAccumulator

      expect(overallAccumulator).toHaveProperty('Monday')
      expect(overallAccumulator).toHaveProperty('Tuesday')
      expect(overallAccumulator.Monday).toHaveProperty('14')
      expect(overallAccumulator.Monday).toHaveProperty('15')
      expect(overallAccumulator.Tuesday).toHaveProperty('14')
    })
  })

  describe('resetWeeklyAccumulator', () => {
    it('should reset weekly accumulator to initial state', () => {
      // First, modify the accumulator
      accumulator.updateWeeklyAccumulator(25)
      accumulator.updateWeeklyAccumulator(30)

      // Reset it
      accumulator.resetWeeklyAccumulator()

      // Check that it's back to initial state
      const weeklyAccumulator = (accumulator as any).weeklyAccumulator
      expect(weeklyAccumulator).toEqual({
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
      })
    })
  })

  describe('updateWeeklyAccumulator', () => {
    it('should update accumulator with positive occupancy values', () => {
      accumulator.updateWeeklyAccumulator(25)
      accumulator.updateWeeklyAccumulator(30)
      accumulator.updateWeeklyAccumulator(20)

      const weeklyAccumulator = (accumulator as any).weeklyAccumulator

      expect(weeklyAccumulator.sum).toBe(75)
      expect(weeklyAccumulator.count).toBe(3)
      expect(weeklyAccumulator.min).toBe(20)
      expect(weeklyAccumulator.max).toBe(30)
    })

    it('should handle zero occupancy correctly', () => {
      accumulator.updateWeeklyAccumulator(0)
      accumulator.updateWeeklyAccumulator(10)
      accumulator.updateWeeklyAccumulator(0)

      const weeklyAccumulator = (accumulator as any).weeklyAccumulator

      // Zero values should not be included in sum/count
      expect(weeklyAccumulator.sum).toBe(10)
      expect(weeklyAccumulator.count).toBe(1)
      // But should be included in min/max
      expect(weeklyAccumulator.min).toBe(0)
      expect(weeklyAccumulator.max).toBe(10)
    })

    it('should handle single value correctly', () => {
      accumulator.updateWeeklyAccumulator(15)

      const weeklyAccumulator = (accumulator as any).weeklyAccumulator

      expect(weeklyAccumulator.sum).toBe(15)
      expect(weeklyAccumulator.count).toBe(1)
      expect(weeklyAccumulator.min).toBe(15)
      expect(weeklyAccumulator.max).toBe(15)
    })
  })

  describe('processWeeklyOccupancy', () => {
    it('should calculate weekly occupancy statistics correctly', () => {
      // Set up some data
      accumulator.updateWeeklyAccumulator(20)
      accumulator.updateWeeklyAccumulator(30)
      accumulator.updateWeeklyAccumulator(25)

      const result = accumulator.processWeeklyOccupancy(100)

      expect(result).toEqual({
        minOccupancy: 20,
        maxOccupancy: 30,
        averageOccupancy: 25, // (20 + 30 + 25) / 3 = 25
        utilizationRate: 25, // (25 / 100) * 100 = 25%
        remainingCapacity: 75, // 100 - 25 = 75
      })
    })

    it('should handle zero count (no positive occupancy)', () => {
      // Only add zero values
      accumulator.updateWeeklyAccumulator(0)
      accumulator.updateWeeklyAccumulator(0)

      const result = accumulator.processWeeklyOccupancy(50)

      expect(result).toEqual({
        minOccupancy: 0,
        maxOccupancy: 0,
        averageOccupancy: 0,
        utilizationRate: 0,
        remainingCapacity: 50,
      })
    })

    it('should format numbers correctly', () => {
      // Test with values that result in decimals
      accumulator.updateWeeklyAccumulator(10)
      accumulator.updateWeeklyAccumulator(15)
      accumulator.updateWeeklyAccumulator(11)

      const result = accumulator.processWeeklyOccupancy(100)

      // Average should be 12 (rounded from 12.0)
      expect(result.averageOccupancy).toBe(12)
      expect(result.utilizationRate).toBe(12)
    })

    it('should handle small decimal values correctly', () => {
      accumulator.updateWeeklyAccumulator(1)

      const result = accumulator.processWeeklyOccupancy(1000)

      // Should format small percentages with decimal
      expect(result.utilizationRate).toBe(0.1) // 0.1%
    })
  })

  describe('processOverallAverageOccupancy', () => {
    beforeEach(() => {
      accumulator.initializeOverallAccumulator('Monday', 14)
    })

    it('should calculate average and weighted average correctly', () => {
      // Process multiple utilization rates
      let result1 = accumulator.processOverallAverageOccupancy(20, 'Monday', 14)
      let result2 = accumulator.processOverallAverageOccupancy(30, 'Monday', 14)
      let result3 = accumulator.processOverallAverageOccupancy(25, 'Monday', 14)

      // Average should be (20 + 30 + 25) / 3 = 25
      expect(result3.averageUtilizationRate).toBe(25)

      // Weighted average calculation depends on the weights
      // For rates 20, 30, 25 (all > 10), weights should be 1
      // So weighted average should also be 25
      expect(result3.weightedAverageUtilizationRate).toBe(25)
    })

    it('should handle zero utilization rate', () => {
      const result = accumulator.processOverallAverageOccupancy(0, 'Monday', 14)

      expect(result.averageUtilizationRate).toBe(0)
      expect(result.weightedAverageUtilizationRate).toBe(0)
    })

    it('should apply different weights for different utilization rates', () => {
      // Test with very low utilization (< 1%) - should get weight 0.1
      accumulator.processOverallAverageOccupancy(0.5, 'Monday', 14)
      // Test with low utilization (1-10%) - should get weight 0.5
      accumulator.processOverallAverageOccupancy(5, 'Monday', 14)
      // Test with normal utilization (>10%) - should get weight 1
      const result = accumulator.processOverallAverageOccupancy(
        20,
        'Monday',
        14
      )

      // Average: Math.round((0.5 + 5 + 20) / 3) = 9
      expect(result.averageUtilizationRate).toBe(9)

      // Weighted average: Math.round((0.5*0.1 + 5*0.5 + 20*1) / (0.1 + 0.5 + 1) = 22.55 / 1.6) = 14
      expect(result.weightedAverageUtilizationRate).toBe(14)
    })

    it('should accumulate median data correctly', () => {
      accumulator.processOverallAverageOccupancy(20, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(30, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(25, 'Monday', 14)

      // Check that median data is being stored
      const overallAccumulator = (accumulator as any).overallAccumulator
      expect(overallAccumulator.Monday[14].median.weeklyItems).toEqual([
        20, 30, 25,
      ])
    })
  })

  describe('processOverallMedianOccupancy', () => {
    beforeEach(() => {
      accumulator.initializeOverallAccumulator('Monday', 14)
    })

    it('should calculate median for odd number of items', () => {
      // Add some data first
      accumulator.processOverallAverageOccupancy(10, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(30, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(20, 'Monday', 14)

      const median = accumulator.processOverallMedianOccupancy('Monday', 14)

      // Sorted: [10, 20, 30], median = 20
      expect(median).toBe(20)
    })

    it('should calculate median for even number of items', () => {
      // Add some data first
      accumulator.processOverallAverageOccupancy(10, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(30, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(20, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(40, 'Monday', 14)

      const median = accumulator.processOverallMedianOccupancy('Monday', 14)

      // Sorted: [10, 20, 30, 40], median = (20 + 30) / 2 = 25
      expect(median).toBe(25)
    })

    it('should handle empty data', () => {
      const median = accumulator.processOverallMedianOccupancy('Monday', 14)
      expect(median).toBe(0)
    })

    it('should handle single item', () => {
      accumulator.processOverallAverageOccupancy(15, 'Monday', 14)

      const median = accumulator.processOverallMedianOccupancy('Monday', 14)
      expect(median).toBe(15)
    })

    it('should round median values correctly', () => {
      accumulator.processOverallAverageOccupancy(10, 'Monday', 14)
      accumulator.processOverallAverageOccupancy(21, 'Monday', 14)

      const median = accumulator.processOverallMedianOccupancy('Monday', 14)

      // (10 + 21) / 2 = 15.5, should round to 16
      expect(median).toBe(16)
    })
  })

  describe('formatNumber', () => {
    it('should format numbers less than 1 with one decimal place', () => {
      const formatNumber = (accumulator as any).formatNumber.bind(accumulator)

      expect(formatNumber(0.1)).toBe(0.1)
      expect(formatNumber(0.97)).toBe(1.0)
      expect(formatNumber(0.123)).toBe(0.1)
    })

    it('should round numbers greater than or equal to 1', () => {
      const formatNumber = (accumulator as any).formatNumber.bind(accumulator)

      expect(formatNumber(1.4)).toBe(1)
      expect(formatNumber(1.6)).toBe(2)
      expect(formatNumber(25.7)).toBe(26)
    })
  })

  describe('getWeightForWeightedAverage', () => {
    it('should return correct weights for different utilization rates', () => {
      const getWeight = (accumulator as any).getWeightForWeightedAverage.bind(
        accumulator
      )

      expect(getWeight(0)).toBe(0)
      expect(getWeight(0.5)).toBe(0.1)
      expect(getWeight(5)).toBe(0.5)
      expect(getWeight(15)).toBe(1)
      expect(getWeight(100)).toBe(1)
    })
  })
})
