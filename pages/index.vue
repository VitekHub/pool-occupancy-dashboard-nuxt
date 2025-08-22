<template>
  <UiSpinner v-if="!poolStore.selectedPool" />
  <div v-else class="max-w-fit mx-auto mb-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <CardQuickActions />
      <CardPoolStatus />
      <CardCurrentOccupancy />
    </div>
  </div>
  <div
    v-if="poolStore.selectedPool"
    :class="['mx-auto mb-8', isForceMobileView ? 'w-[500px]' : 'max-w-fit']"
  >
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

// Fetch data when pool selection changes
watch(
  () => poolStore.csvUrl,
  (newUrl) => {
    if (newUrl) {
      poolStore.fetchAndProcessCsvData()
    }
  }
)

// Set up auto-refresh interval
const refreshIntervalId = ref<NodeJS.Timeout>()

onMounted(() => {
  refreshIntervalId.value = setInterval(() => {
    poolStore.fetchAndProcessCsvData()
    // reload pools config as mainly 'todayClosed' might changed
    poolStore.loadPoolsConfig()
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
  description: 'Monitor real-time pool occupancy and statistics',
})
</script>
