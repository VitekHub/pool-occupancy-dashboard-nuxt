<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Dashboard Overview
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Welcome to the Pool Occupancy Dashboard. Monitor real-time pool usage
        and analytics.
      </p>
    </div>

    <!-- Overall Occupancy Heatmap -->
    <div class="mb-8">
      <Heatmap
        :overall-occupancy-map="poolStore.overallOccupancyMap"
        :heatmap-high-threshold="60"
        tooltip-translation-key="heatmap:overallTooltip"
      />
    </div>

    <!-- Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Sample Cards -->
      <UCard class="col-span-1">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Current Occupancy
            </h3>
            <UIcon name="i-heroicons-users" class="h-5 w-5 text-blue-600" />
          </div>
        </template>

        <div class="text-center py-4">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            0
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            People currently in pool
          </p>
        </div>
      </UCard>

      <UCard class="col-span-1">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Pool Status
            </h3>
            <UIcon
              name="i-heroicons-check-circle"
              class="h-5 w-5 text-green-600"
            />
          </div>
        </template>

        <div class="text-center py-4">
          <div
            class="text-xl font-semibold text-green-600 dark:text-green-400 mb-2"
          >
            Available
          </div>
          <p class="text-gray-600 dark:text-gray-400">Pool is open and ready</p>
        </div>
      </UCard>

      <UCard class="col-span-1 lg:col-span-2 xl:col-span-1">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
        </template>

        <div class="space-y-3">
          <UButton block variant="soft" color="blue"> View Analytics </UButton>
          <UButton block variant="soft" color="green"> Export Data </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Get pool store
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
