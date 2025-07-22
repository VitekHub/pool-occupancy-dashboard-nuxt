import type {
  OccupancyRecord,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  HourlyOccupancySummary,
  OverallUtilizationValues,
} from '~/types'
import { getWeekId, createPragueDate } from './dateUtils'
import OccupancyDataAccumulator from './occupancyDataAccumulator'

export default class OccupancyDataProcessor {
  private accumulator: OccupancyDataAccumulator = new OccupancyDataAccumulator()
  private weeklyOccupancyMap: WeeklyOccupancyMap = {}
  private overallOccupancyMap: OverallOccupancyMap = {
    maxOverallValues: {
      averageUtilizationRate: 0,
      weightedAverageUtilizationRate: 0,
      medianUtilizationRate: 0,
    },
    days: {},
  }
  private previousContext: {
    weekId: string
    day: string
    hour: number
    hourlyMaxCapacity: number
  } | null = null

  private initializeWeeklyOccupancyEntry(
    weekId: string,
    day: string,
    hour: number,
    date: Date
  ): void {
    if (!this.weeklyOccupancyMap[weekId]) {
      this.weeklyOccupancyMap[weekId] = {
        maxWeekValues: { utilizationRate: 0 },
        days: {},
      }
    }
    if (!this.weeklyOccupancyMap[weekId].days[day]) {
      this.weeklyOccupancyMap[weekId].days[day] = {
        maxDayValues: { utilizationRate: 0 },
      }
    }
    if (!this.weeklyOccupancyMap[weekId].days[day][hour]) {
      this.weeklyOccupancyMap[weekId].days[day][hour] = {
        date,
        day,
        hour,
      } as HourlyOccupancySummary
    }
  }

  private initializeOverallOccupancyEntry(day: string, hour: number): void {
    if (!this.overallOccupancyMap.days[day]) {
      this.overallOccupancyMap.days[day] = {
        maxDayValues: {
          averageUtilizationRate: 0,
          weightedAverageUtilizationRate: 0,
          medianUtilizationRate: 0,
        },
      }
    }
    if (!this.overallOccupancyMap.days[day][hour]) {
      this.overallOccupancyMap.days[day][hour] = {
        averageUtilizationRate: 0,
        weightedAverageUtilizationRate: 0,
        medianUtilizationRate: 0,
      }
    }
  }
  private processPreviousRecord(): void {
    if (!this.previousContext) return
    const { weekId, day, hour, hourlyMaxCapacity } = this.previousContext
    this.processWeeklyOccupancy(weekId, day, hour, hourlyMaxCapacity)
    this.processOverallOccupancy(weekId, day, hour)
  }

  public finalizeProcessing(): void {
    this.processPreviousRecord()
    this.updateOverallMaxDayValues()
  }

  public processWeeklyOccupancy(
    weekId: string,
    day: string,
    hour: number,
    hourlyMaxCapacity: number
  ): void {
    const hourlyOccupancySummary =
      this.weeklyOccupancyMap[weekId]?.days?.[day]?.[hour]
    if (!hourlyOccupancySummary) return

    const occupancyValues =
      this.accumulator.processWeeklyOccupancy(hourlyMaxCapacity)

    // Update the summary with finalized statistics
    this.weeklyOccupancyMap[weekId].days[day][hour] = {
      ...hourlyOccupancySummary,
      ...occupancyValues,
      maximumCapacity: hourlyMaxCapacity,
    } as HourlyOccupancySummary

    this.updateWeeklyMaxDayValues(weekId, day, occupancyValues.utilizationRate)
  }

  private updateWeeklyMaxDayValues(
    weekId: string,
    day: string,
    utilizationRate: number
  ): void {
    const dialyMaxValues =
      this.weeklyOccupancyMap[weekId].days[day].maxDayValues
    dialyMaxValues.utilizationRate = Math.max(
      dialyMaxValues.utilizationRate,
      utilizationRate
    )

    const weeklyMaxValues = this.weeklyOccupancyMap[weekId].maxWeekValues
    weeklyMaxValues.utilizationRate = Math.max(
      weeklyMaxValues.utilizationRate,
      utilizationRate
    )
  }

  private processOverallOccupancy(
    weekId: string,
    day: string,
    hour: number
  ): void {
    const hourlyUtilizationRate =
      this.weeklyOccupancyMap[weekId].days[day][hour].utilizationRate
    if (hourlyUtilizationRate > 0) {
      const { averageUtilizationRate, weightedAverageUtilizationRate } =
        this.accumulator.processOverallAverageOccupancy(
          hourlyUtilizationRate,
          day,
          hour
        )
      this.overallOccupancyMap.days[day][hour].averageUtilizationRate =
        averageUtilizationRate
      this.overallOccupancyMap.days[day][hour].weightedAverageUtilizationRate =
        weightedAverageUtilizationRate
    }
  }

  private updateOverallMaxDayValues() {
    const setMaxValues = (
      maxValues: OverallUtilizationValues,
      propertyName: keyof OverallUtilizationValues,
      hourlyData: OverallUtilizationValues
    ) => {
      maxValues[propertyName] = Math.max(
        maxValues[propertyName],
        hourlyData[propertyName]
      )
    }

    const { maxOverallValues } = this.overallOccupancyMap
    for (const day of Object.keys(this.overallOccupancyMap.days)) {
      const dayData = this.overallOccupancyMap.days[day]
      const { maxDayValues } = dayData

      for (const hour of Object.keys(dayData)) {
        if (hour === 'maxDayValues') {
          continue
        }
        const hourlyData = dayData[parseInt(hour)]
        hourlyData.medianUtilizationRate =
          this.accumulator.processOverallMedianOccupancy(day, parseInt(hour))

        for (const maxValues of [maxDayValues, maxOverallValues]) {
          setMaxValues(maxValues, 'averageUtilizationRate', hourlyData)
          setMaxValues(maxValues, 'weightedAverageUtilizationRate', hourlyData)
          setMaxValues(maxValues, 'medianUtilizationRate', hourlyData)
        }
      }
    }
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
    this.accumulator.initializeOverallAccumulator(day, hour)

    if (
      this.previousContext &&
      (this.previousContext.weekId !== weekId ||
        this.previousContext.day !== day ||
        this.previousContext.hour !== hour)
    ) {
      this.processPreviousRecord()
      this.accumulator.resetWeeklyAccumulator()
    }
    this.previousContext = { weekId, day, hour, hourlyMaxCapacity }
    this.accumulator.updateWeeklyAccumulator(hourlyOccupancy)
  }

  public getWeeklyOccupancyMap(): WeeklyOccupancyMap {
    return this.weeklyOccupancyMap
  }

  public getOverallOccupancyMap(): OverallOccupancyMap {
    return this.overallOccupancyMap
  }
}
