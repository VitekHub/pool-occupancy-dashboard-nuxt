import type {
  BaseCellData,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  HourlyOccupancySummary,
  OverallUtilizationValues,
} from '~/types'
import { UTILIZATION_COLORS } from '~/types'
import { getWeekId, isDayToday, nowInPrague } from '~/utils/dateUtils'
import HeatmapColorProcessor from './heatmapColorProcessor'

type TranslationFunction = (
  key: string,
  options?: { [key: string]: string | number }
) => string

export default class HeatmapDataProcessor {
  private heatmapColorProcessor: HeatmapColorProcessor
  constructor(
    private weeklyOccupancyMap: WeeklyOccupancyMap,
    private overallOccupancyMap: OverallOccupancyMap,
    private heatmapHighThreshold: number,
    private tooltipTranslationKey: string,
    private t: TranslationFunction
  ) {
    this.heatmapColorProcessor = new HeatmapColorProcessor(
      this.heatmapHighThreshold
    )
  }

  public getLegendItems(): { color: string; label: string }[] {
    return this.heatmapColorProcessor.getLegendItems()
  }

  private isCurrentHour(day: string, hour: number) {
    return isDayToday(day) && hour === nowInPrague().getHours()
  }

  private getDayMaxUtilizationByWeek(selectedWeekId: string): number {
    const maxValueInWeek =
      this.weeklyOccupancyMap[selectedWeekId]?.maxWeekValues.utilizationRate ||
      0
    const maxValueOverall =
      this.overallOccupancyMap?.maxOverallValues.averageUtilizationRate || 0

    const currentWeekId = getWeekId(nowInPrague())
    if (selectedWeekId === currentWeekId) {
      return Math.max(maxValueInWeek, maxValueOverall)
    } else {
      return maxValueInWeek
    }
  }

  private getBaseCellData({
    utilizationRate,
    maxDayUtilizationRate,
    displayText,
    title,
    day,
    hour,
  }: {
    utilizationRate: number
    maxDayUtilizationRate: number
    displayText: string
    title: string
    day: string
    hour: number
  }): BaseCellData {
    return {
      color: this.heatmapColorProcessor.getColor(utilizationRate),
      colorFillRatio: this.heatmapColorProcessor.getColorFillRatio(
        utilizationRate,
        maxDayUtilizationRate
      ),
      displayText,
      title,
      isCurrentHour: this.isCurrentHour(day, hour),
    }
  }

  private getCellDataWithUtilization({
    utilizationRate,
    maxDayUtilizationRate,
    day,
    hour,
  }: {
    utilizationRate: number
    maxDayUtilizationRate: number
    day: string
    hour: number
  }): BaseCellData {
    return this.getBaseCellData({
      utilizationRate,
      maxDayUtilizationRate,
      displayText: utilizationRate > 0 ? `${utilizationRate}%` : '',
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common.days.${day.toLowerCase()}`),
        hour,
        utilization: utilizationRate,
      }),
      day,
      hour,
    })
  }

  private getOverallCellData(
    day: string,
    hour: number,
    type: keyof OverallUtilizationValues
  ): BaseCellData {
    const utilizationRate =
      this.overallOccupancyMap?.days?.[day]?.[hour]?.[type] || 0
    const maxDayUtilizationRate =
      this.overallOccupancyMap?.maxOverallValues[type] || 0

    return this.getCellDataWithUtilization({
      utilizationRate,
      maxDayUtilizationRate,
      day,
      hour,
    })
  }

  public getOverallMedianCellData(day: string, hour: number): BaseCellData {
    return this.getOverallCellData(day, hour, 'medianUtilizationRate')
  }

  public getOverallAverageCellData(day: string, hour: number): BaseCellData {
    return this.getOverallCellData(day, hour, 'averageUtilizationRate')
  }

  public getOverallWeightedAverageCellData(
    day: string,
    hour: number
  ): BaseCellData {
    return this.getOverallCellData(day, hour, 'weightedAverageUtilizationRate')
  }

  private getWeeklyOccupancyByHour(
    selectedWeekId: string,
    day: string,
    hour: number
  ): HourlyOccupancySummary {
    const today = nowInPrague()
    const currentWeekId = getWeekId(today)
    const isNow =
      selectedWeekId === currentWeekId &&
      isDayToday(day) &&
      today.getHours() === hour
    const hourlyData =
      this.weeklyOccupancyMap[selectedWeekId]?.days?.[day]?.[hour]
    if (isNow && !hourlyData) {
      // return previous hour data in case current hour is not available yet
      return this.weeklyOccupancyMap[selectedWeekId]?.days?.[day]?.[hour - 1]
    }
    return hourlyData
  }

  public getWeeklyPercentageCellData(
    selectedWeekId: string,
    day: string,
    hour: number
  ): BaseCellData {
    const utilizationRate =
      this.getWeeklyOccupancyByHour(selectedWeekId, day, hour)
        ?.utilizationRate || 0

    return this.getCellDataWithUtilization({
      utilizationRate,
      maxDayUtilizationRate: this.getDayMaxUtilizationByWeek(selectedWeekId),
      day,
      hour,
    })
  }

  private getEmptyBaseCellData() {
    return {
      color: UTILIZATION_COLORS.EMPTY,
      colorFillRatio: 0,
      displayText: '',
      title: '',
      isCurrentHour: false,
    }
  }

  public getWeeklyRawMinMaxCellData(
    selectedWeekId: string,
    day: string,
    hour: number
  ): BaseCellData {
    const hourlyData = this.getWeeklyOccupancyByHour(selectedWeekId, day, hour)
    if (!hourlyData) {
      return this.getEmptyBaseCellData()
    }

    const displayText =
      hourlyData.minOccupancy === hourlyData.maxOccupancy
        ? `${hourlyData.minOccupancy}`
        : `${hourlyData.minOccupancy}-${hourlyData.maxOccupancy}`

    const maxDayUtilizationRate =
      this.getDayMaxUtilizationByWeek(selectedWeekId)

    return this.getBaseCellData({
      utilizationRate: hourlyData.utilizationRate,
      maxDayUtilizationRate,
      displayText,
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common.days.${day.toLowerCase()}`),
        hour,
        min: hourlyData.minOccupancy,
        max: hourlyData.maxOccupancy,
      }),
      day,
      hour,
    })
  }

  public getWeeklyRawAverageCellData(
    selectedWeekId: string,
    day: string,
    hour: number
  ): BaseCellData {
    const hourlyData = this.getWeeklyOccupancyByHour(selectedWeekId, day, hour)
    if (!hourlyData) {
      return this.getEmptyBaseCellData()
    }

    const maxDayUtilizationRate =
      this.getDayMaxUtilizationByWeek(selectedWeekId)

    return this.getBaseCellData({
      utilizationRate: hourlyData.utilizationRate,
      maxDayUtilizationRate,
      displayText: `${hourlyData.averageOccupancy}`,
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common.days.${day.toLowerCase()}`),
        hour,
        average: hourlyData.averageOccupancy,
      }),
      day,
      hour,
    })
  }
}
