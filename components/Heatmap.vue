<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <HeatmapHeader :view-mode="viewMode" :selected-week-id="selectedWeekId" />
    <HeatmapLoadingState v-if="!dataProcessor" />
    <div v-else class="overflow-x-auto">
      <HeatmapHourLabels :hours="hours" :is-desktop="isDesktop" />
      <HeatmapGrid
        :sorted-days="sortedDays"
        :hours="hours"
        :is-desktop="isDesktop"
        :get-cell-data="getCellData"
        :get-day-label="getDayLabel"
      />
      <HeatmapLegend :legend-items="legendItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  OverallOccupancyMap,
  WeeklyOccupancyMap,
  BaseCellData,
} from '~/types'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'

type ViewMode = 'overall' | 'weekly-average' | 'weekly-raw'

interface Props {
  overallOccupancyMap: OverallOccupancyMap
  weeklyOccupancyMap?: WeeklyOccupancyMap
  viewMode?: ViewMode
  selectedWeekId?: string | null
  heatmapHighThreshold?: number
  tooltipTranslationKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  weeklyOccupancyMap: () => ({}),
  viewMode: 'overall',
  selectedWeekId: null,
  heatmapHighThreshold: 60,
  tooltipTranslationKey: 'heatmap:overallTooltip',
})

// Dummy translation function
const t = (
  key: string,
  options?: { [key: string]: string | number }
): string => {
  return (
    (options?.utilization ? ` ${options.utilization}%` : '') +
    (options?.hour ? ` at ${options.hour}:00` : '')
  )
}

const isDesktop = useMediaQuery('(min-width: 1024px)')
const hours = Array.from({ length: 16 }, (_, i) => i + 6)

const dataProcessor = computed(() => {
  // For overall view, check if overallOccupancyMap has data
  if (props.viewMode === 'overall') {
    if (
      !props.overallOccupancyMap ||
      Object.keys(props.overallOccupancyMap).length === 0
    ) {
      return null
    }
  } else {
    // For weekly views, check if weeklyOccupancyMap and selectedWeekId are valid
    if (
      !props.weeklyOccupancyMap ||
      !props.selectedWeekId ||
      !props.weeklyOccupancyMap[props.selectedWeekId]
    ) {
      return null
    }
  }

  return new HeatmapDataProcessor(
    props.weeklyOccupancyMap || {},
    props.overallOccupancyMap,
    props.heatmapHighThreshold,
    props.tooltipTranslationKey,
    t
  )
})

const sortedDays = computed(() => {
  if (props.viewMode === 'overall') {
    if (!props.overallOccupancyMap) return []
    const days = Object.keys(props.overallOccupancyMap)
    return sortDaysByWeekOrder(days)
  } else {
    // For weekly views
    if (!props.weeklyOccupancyMap || !props.selectedWeekId) return []
    const weekData = props.weeklyOccupancyMap[props.selectedWeekId]
    if (!weekData) return []
    const days = Object.keys(weekData).filter((key) => key !== 'maxDayValues')
    return sortDaysByWeekOrder(days)
  }
})

const sortDaysByWeekOrder = (days: string[]): string[] => {
  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
}

// Function to get cell data for a specific day and hour
const getCellData = (day: string, hour: number): BaseCellData | undefined => {
  if (!dataProcessor.value) return undefined

  if (props.viewMode === 'overall') {
    return dataProcessor.value.getOverallCellData(day, hour)
  } else if (props.viewMode === 'weekly-average' && props.selectedWeekId) {
    return dataProcessor.value.getCellData(props.selectedWeekId, day, hour)
  } else if (props.viewMode === 'weekly-raw' && props.selectedWeekId) {
    return dataProcessor.value.getRawCellData(props.selectedWeekId, day, hour)
  }
  return undefined
}

const legendItems = computed(() => {
  if (!dataProcessor.value) return []
  return dataProcessor.value.getLegendItems()
})

const getDayLabel = (day: string): string => {
  if (!isDesktop.value) {
    // Return first 3 letters for mobile
    return day.substring(0, 3)
  }
  return day
}
</script>
