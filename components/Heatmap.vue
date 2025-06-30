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
        :selected-week-id="selectedWeekId"
      />
      <HeatmapLegend :legend-items="legendItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import type {
  OverallOccupancyMap,
  WeeklyOccupancyMap,
  BaseCellData,
  ViewMode,
} from '~/types'
import { VIEW_MODES } from '~/types'
import { getWeekId } from '~/utils/dateUtils'
import HeatmapDataProcessor from '~/utils/heatmapDataProcessor'

interface Props {
  overallOccupancyMap: OverallOccupancyMap
  weeklyOccupancyMap?: WeeklyOccupancyMap
  viewMode?: ViewMode
  selectedWeekId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  weeklyOccupancyMap: () => ({}),
  viewMode: VIEW_MODES.OVERALL,
  selectedWeekId: null,
})
const poolStore = usePoolStore()
const tooltipTranslationKey = computed(
  () => `heatmap.${props.viewMode}.tooltip`
)
const isDesktop = computed(() => {
  if (poolStore.forceMobileView) return false
  return useMediaQuery('(min-width: 1024px)').value
})
const hours = Array.from({ length: 16 }, (_, i) => i + 6)
const dataProcessor = computed(() => {
  // For overall view, check if overallOccupancyMap has data
  if (props.viewMode === VIEW_MODES.OVERALL) {
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
    props.weeklyOccupancyMap,
    props.overallOccupancyMap,
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
  if (props.viewMode === VIEW_MODES.OVERALL) {
    if (!props.overallOccupancyMap) return []
    return days
  } else {
    // For weekly views
    if (!props.weeklyOccupancyMap || !props.selectedWeekId) return []
    const today = new Date()
    const currentWeekId = getWeekId(today)
    if (props.selectedWeekId === currentWeekId) {
      // for this week filter out future (empty) days
      return days.slice(0, today.getDay())
    }
    return days
  }
})

// Function to get cell data for a specific day and hour
const getCellData = (day: string, hour: number): BaseCellData | undefined => {
  if (!dataProcessor.value) return undefined

  if (props.viewMode === VIEW_MODES.OVERALL) {
    return dataProcessor.value.getOverallCellData(day, hour)
  } else if (
    props.viewMode === VIEW_MODES.WEEKLY_AVERAGE &&
    props.selectedWeekId
  ) {
    return dataProcessor.value.getCellData(props.selectedWeekId, day, hour)
  } else if (props.viewMode === VIEW_MODES.WEEKLY_RAW && props.selectedWeekId) {
    return dataProcessor.value.getRawCellData(props.selectedWeekId, day, hour)
  }
  return undefined
}

const legendItems = computed(() => {
  if (!dataProcessor.value) return []
  return dataProcessor.value.getLegendItems()
})
</script>
