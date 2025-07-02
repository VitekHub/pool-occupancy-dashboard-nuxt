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

// Use useFetch to handle CSV data fetching with auto-refresh
const {
  data: csvData,
  pending,
  error: fetchError,
  refresh,
} = useFetch<string>(() => poolStore.csvUrl, {
  immediate: false, // Don't fetch immediately on mount
  server: false, // Client-side only
})

// Process new csv data
watch(csvData, (newData) => {
  if (newData) {
    poolStore.processOccupancyCsvData(newData)
  }
})
watch(pending, (isPending) => {
  poolStore.isLoading = isPending
})
watch(fetchError, (error) => {
  poolStore.error = error?.message || null
})

// Refresh data when pool selection changes
watch(
  () => poolStore.csvUrl,
  (newUrl) => {
    if (newUrl) {
      refresh()
    }
  }
)

// Set up auto-refresh interval
const refreshIntervalId = ref<NodeJS.Timeout>()

onMounted(() => {
  // Initial data fetch
  refresh()

  refreshIntervalId.value = setInterval(() => {
    refresh()
  }, 120_000)
})

onUnmounted(() => {
  if (refreshIntervalId.value) {
    clearInterval(refreshIntervalId.value)
  }
})

definePageMeta({
  title: 'Dashboard - Pool Occupancy',
})
useSeoMeta({
  title: 'Pool Occupancy Dashboard',
  description: 'Monitor real-time pool occupancy and analytics',
})
</script>
