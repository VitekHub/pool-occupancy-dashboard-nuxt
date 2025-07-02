<template>
  <div
    :class="
      !isMobile && poolStore.forceMobileView
        ? 'w-[500px] mx-auto'
        : 'max-w-fit mx-auto'
    "
  >
    <DashboardViewControls />
    <Heatmap
      :overall-occupancy-map="overallOccupancyMap"
      :weekly-occupancy-map="weeklyOccupancyMap"
    />
  </div>
</template>

<script setup lang="ts">
import type { OverallOccupancyMap, WeeklyOccupancyMap } from '~/types'

const poolStore = usePoolStore()
const isMobile = computed(() => {
  return !useMediaQuery('(min-width: 1024px)').value
})
interface Props {
  overallOccupancyMap: OverallOccupancyMap
  weeklyOccupancyMap: WeeklyOccupancyMap
}
defineProps<Props>()
</script>
