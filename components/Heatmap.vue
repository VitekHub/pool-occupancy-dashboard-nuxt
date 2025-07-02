<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <HeatmapHeader />
    <HeatmapLoadingState v-if="!dataProcessor" />
    <div v-else class="overflow-x-auto">
      <HeatmapHourLabels :hours="hours" />
      <HeatmapGrid
        :sorted-days="sortedDays"
        :hours="hours"
        :get-cell-data="getCellData"
      />
      <HeatmapLegend :legend-items="legendItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import type { BaseCellData } from '~/types'
import { VIEW_MODES } from '~/types'
import { getWeekId } from '~/utils/dateUtils'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'

const poolStore = usePoolStore()
const tooltipTranslationKey = computed(
  () => `heatmap.${poolStore.viewMode}.tooltip`
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
    if (poolStore.selectedWeekId === currentWeekId) {
      // for this week filter out future (empty) days
      return days.slice(0, today.getDay())
    }
    return days
  }
})

// Function to get cell data for a specific day and hour
const getCellData = (day: string, hour: number): BaseCellData | undefined => {
  if (!dataProcessor.value) return undefined

  if (poolStore.viewMode === VIEW_MODES.OVERALL) {
    return dataProcessor.value.getOverallCellData(day, hour)
  } else if (
    poolStore.viewMode === VIEW_MODES.WEEKLY_AVERAGE &&
    poolStore.selectedWeekId
  ) {
    return dataProcessor.value.getCellData(poolStore.selectedWeekId, day, hour)
  } else if (
    poolStore.viewMode === VIEW_MODES.WEEKLY_RAW &&
    poolStore.selectedWeekId
  ) {
    return dataProcessor.value.getRawCellData(
      poolStore.selectedWeekId,
      day,
      hour
    )
  }
  return undefined
}

const legendItems = computed(() => {
  if (!dataProcessor.value) return []
  return dataProcessor.value.getLegendItems()
})
</script>
