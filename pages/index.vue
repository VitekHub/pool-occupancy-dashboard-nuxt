<template>
  <div class="max-w-fit mx-auto mb-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <CardQuickActions />
      <CardPoolStatus />
      <CardCurrentOccupancy />
    </div>
  </div>
  <div :class="['mx-auto mb-8', isForceMobileView ? 'w-[500px]' : 'max-w-fit']">
    <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div :class="['grid gap-4', isDesktop ? 'grid-cols-5' : 'grid-cols-1']">
        <HeatmapSelectionViewMode class="col-span-2" />
        <HeatmapSelectionMetric class="col-span-1" />
        <HeatmapSelectionWeek class="col-span-2" />
      </div>
    </div>
    <Heatmap id="statistics-section" />
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
const { isDesktopMediaQuery } = useDesktopView()
const isForceMobileView = computed(
  () => isDesktopMediaQuery.value && poolStore.forceMobileView
)
const { isDesktop } = useDesktopView()

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
