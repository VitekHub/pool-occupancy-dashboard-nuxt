import { UTILIZATION_COLORS, UTILIZATION_THRESHOLDS } from '~/types'

export default class HeatmapColorProcessor {
  constructor(private heatmapHighThreshold: number) {}

  public static getBarHeight(
    colorFillRatio: number,
    uniformHeatmapBarHeight: boolean
  ) {
    return `${colorFillRatio > 0 ? (uniformHeatmapBarHeight ? 100 : colorFillRatio * 100) : 0}%`
  }

  private adjustHeatmapThreshold(threshold: number): number {
    return Math.round(this.heatmapHighThreshold * (threshold / 100))
  }

  private getLegendLabel(threshold: number): string {
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

  public getColor(rate: number): string {
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

  public getColorFillRatio(
    utilizationRate: number,
    maxDayUtilizationRate: number
  ): number {
    return maxDayUtilizationRate > 0
      ? utilizationRate / maxDayUtilizationRate
      : 0
  }
}
