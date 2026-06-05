import { computed } from 'vue'
import type {
  OverallOccupancyMap,
  WeeklyOccupancyMap,
  MetricType,
  HourlyOccupancySummary,
  LaneCellData,
} from '~/types'
import { METRIC_TYPES } from '~/types'

export interface DailyHourData {
  hour: number
  overallValue: number
  currentDay: HourlyOccupancySummary | null
  previousDay: HourlyOccupancySummary | null
}

export function buildDailyLaneCellData(
  summary: HourlyOccupancySummary
): LaneCellData | null {
  if (
    summary.totalLanes == null ||
    summary.openLanes == null ||
    summary.totalLanes === 0
  ) {
    return null
  }
  const openLanes = summary.openLanes
  const totalLanes = summary.totalLanes
  const openRatio = openLanes / totalLanes
  return {
    openLanes,
    totalLanes,
    openRatio,
    closedRatio: 1 - openRatio,
    displayText: `${openLanes}/${totalLanes}`,
    title: '',
  }
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

function getOverallMetricField(
  metricType: MetricType
): keyof import('~/types').OverallUtilizationValues {
  switch (metricType) {
    case METRIC_TYPES.WEIGHTED_AVERAGE:
      return 'weightedAverageUtilizationRate'
    case METRIC_TYPES.MEDIAN:
      return 'medianUtilizationRate'
    default:
      return 'averageUtilizationRate'
  }
}

export function useDailyChartData() {
  const poolStore = usePoolStore()

  const hours = HOURS

  const dayName = computed(() => poolStore.selectedDailyDayName)
  const currentWeekId = computed(() => poolStore.selectedDailyWeekId)
  const previousWeekId = computed(() => poolStore.selectedDailyPreviousWeekId)

  const hourlyData = computed((): DailyHourData[] => {
    const overallMap: OverallOccupancyMap = poolStore.overallOccupancyMap
    const weeklyMap: WeeklyOccupancyMap = poolStore.weeklyOccupancyMap
    const metric = poolStore.metricType
    const day = dayName.value
    const curWeek = currentWeekId.value
    const prevWeek = previousWeekId.value

    if (!day) return []

    const metricField = getOverallMetricField(metric)

    return hours.map((hour) => {
      const overallValue =
        overallMap?.days?.[day]?.hours?.[hour]?.[metricField] || 0

      const currentDay: HourlyOccupancySummary | null =
        weeklyMap?.[curWeek]?.days?.[day]?.hours?.[hour] || null

      const previousDay: HourlyOccupancySummary | null =
        weeklyMap?.[prevWeek]?.days?.[day]?.hours?.[hour] || null

      return { hour, overallValue, currentDay, previousDay }
    })
  })

  const areaChartValues = computed(() =>
    hourlyData.value.map((d) => d.overallValue)
  )

  const currentDayValues = computed(() =>
    hourlyData.value.map((d) => d.currentDay?.utilizationRate ?? null)
  )

  const previousDayValues = computed(() =>
    hourlyData.value.map((d) => d.previousDay?.utilizationRate ?? null)
  )

  const hasCurrentDayData = computed(() =>
    currentDayValues.value.some((v) => v !== null)
  )

  const hasPreviousDayData = computed(() =>
    previousDayValues.value.some((v) => v !== null)
  )

  const currentDayLaneData = computed(() =>
    hourlyData.value.map((d) =>
      d.currentDay ? buildDailyLaneCellData(d.currentDay) : null
    )
  )

  const hasCurrentDayLaneData = computed(() =>
    currentDayLaneData.value.some((v) => v !== null)
  )

  return {
    hours,
    hourlyData,
    areaChartValues,
    currentDayValues,
    previousDayValues,
    hasCurrentDayData,
    hasPreviousDayData,
    currentDayLaneData,
    hasCurrentDayLaneData,
    dayName,
    currentWeekId,
    previousWeekId,
  }
}
