<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-fit mx-auto"
  >
    <HeatmapHeader />
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
import type { OverallOccupancyMap, BaseCellData } from '~/types'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'

interface Props {
  overallOccupancyMap: OverallOccupancyMap
  heatmapHighThreshold?: number
  tooltipTranslationKey?: string
}

const props = withDefaults(defineProps<Props>(), {
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
  if (
    !props.overallOccupancyMap ||
    Object.keys(props.overallOccupancyMap).length === 0
  ) {
    return null
  }

  return new HeatmapDataProcessor(
    {}, // Empty weekly map for overall view
    props.overallOccupancyMap,
    props.heatmapHighThreshold,
    props.tooltipTranslationKey,
    t
  )
})

const sortedDays = computed(() => {
  if (!props.overallOccupancyMap) return []

  const days = Object.keys(props.overallOccupancyMap)
  // Sort days by weekday order (Monday first)
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
})

// Function to get cell data for a specific day and hour
const getCellData = (day: string, hour: number): BaseCellData | undefined => {
  if (!dataProcessor.value) return undefined
  return dataProcessor.value.getOverallCellData(day, hour)
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
