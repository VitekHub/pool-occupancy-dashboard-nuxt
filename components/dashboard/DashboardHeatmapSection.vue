<template>
  <div class="max-w-fit mx-auto">
    <DashboardViewControls @view-state-changed="handleViewStateChanged" />

    <!-- Occupancy Heatmap -->
    <div>
      <Heatmap
        :overall-occupancy-map="overallOccupancyMap"
        :weekly-occupancy-map="weeklyOccupancyMap"
        :view-mode="currentViewMode"
        :selected-week-id="currentSelectedWeekId"
        tooltip-translation-key="heatmap:overallTooltip"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OverallOccupancyMap, WeeklyOccupancyMap } from '~/types'

type ViewMode = 'overall' | 'weekly-average' | 'weekly-raw'

interface Props {
  overallOccupancyMap: OverallOccupancyMap
  weeklyOccupancyMap: WeeklyOccupancyMap
}

defineProps<Props>()

// Local state to track current view settings
const currentViewMode = ref<ViewMode>('overall')
const currentSelectedWeekId = ref<string | null>(null)

// Handle view state changes from DashboardViewControls
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
