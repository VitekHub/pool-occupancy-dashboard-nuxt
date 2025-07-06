<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <HeatmapHeader />
    <HeatmapLoadingState v-if="!dataProcessor" />
    <div v-else class="overflow-x-auto">
      <h2 class="mt-2 h2-title">
        <PoolNavigator />
      </h2>
      <HeatmapHourLabels :hours="hours" />
      <HeatmapGrid
        :sorted-days="sortedDays"
        :hours="hours"
        :get-cell-data="getCellData"
      />
      <h2 v-if="!isDesktop" class="mt-4 h2-title">
        <PoolNavigator />
      </h2>
      <HeatmapLegend :legend-items="legendItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { isDesktop } = useDesktopView()

import type { BaseCellData } from '~/types'
import { METRIC_TYPES, VIEW_MODES } from '~/types'
import { getWeekId } from '~/utils/dateUtils'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'

const poolStore = usePoolStore()
const tooltipTranslationKey = computed(
  () => `heatmap.${poolStore.viewMode}.${poolStore.metricType}.tooltip`
)
const hours = Array.from({ length: 16 }, (_, i) => i + 6)
const dataProcessor = computed(() => {
  // For overall view, check if overallOccupancyMap has data
  if (poolStore.viewMode === VIEW_MODES.OVERALL) {
    if (
      !poolStore.overallOccupancyMap ||
      Object.keys(poolStore.overallOccupancyMap).length === 0
    ) {
      return null
    }
  } else {
    // For weekly views, check if weeklyOccupancyMap and selectedWeekId are valid
    if (
      !poolStore.weeklyOccupancyMap ||
      !poolStore.selectedWeekId ||
      !poolStore.weeklyOccupancyMap[poolStore.selectedWeekId]
    ) {
      return null
    }
  }

  return new HeatmapDataProcessor(
    poolStore.weeklyOccupancyMap,
    poolStore.overallOccupancyMap,
    poolStore.heatmapHighThreshold,
    tooltipTranslationKey.value,
    t
  )
})

const sortedDays = computed(() => {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]
  if (poolStore.viewMode === VIEW_MODES.OVERALL) {
    if (!poolStore.overallOccupancyMap) return []
    return days
  } else {
    // For weekly views
    if (!poolStore.weeklyOccupancyMap || !poolStore.selectedWeekId) return []
    const today = new Date()
    const currentWeekId = getWeekId(today)
    const dayIndex = today.getDay()
    if (poolStore.selectedWeekId === currentWeekId && dayIndex > 0) {
      // for this week filter out future (empty) days
      return days.slice(0, dayIndex)
    }
    return days
  }
})

// Function to get cell data for a specific day and hour
const getCellData = (day: string, hour: number): BaseCellData | undefined => {
  if (!dataProcessor.value) return undefined

  if (poolStore.viewMode === VIEW_MODES.OVERALL) {
    if (poolStore.metricType === METRIC_TYPES.AVERAGE)
      return dataProcessor.value.getOverallAverageCellData(day, hour)
    else if (poolStore.metricType === METRIC_TYPES.MEDIAN)
      return dataProcessor.value.getOverallMedianCellData(day, hour)
  } else if (
    poolStore.viewMode === VIEW_MODES.WEEKLY &&
    poolStore.selectedWeekId
  ) {
    if (poolStore.metricType === METRIC_TYPES.PERCENTAGE)
      return dataProcessor.value.getWeeklyPercentageCellData(
        poolStore.selectedWeekId,
        day,
        hour
      )
    else if (poolStore.metricType === METRIC_TYPES.MIN_MAX)
      return dataProcessor.value.getWeeklyRawMinMaxCellData(
        poolStore.selectedWeekId,
        day,
        hour
      )
    else if (poolStore.metricType === METRIC_TYPES.AVERAGE)
      return dataProcessor.value.getWeeklyRawAverageCellData(
        poolStore.selectedWeekId,
        day,
        hour
      )
    return
  }
  return undefined
}

const legendItems = computed(() => {
  if (!dataProcessor.value) return []
  return dataProcessor.value.getLegendItems()
})
</script>

<style scoped>
.h2-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-2;
}
</style>
