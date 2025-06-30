import type {
  OccupancyRecord,
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  HourlyOccupancySummary,
} from '~/types'
import { isInsidePool } from '~/types'
import { getWeekId } from './dateUtils'

interface OccupancyAccumulator {
  sum: number
  count: number
  min: number
  max: number
}

interface OverallOccupancyAccumulator {
  [day: string]: {
    [hour: number]: {
      sum: number
      count: number
    }
  }
}

export function processAllOccupancyData(
  occupancyData: OccupancyRecord[],
  selectedPool: PoolConfig,
  selectedPoolType: PoolType
): {
  weeklyOccupancyMap: WeeklyOccupancyMap
  overallOccupancyMap: OverallOccupancyMap
} {
  const occupancyDataProcessor = new OccupancyDataProcessor()
  const maxCapacity = isInsidePool(selectedPoolType)
    ? selectedPool.insidePool?.maximumCapacity || 0
    : selectedPool.outsidePool?.maximumCapacity || 0

  occupancyData.forEach((occupancyRecord) => {
    occupancyDataProcessor.processRecord(occupancyRecord, maxCapacity)
  })
  // Finalize the last hour's statistics
  occupancyDataProcessor.finalizeProcessing()

  return {
    weeklyOccupancyMap: occupancyDataProcessor.getWeeklyOccupancyMap(),
    overallOccupancyMap: occupancyDataProcessor.getOverallOccupancyMap(),
  }
}

class OccupancyDataProcessor {
  private weeklyOccupancyMap: WeeklyOccupancyMap = {}
  private overallOccupancyMap: OverallOccupancyMap = {}
  private overallOccupancyAccumulator: OverallOccupancyAccumulator = {}
  private occupancyAccumulator: OccupancyAccumulator = {
    sum: 0,
    count: 0,
    min: Infinity,
    max: -Infinity,
  }
  private previousContext: {
    weekId: string
    day: string
    hour: number
    hourlyMaxCapacity: number
  } | null = null

  private formatNumber(value: number): number {
    if (value < 1) {
      return Number(value.toFixed(1))
    }
    return Math.round(value)
  }

  private initializeWeeklyOccupancyEntry(
    weekId: string,
    day: string,
    hour: number,
    date: Date
  ): void {
    if (!this.weeklyOccupancyMap[weekId]) {
      this.weeklyOccupancyMap[weekId] = {}
    }
    if (!this.weeklyOccupancyMap[weekId][day]) {
      this.weeklyOccupancyMap[weekId][day] = {
        maxDayValues: { utilizationRate: 0, maxOccupancy: 0 },
      }
    }
    if (!this.weeklyOccupancyMap[weekId][day][hour]) {
      this.weeklyOccupancyMap[weekId][day][hour] = {
        date,
        day,
        hour,
      } as HourlyOccupancySummary
    }
  }

  private initializeOverallOccupancyEntry(day: string, hour: number): void {
    if (!this.overallOccupancyMap[day]) {
      this.overallOccupancyMap[day] = {
        maxDayValues: { averageUtilizationRate: 0 },
      }
      this.overallOccupancyAccumulator[day] = {}
    }
    if (!this.overallOccupancyMap[day][hour]) {
      this.overallOccupancyMap[day][hour] = { averageUtilizationRate: 0 }
      this.overallOccupancyAccumulator[day][hour] = { sum: 0, count: 0 }
    }
  }

  private resetAccumulator(): void {
    this.occupancyAccumulator = {
      sum: 0,
      count: 0,
      min: Infinity,
      max: -Infinity,
    }
  }

  private updateAccumulator(hourlyOccupancy: number): void {
    if (hourlyOccupancy > 0) {
      this.occupancyAccumulator.sum += hourlyOccupancy
      this.occupancyAccumulator.count += 1
    }
    this.occupancyAccumulator.min = Math.min(
      hourlyOccupancy,
      this.occupancyAccumulator.min
    )
    this.occupancyAccumulator.max = Math.max(
      hourlyOccupancy,
      this.occupancyAccumulator.max
    )
  }

  private processPreviousHour(): void {
    if (!this.previousContext) return
    const { weekId, day, hour, hourlyMaxCapacity } = this.previousContext
    this.processWeeklyOccupancy(weekId, day, hour, hourlyMaxCapacity)
    this.processOverallOccupancy(weekId, day, hour)
  }

