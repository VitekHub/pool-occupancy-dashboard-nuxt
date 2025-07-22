import { describe, it, expect, beforeEach, vi } from 'vitest'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'
import type { WeeklyOccupancyMap, OverallOccupancyMap } from '~/types'

const COLORS = {
  EMPTY: 'bg-gray-100 dark:bg-gray-700',
  VERY_LOW: 'bg-blue-100 dark:bg-blue-600',
  LOW: 'bg-blue-300 dark:bg-blue-800',
  MEDIUM: 'bg-teal-300 dark:bg-teal-600',
  HIGH: 'bg-orange-300 dark:bg-orange-600',
  VERY_HIGH: 'bg-red-400 dark:bg-red-600',
} as const

describe('HeatmapDataProcessor', () => {
  let processor: HeatmapDataProcessor
  let mockT: ReturnType<typeof vi.fn>

  // Mock data
  const mockWeeklyOccupancyMap: WeeklyOccupancyMap = {
    '2024-03-11': {
      maxWeekValues: { utilizationRate: 50 },
      days: {
        Monday: {
          maxDayValues: { utilizationRate: 30 },
          14: {
            date: new Date('2024-03-11T14:00:00Z'),
            day: 'Monday',
            hour: 14,
            minOccupancy: 20,
            maxOccupancy: 30,
            averageOccupancy: 25,
            maximumCapacity: 100,
            utilizationRate: 25,
            remainingCapacity: 75,
          },
          15: {
            date: new Date('2024-03-11T15:00:00Z'),
            day: 'Monday',
            hour: 15,
            minOccupancy: 40,
            maxOccupancy: 50,
            averageOccupancy: 45,
            maximumCapacity: 100,
            utilizationRate: 45,
            remainingCapacity: 55,
          },
        },
        Tuesday: {
          maxDayValues: { utilizationRate: 50 },
          14: {
            date: new Date('2024-03-12T14:00:00Z'),
            day: 'Tuesday',
            hour: 14,
            minOccupancy: 45,
            maxOccupancy: 55,
            averageOccupancy: 50,
            maximumCapacity: 100,
            utilizationRate: 50,
            remainingCapacity: 50,
          },
        },
      },
    },
    '2024-03-18': {
      maxWeekValues: { utilizationRate: 40 },
      days: {
        Monday: {
          maxDayValues: { utilizationRate: 40 },
          14: {
            date: new Date('2024-03-18T14:00:00Z'),
            day: 'Monday',
            hour: 14,
            minOccupancy: 35,
            maxOccupancy: 45,
            averageOccupancy: 40,
            maximumCapacity: 100,
            utilizationRate: 40,
            remainingCapacity: 60,
          },
        },
      },
    },
  }

  const mockOverallOccupancyMap: OverallOccupancyMap = {
    maxOverallValues: {
      averageUtilizationRate: 60,
      weightedAverageUtilizationRate: 65,
      medianUtilizationRate: 55,
    },
    days: {
      Monday: {
        maxDayValues: {
          averageUtilizationRate: 35,
          weightedAverageUtilizationRate: 40,
          medianUtilizationRate: 30,
        },
        14: {
          averageUtilizationRate: 32,
          weightedAverageUtilizationRate: 35,
          medianUtilizationRate: 30,
        },
        15: {
          averageUtilizationRate: 45,
          weightedAverageUtilizationRate: 50,
          medianUtilizationRate: 40,
        },
      },
      Tuesday: {
        maxDayValues: {
          averageUtilizationRate: 60,
          weightedAverageUtilizationRate: 65,
          medianUtilizationRate: 55,
        },
        14: {
          averageUtilizationRate: 60,
          weightedAverageUtilizationRate: 65,
          medianUtilizationRate: 55,
        },
      },
    },
  }

  beforeEach(() => {
    mockT = vi.fn((key: string, options?: any) => {
      // Mock translation function
      if (key.includes('tooltip')) {
        return `${options?.day} at ${options?.hour}:00 - ${options?.utilization || options?.min || options?.average}% occupied`
      }
      if (key.includes('common.days')) {
        const dayMap: { [key: string]: string } = {
          'common.days.monday': 'Monday',
          'common.days.tuesday': 'Tuesday',
          'common.days.wednesday': 'Wednesday',
        }
        return dayMap[key] || key
      }
      return key
    })

    processor = new HeatmapDataProcessor(
      mockWeeklyOccupancyMap,
      mockOverallOccupancyMap,
      60, // heatmapHighThreshold
      'heatmap.weekly.percentage.tooltip',
      mockT
    )
  })

  describe('constructor and initialization', () => {
    it('should initialize with provided data', () => {
      expect(processor).toBeDefined()
      expect(mockT).toBeDefined()
    })

    it('should generate legend items', () => {
      const legendItems = processor.getLegendItems()
      expect(legendItems).toHaveLength(6)
      expect(legendItems[0]).toEqual({
        color: 'bg-gray-100 dark:bg-gray-700 border border-gray-300',
        label: '0%',
      })
      expect(legendItems[5]).toEqual({
        color: 'bg-red-400 dark:bg-red-600',
        label: '<100%',
      })
    })
  })

  describe('overall view mode - average metric', () => {
    beforeEach(() => {
      processor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.overall.average.tooltip',
        mockT
      )
    })

    it('should return correct cell data for overall average', () => {
      const cellData = processor.getOverallAverageCellData('Monday', 14)

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('32%')
      expect(cellData.color).toBe(COLORS.MEDIUM)
      expect(cellData.colorFillRatio).toBeCloseTo(32 / 60) // 32% of max 60%
      expect(cellData.title).toContain('Monday at 14:00 - 32% occupied')
      expect(cellData.isCurrentHour).toBe(false)
    })

    it('should return correct cell data for overall weighted average', () => {
      const cellData = processor.getOverallWeightedAverageCellData('Monday', 14)

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('35%')
      expect(cellData.color).toBe(COLORS.MEDIUM)
      expect(cellData.colorFillRatio).toBeCloseTo(35 / 65) // 35% of max 65%
    })

    it('should return correct cell data for overall median', () => {
      const cellData = processor.getOverallMedianCellData('Monday', 14)

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('30%')
      expect(cellData.color).toBe(COLORS.MEDIUM)
      expect(cellData.colorFillRatio).toBeCloseTo(30 / 55) // 30% of max 55%
    })

    it('should handle missing data gracefully', () => {
      const cellData = processor.getOverallAverageCellData('Wednesday', 10)

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('')
      expect(cellData.color).toBe(COLORS.EMPTY)
      expect(cellData.colorFillRatio).toBe(0)
    })
  })

  describe('weekly view mode - percentage metric', () => {
    beforeEach(() => {
      processor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.weekly.percentage.tooltip',
        mockT
      )
    })

    it('should return correct cell data for weekly percentage', () => {
      const cellData = processor.getWeeklyPercentageCellData(
        '2024-03-11',
        'Monday',
        14
      )

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('25%')
      expect(cellData.color).toBe(COLORS.LOW)
      expect(cellData.colorFillRatio).toBe(0.5) // 25% of max 50%
      expect(cellData.title).toContain('Monday at 14:00 - 25% occupied')
    })

    it('should handle different weeks correctly', () => {
      const cellData = processor.getWeeklyPercentageCellData(
        '2024-03-18',
        'Monday',
        14
      )

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('40%')
      expect(cellData.colorFillRatio).toBe(1.0) // 40% is max for this week
    })

    it('should return empty data for missing weekly data', () => {
      const cellData = processor.getWeeklyPercentageCellData(
        '2024-03-25',
        'Monday',
        14
      )

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('')
      expect(cellData.color).toBe(COLORS.EMPTY)
      expect(cellData.colorFillRatio).toBe(0)
    })
  })

  describe('weekly view mode - min-max metric', () => {
    beforeEach(() => {
      processor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.weekly.minMax.tooltip',
        mockT
      )
    })

    it('should return correct cell data for min-max with different values', () => {
      const cellData = processor.getWeeklyRawMinMaxCellData(
        '2024-03-11',
        'Monday',
        14
      )

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('20-30') // min-max occupancy
      expect(cellData.color).toBe(COLORS.LOW)
      expect(cellData.title).toContain('Monday at 14:00 - 20% occupied')
    })

    it('should return correct cell data for min-max with same values', () => {
      // Create a processor with data where min equals max
      const sameValueMap: WeeklyOccupancyMap = {
        '2024-03-11': {
          maxWeekValues: { utilizationRate: 30 },
          days: {
            Monday: {
              maxDayValues: { utilizationRate: 30 },
              14: {
                date: new Date('2024-03-11T14:00:00Z'),
                day: 'Monday',
                hour: 14,
                minOccupancy: 25,
                maxOccupancy: 25, // Same as min
                averageOccupancy: 25,
                maximumCapacity: 100,
                utilizationRate: 25,
                remainingCapacity: 75,
              },
            },
          },
        },
      }

      const sameValueProcessor = new HeatmapDataProcessor(
        sameValueMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.weekly.minMax.tooltip',
        mockT
      )

      const cellData = sameValueProcessor.getWeeklyRawMinMaxCellData(
        '2024-03-11',
        'Monday',
        14
      )

      expect(cellData.displayText).toBe('25') // Single value when min equals max
    })

    it('should return empty data for missing hour', () => {
      const cellData = processor.getWeeklyRawMinMaxCellData(
        '2024-03-11',
        'Monday',
        10
      )

      expect(cellData).toBeDefined()
      expect(cellData.color).toBe(COLORS.EMPTY)
      expect(cellData.colorFillRatio).toBe(0)
      expect(cellData.displayText).toBe('')
      expect(cellData.title).toBe('')
      expect(cellData.isCurrentHour).toBe(false)
    })
  })

  describe('weekly view mode - average metric', () => {
    beforeEach(() => {
      processor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.weekly.average.tooltip',
        mockT
      )
    })

    it('should return correct cell data for weekly average', () => {
      const cellData = processor.getWeeklyRawAverageCellData(
        '2024-03-11',
        'Monday',
        14
      )

      expect(cellData).toBeDefined()
      expect(cellData.displayText).toBe('25') // Average occupancy
      expect(cellData.color).toBe(COLORS.LOW)
      expect(cellData.title).toContain('Monday at 14:00 - 25% occupied')
    })

    it('should return empty data for missing hour', () => {
      const cellData = processor.getWeeklyRawAverageCellData(
        '2024-03-11',
        'Monday',
        10
      )

      expect(cellData).toBeDefined()
      expect(cellData.color).toBe(COLORS.EMPTY)
      expect(cellData.colorFillRatio).toBe(0)
      expect(cellData.displayText).toBe('')
    })
  })

  describe('color and fill ratio calculations', () => {
    it('should assign correct colors based on utilization thresholds', () => {
      // Test different utilization rates
      const testCases = [
        { rate: 0, expectedColor: COLORS.EMPTY },
        { rate: 10, expectedColor: COLORS.VERY_LOW },
        { rate: 30, expectedColor: COLORS.MEDIUM },
        { rate: 50, expectedColor: COLORS.HIGH },
        { rate: 70, expectedColor: COLORS.VERY_HIGH },
      ]

      testCases.forEach(({ rate, expectedColor }) => {
        // Create mock data with specific utilization rate
        const testMap: OverallOccupancyMap = {
          maxOverallValues: {
            averageUtilizationRate: 100,
            weightedAverageUtilizationRate: 100,
            medianUtilizationRate: 100,
          },
          days: {
            Monday: {
              maxDayValues: {
                averageUtilizationRate: 100,
                weightedAverageUtilizationRate: 100,
                medianUtilizationRate: 100,
              },
              14: {
                averageUtilizationRate: rate,
                weightedAverageUtilizationRate: rate,
                medianUtilizationRate: rate,
              },
            },
          },
        }

        const testProcessor = new HeatmapDataProcessor(
          mockWeeklyOccupancyMap,
          testMap,
          60,
          'test.tooltip',
          mockT
        )

        const cellData = testProcessor.getOverallAverageCellData('Monday', 14)
        expect(cellData.color).toBe(expectedColor)
      })
    })

    it('should calculate fill ratios correctly', () => {
      const cellData = processor.getOverallAverageCellData('Monday', 14)
      // 32% utilization with max overall of 60%
      expect(cellData.colorFillRatio).toBeCloseTo(32 / 60, 2)
    })

    it('should handle zero max values gracefully', () => {
      const emptyMap: OverallOccupancyMap = {
        maxOverallValues: {
          averageUtilizationRate: 0,
          weightedAverageUtilizationRate: 0,
          medianUtilizationRate: 0,
        },
        days: {
          Monday: {
            maxDayValues: {
              averageUtilizationRate: 0,
              weightedAverageUtilizationRate: 0,
              medianUtilizationRate: 0,
            },
            14: {
              averageUtilizationRate: 0,
              weightedAverageUtilizationRate: 0,
              medianUtilizationRate: 0,
            },
          },
        },
      }

      const emptyProcessor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        emptyMap,
        60,
        'test.tooltip',
        mockT
      )

      const cellData = emptyProcessor.getOverallAverageCellData('Monday', 14)
      expect(cellData.colorFillRatio).toBe(0)
    })
  })

  describe('current hour detection', () => {
    it('should detect current hour correctly', () => {
      // Mock the current time to be Monday at 14:00
      const mockDate = new Date('2024-03-11T13:00:00Z')
      vi.setSystemTime(mockDate)

      // Mock isDayToday to return true for Monday
      vi.doMock('~/utils/dateUtils', () => ({
        isDayToday: vi.fn((day: string) => day === 'Monday'),
        nowInPrague: vi.fn(() => mockDate),
      }))

      const cellData = processor.getOverallAverageCellData('Monday', 14)
      expect(cellData.isCurrentHour).toBe(true)
    })
  })

  describe('translation integration', () => {
    it('should call translation function with correct parameters', () => {
      // Create processor with overall average tooltip key
      const overallProcessor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.overall.average.tooltip',
        mockT
      )

      overallProcessor.getOverallAverageCellData('Monday', 14)

      expect(mockT).toHaveBeenNthCalledWith(
        2,
        'heatmap.overall.average.tooltip',
        {
          day: 'Monday',
          hour: 14,
          utilization: 32,
        }
      )
    })

    it('should call translation for day names', () => {
      processor.getOverallAverageCellData('Monday', 14)

      expect(mockT).toHaveBeenNthCalledWith(1, 'common.days.monday')
    })

    it('should handle different tooltip types', () => {
      // Create processor with min-max tooltip key
      const minMaxProcessor = new HeatmapDataProcessor(
        mockWeeklyOccupancyMap,
        mockOverallOccupancyMap,
        60,
        'heatmap.weekly.minMax.tooltip',
        mockT
      )

      // Test min-max tooltip
      minMaxProcessor.getWeeklyRawMinMaxCellData('2024-03-11', 'Monday', 14)

      expect(mockT).toHaveBeenNthCalledWith(
        2,
        'heatmap.weekly.minMax.tooltip',
        {
          day: 'Monday',
          hour: 14,
          min: 20,
          max: 30,
        }
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle completely empty data maps', () => {
      const emptyWeeklyMap: WeeklyOccupancyMap = {}
      const emptyOverallMap: OverallOccupancyMap = {
        maxOverallValues: {
          averageUtilizationRate: 0,
          weightedAverageUtilizationRate: 0,
          medianUtilizationRate: 0,
        },
        days: {},
      }

      const emptyProcessor = new HeatmapDataProcessor(
        emptyWeeklyMap,
        emptyOverallMap,
        60,
        'test.tooltip',
        mockT
      )

      const cellData = emptyProcessor.getOverallAverageCellData('Monday', 14)
      expect(cellData.displayText).toBe('')
      expect(cellData.color).toBe('bg-gray-100 dark:bg-gray-700')
      expect(cellData.colorFillRatio).toBe(0)
    })

    it('should handle invalid week IDs', () => {
      const cellData = processor.getWeeklyPercentageCellData(
        'invalid-week',
        'Monday',
        14
      )

      expect(cellData.displayText).toBe('')
      expect(cellData.colorFillRatio).toBe(0)
    })

    it('should handle invalid day names', () => {
      const cellData = processor.getOverallAverageCellData('InvalidDay', 14)

      expect(cellData.displayText).toBe('')
      expect(cellData.colorFillRatio).toBe(0)
    })

    it('should handle invalid hours', () => {
      const cellData = processor.getOverallAverageCellData('Monday', 999)

      expect(cellData.displayText).toBe('')
      expect(cellData.colorFillRatio).toBe(0)
    })
  })
})
