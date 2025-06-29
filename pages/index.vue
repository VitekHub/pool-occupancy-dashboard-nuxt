<template>
  <div>
    <DashboardHeader />
    <div class="mb-8">
      <DashboardHeatmapSection
        :overall-occupancy-map="poolStore.overallOccupancyMap"
        :weekly-occupancy-map="poolStore.weeklyOccupancyMap"
      />
    </div>
    <DashboardStats />
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()

// Page meta
definePageMeta({
  title: 'Dashboard - Pool Occupancy',
})

// SEO
useSeoMeta({
  title: 'Pool Occupancy Dashboard',
  description: 'Monitor real-time pool occupancy and analytics',
})
</script>