  public finalizeProcessing(): void {
    this.processPreviousHour()
    this.updateOverallMaxDayValues()
  }

  public processWeeklyOccupancy(
    weekId: string,
    day: string,
    hour: number,
    hourlyMaxCapacity: number
  ): void {
    const hourlyOccupancySummary =
      this.weeklyOccupancyMap[weekId]?.[day]?.[hour]
    if (!hourlyOccupancySummary) return

    const minOccupancy = this.occupancyAccumulator.min
    const maxOccupancy = this.occupancyAccumulator.max
    const averageOccupancy = this.formatNumber(
      this.occupancyAccumulator.count > 0
        ? this.occupancyAccumulator.sum / this.occupancyAccumulator.count
        : 0
    )
    const utilizationRate = this.formatNumber(
      (averageOccupancy / hourlyMaxCapacity) * 100
    )
    const remainingCapacity = hourlyMaxCapacity - averageOccupancy

    // Update the summary with finalized statistics
    this.weeklyOccupancyMap[weekId][day][hour] = {
      ...hourlyOccupancySummary,
      minOccupancy,
      maxOccupancy,
      averageOccupancy,
      utilizationRate,
      remainingCapacity,
      maximumCapacity: hourlyMaxCapacity,
    } as HourlyOccupancySummary

    this.updateWeeklyMaxDayValues(weekId, day, utilizationRate, maxOccupancy)
  }

  private updateWeeklyMaxDayValues(
    weekId: string,
    day: string,
    utilizationRate: number,
    maxOccupancy: number
  ): void {
    const weeklyMaxDayValues = this.weeklyOccupancyMap[weekId][day].maxDayValues
    weeklyMaxDayValues.utilizationRate = Math.max(
      weeklyMaxDayValues.utilizationRate,
      utilizationRate
    )
    weeklyMaxDayValues.maxOccupancy = Math.max(
      weeklyMaxDayValues.maxOccupancy,
      maxOccupancy
    )
  }

  private processOverallOccupancy(
    weekId: string,
    day: string,
    hour: number
  ): void {
    const hourlyUtilizationRate =
      this.weeklyOccupancyMap[weekId][day][hour].utilizationRate
    if (hourlyUtilizationRate > 0) {
      const hourlyOverallAccumulator =
        this.overallOccupancyAccumulator[day][hour]
      hourlyOverallAccumulator.sum += hourlyUtilizationRate
      hourlyOverallAccumulator.count += 1
      this.overallOccupancyMap[day][hour].averageUtilizationRate =
        this.formatNumber(
          hourlyOverallAccumulator.sum / hourlyOverallAccumulator.count
        )
    }
  }

  private updateOverallMaxDayValues() {
    Object.keys(this.overallOccupancyMap).forEach((day) => {
      const dayData = this.overallOccupancyMap[day]
      const { maxDayValues } = dayData

      Object.keys(dayData).forEach((hour) => {
        if (hour !== 'maxDayValues') {
          const hourlyData = dayData[parseInt(hour)]
          maxDayValues.averageUtilizationRate = Math.max(
            maxDayValues.averageUtilizationRate,
            hourlyData.averageUtilizationRate
          )
        }
      })
    })
  }

  public processRecord(
    occupancyRecord: OccupancyRecord,
    hourlyMaxCapacity: number
  ): void {
    const { day, hour, occupancy: hourlyOccupancy } = occupancyRecord
    // Ensure the date is in Prague timezone
    const date = createPragueDate(occupancyRecord.date)
    const weekId = getWeekId(date)
    this.initializeWeeklyOccupancyEntry(weekId, day, hour, date)
    this.initializeOverallOccupancyEntry(day, hour)

    if (this.previousContext && this.previousContext.hour !== hour) {
      this.processPreviousHour()
      this.resetAccumulator()
    }
    this.previousContext = { weekId, day, hour, hourlyMaxCapacity }
    this.updateAccumulator(
      hourlyOccupancy,
      this.weeklyOccupancyMap[weekId][day][hour]
    )
  }

  public getWeeklyOccupancyMap(): WeeklyOccupancyMap {
    return this.weeklyOccupancyMap
  }

  public getOverallOccupancyMap(): OverallOccupancyMap {
    return this.overallOccupancyMap
  }
}
