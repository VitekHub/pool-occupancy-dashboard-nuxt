import {
  type BaseCellData,
  type WeeklyOccupancyMap,
  type OverallOccupancyMap,
  UTILIZATION_COLORS,
  UTILIZATION_THRESHOLDS,
} from '~/types'
import { getWeekId, isDayToday, nowInPrague } from '~/utils/dateUtils'

type TranslationFunction = (
  key: string,
  options?: { [key: string]: string | number }
) => string

export default class HeatmapDataProcessor {
  constructor(
    private weeklyOccupancyMap: WeeklyOccupancyMap,
    private overallOccupancyMap: OverallOccupancyMap,
    private heatmapHighThreshold: number,
    private tooltipTranslationKey: string,
    private t: TranslationFunction
  ) {}

  public static getBarHeight(
    colorFillRatio: number,
    uniformHeatmapBarHeight: boolean
  ) {
    return `${colorFillRatio > 0 ? (uniformHeatmapBarHeight ? 100 : colorFillRatio * 100) : 0}%`
  }

  private adjustHeatmapThreshold(threshold: number) {
    return Math.round(this.heatmapHighThreshold * (threshold / 100))
  }

  private getLegendLabel(threshold: number) {
    return `<${this.adjustHeatmapThreshold(threshold)}%`
  }

  public getLegendItems(): { color: string; label: string }[] {
    return [
      {
        color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`,
        label: '0%',
      },
      {
        color: UTILIZATION_COLORS.VERY_LOW,
        label: this.getLegendLabel(UTILIZATION_THRESHOLDS.VERY_LOW),
      },
      {
        color: UTILIZATION_COLORS.LOW,
        label: this.getLegendLabel(UTILIZATION_THRESHOLDS.LOW),
      },
      {
        color: UTILIZATION_COLORS.MEDIUM,
        label: this.getLegendLabel(UTILIZATION_THRESHOLDS.MEDIUM),
      },
      {
        color: UTILIZATION_COLORS.HIGH,
        label: `<${this.heatmapHighThreshold}%`,
      },
      { color: UTILIZATION_COLORS.VERY_HIGH, label: `<${100}%` },
    ]
  }

  private getColor(rate: number): string {
    const veryLowThreshold = this.adjustHeatmapThreshold(
      UTILIZATION_THRESHOLDS.VERY_LOW
    )
    const lowThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.LOW)
    const mediumThreshold = this.adjustHeatmapThreshold(
      UTILIZATION_THRESHOLDS.MEDIUM
    )

    if (rate === 0) return UTILIZATION_COLORS.EMPTY
    if (rate < veryLowThreshold) return UTILIZATION_COLORS.VERY_LOW
    if (rate < lowThreshold) return UTILIZATION_COLORS.LOW
    if (rate < mediumThreshold) return UTILIZATION_COLORS.MEDIUM
    if (rate < this.heatmapHighThreshold) return UTILIZATION_COLORS.HIGH
    return UTILIZATION_COLORS.VERY_HIGH
  }

  private getColorFillRatio(
    utilizationRate: number,
    maxDayUtilizationRate: number
  ): number {
    return maxDayUtilizationRate > 0
      ? utilizationRate / maxDayUtilizationRate
      : 0
  }

  private isCurrentHour(day: string, hour: number) {
    return isDayToday(day) && hour === nowInPrague().getHours()
  }

  private getDayMaxUtilizationByWeek(
    selectedWeekId: string,
    day: string
  ): number {
    const maxValueInWeek =
      this.weeklyOccupancyMap[selectedWeekId]?.[day]?.maxDayValues
        .utilizationRate || 0
    const maxValueOverall =
      this.overallOccupancyMap[day]?.maxDayValues.averageUtilizationRate || 0

    const today = nowInPrague()
    const currentWeekId = getWeekId(today)
    const isToday = selectedWeekId === currentWeekId && isDayToday(day)
    if (isToday) {
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
      color: this.getColor(utilizationRate),
      colorFillRatio: this.getColorFillRatio(
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

  private getWeeklyOccupancyByHour(
    selectedWeekId: string,
    day: string,
    hour: number
  ) {
    const today = nowInPrague()
    const currentWeekId = getWeekId(today)
    const isNow =
      selectedWeekId === currentWeekId &&
      isDayToday(day) &&
      today.getHours() === hour
    const hourlyData = this.weeklyOccupancyMap[selectedWeekId]?.[day]?.[hour]
    if (isNow && !hourlyData) {
      // return previous hour data in case current hour is not available yet
      return this.weeklyOccupancyMap[selectedWeekId]?.[day]?.[hour - 1]
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
      maxDayUtilizationRate: this.getDayMaxUtilizationByWeek(
        selectedWeekId,
        day
      ),
      day,
      hour,
    })
  }

  public getOverallMedianCellData(day: string, hour: number): BaseCellData {
    const medianUtilizationRate =
      this.overallOccupancyMap[day]?.[hour]?.medianUtilizationRate || 0
    const maxDayMedianUtilizationRate =
      this.overallOccupancyMap[day]?.maxDayValues.medianUtilizationRate || 0

    return this.getCellDataWithUtilization({
      utilizationRate: medianUtilizationRate,
      maxDayUtilizationRate: maxDayMedianUtilizationRate,
      day,
      hour,
    })
  }

  public getOverallAverageCellData(day: string, hour: number): BaseCellData {
    const averageUtilizationRate =
      this.overallOccupancyMap[day]?.[hour]?.averageUtilizationRate || 0
    const maxDayAverageUtilizationRate =
      this.overallOccupancyMap[day]?.maxDayValues.averageUtilizationRate || 0

    return this.getCellDataWithUtilization({
      utilizationRate: averageUtilizationRate,
      maxDayUtilizationRate: maxDayAverageUtilizationRate,
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

    const maxDayUtilizationRate = this.getDayMaxUtilizationByWeek(
      selectedWeekId,
      day
    )

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

    const maxDayUtilizationRate = this.getDayMaxUtilizationByWeek(
      selectedWeekId,
      day
    )

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
