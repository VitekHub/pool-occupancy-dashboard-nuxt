<template>
  <div>
    <div class="max-w-fit mx-auto mb-6">
      <DashboardStats />
    </div>
    <div class="mb-8">
      <DashboardHeatmapSection
        id="statistics-section"
        :overall-occupancy-map="poolStore.overallOccupancyMap"
        :weekly-occupancy-map="poolStore.weeklyOccupancyMap"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
definePageMeta({
  title: 'Dashboard - Pool Occupancy',
})
useSeoMeta({
  title: 'Pool Occupancy Dashboard',
  description: 'Monitor real-time pool occupancy and analytics',
})
</script>
