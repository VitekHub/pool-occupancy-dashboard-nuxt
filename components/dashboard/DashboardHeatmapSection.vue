<template>
  <div
    :class="
      !isMobile && poolStore.forceMobileView
        ? 'w-[500px] mx-auto'
        : 'max-w-fit mx-auto'
    "
  >
    <DashboardViewControls @view-state-changed="handleViewStateChanged" />
    <Heatmap
      :overall-occupancy-map="overallOccupancyMap"
      :weekly-occupancy-map="weeklyOccupancyMap"
      :view-mode="currentViewMode"
      :selected-week-id="currentSelectedWeekId"
    />
  </div>
</template>

<script setup lang="ts">
import type { OverallOccupancyMap, WeeklyOccupancyMap, ViewMode } from '~/types'
import { VIEW_MODES } from '~/types'

const poolStore = usePoolStore()
const isMobile = computed(() => {
  return !useMediaQuery('(min-width: 1024px)').value
})
interface Props {
  overallOccupancyMap: OverallOccupancyMap
  weeklyOccupancyMap: WeeklyOccupancyMap
}
defineProps<Props>()

const currentViewMode = ref<ViewMode>(VIEW_MODES.OVERALL)
const currentSelectedWeekId = ref<string | null>(null)
const handleViewStateChanged = ({
  viewMode,
  selectedWeekId,
}: {
  viewMode: ViewMode
  selectedWeekId: string | null
}) => {
  currentViewMode.value = viewMode
  currentSelectedWeekId.value = selectedWeekId
}
</script>
