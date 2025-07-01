import {
  type BaseCellData,
  type WeeklyOccupancyMap,
  type OverallOccupancyMap,
  UTILIZATION_COLORS,
  UTILIZATION_THRESHOLDS,
} from '~/types'
import { getWeekId, getDayName } from '~/utils/dateUtils'

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
    return (
      day.toLowerCase() === getDayName(new Date()).toLowerCase() &&
      hour === new Date().getHours()
    )
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

    const today = new Date()
    const todayName = today.toLocaleDateString('en-US', { weekday: 'long' })
    const currentWeekId = getWeekId(today)
    const isToday =
      selectedWeekId === currentWeekId &&
      day.toLowerCase() === todayName.toLowerCase()
    if (isToday) {
      return Math.max(maxValueInWeek, maxValueOverall)
    } else {
      return maxValueInWeek
    }
  }

  private getBaseCellData({
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
    return {
      color: this.getColor(utilizationRate),
      colorFillRatio: this.getColorFillRatio(
        utilizationRate,
        maxDayUtilizationRate
      ),
      displayText: utilizationRate > 0 ? `${utilizationRate}%` : '',
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common.days.${day.toLowerCase()}`),
        hour,
        utilization: utilizationRate,
      }),
      isCurrentHour: this.isCurrentHour(day, hour),
    }
  }

  public getCellData(
    selectedWeekId: string,
    day: string,
    hour: number
  ): BaseCellData {
    const utilizationRate =
      this.weeklyOccupancyMap[selectedWeekId]?.[day]?.[hour]?.utilizationRate ||
      0

    return this.getBaseCellData({
      utilizationRate,
      maxDayUtilizationRate: this.getDayMaxUtilizationByWeek(
        selectedWeekId,
        day
      ),
      day,
      hour,
    })
  }

  public getOverallCellData(day: string, hour: number): BaseCellData {
    const averageUtilizationRate =
      this.overallOccupancyMap[day]?.[hour]?.averageUtilizationRate || 0
    const maxDayAverageUtilizationRate =
      this.overallOccupancyMap[day]?.maxDayValues.averageUtilizationRate || 0

    return this.getBaseCellData({
      utilizationRate: averageUtilizationRate,
      maxDayUtilizationRate: maxDayAverageUtilizationRate,
      day,
      hour,
    })
  }

  public getRawCellData(
    selectedWeekId: string,
    day: string,
    hour: number
  ): BaseCellData {
    const hourlyData = this.weeklyOccupancyMap[selectedWeekId]?.[day]?.[hour]
    if (!hourlyData) {
      return {
        color: UTILIZATION_COLORS.EMPTY,
        colorFillRatio: 0,
        displayText: '',
        title: '',
        isCurrentHour: false,
      }
    }

    const displayText =
      hourlyData.minOccupancy === hourlyData.maxOccupancy
        ? hourlyData.minOccupancy > 0
          ? `${hourlyData.minOccupancy}`
          : ''
        : `${hourlyData.minOccupancy}-${hourlyData.maxOccupancy}`

    const maxDayUtilizationRate = this.getDayMaxUtilizationByWeek(
      selectedWeekId,
      day
    )

    return {
      color: this.getColor(hourlyData.utilizationRate),
      colorFillRatio: this.getColorFillRatio(
        hourlyData.utilizationRate,
        maxDayUtilizationRate
      ),
      displayText,
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common.days.${day.toLowerCase()}`),
        hour,
        min: hourlyData.minOccupancy,
        max: hourlyData.maxOccupancy,
      }),
      isCurrentHour: this.isCurrentHour(day, hour),
    }
  }
}
