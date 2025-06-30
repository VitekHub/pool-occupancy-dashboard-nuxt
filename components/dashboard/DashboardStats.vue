<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    <!-- Quick Actions Card -->
    <UCard class="col-span-1 lg:col-span-2 xl:col-span-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('dashboard.stats.quickActions') }}
          </h3>
        </div>
      </template>

      <div class="space-y-3">
        <UButton block variant="soft" color="blue" @click="scrollToStatistics">
          {{ $t('dashboard.stats.viewStatistics') }}
        </UButton>
        <UButton block variant="soft" color="green" @click="exportData">
          {{ $t('dashboard.stats.exportData') }}
        </UButton>

        <!-- Mobile View Toggle (Desktop Only) -->
        <button
          v-if="isDesktop"
          @click="forceMobileView = !forceMobileView"
          class="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
        >
          <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
            {{ $t('dashboard.stats.mobileView') }}
          </span>
          <UToggle
            v-model="forceMobileView"
            color="blue"
            size="sm"
            class="shrink-0 pointer-events-none"
          />
        </button>
      </div>
    </UCard>

    <!-- Current Occupancy Card -->
    <UCard class="col-span-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mr-6">
            {{ $t('dashboard.stats.currentOccupancy') }}
          </h3>
          <UIcon name="i-heroicons-users" class="h-5 w-5 text-blue-600" />
        </div>
      </template>

      <div class="text-center py-2">
        <div
          :class="[
            'text-3xl font-bold mb-2',
            shouldShowOccupancy
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          {{
            shouldShowOccupancy
              ? `${currentOccupancy}/${poolStore.currentMaxCapacity}`
              : $t('common.na')
          }}
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          {{ getOccupancyStatusText() }}
        </p>
        <div
          v-if="shouldShowOccupancy && poolStore.currentMaxCapacity > 0"
          class="mt-2"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{
              Math.round(
                (currentOccupancy / poolStore.currentMaxCapacity) * 100
              )
            }}{{ $t('dashboard.stats.capacityUsage') }}
          </div>
          <div class="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min((currentOccupancy / poolStore.currentMaxCapacity) * 100, 100)}%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Pool Status Card -->
    <UCard class="col-span-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('dashboard.stats.poolStatus') }}
          </h3>
          <UIcon
            :name="
              poolStore.isPoolOpen
                ? 'i-heroicons-check-circle'
                : 'i-heroicons-x-circle'
            "
            :class="[
              'h-5 w-5',
              poolStore.isPoolOpen ? 'text-green-600' : 'text-red-600',
            ]"
          />
        </div>
      </template>

      <div class="text-center py-4">
        <div
          :class="[
            'text-xl font-semibold mb-2',
            poolStore.isPoolOpen
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          ]"
        >
          {{ poolStore.isPoolOpen ? $t('common.open') : $t('common.closed') }}
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          {{ getPoolStatusText() }}
        </p>
        <div
          v-if="poolStore.isPoolOpen && poolStore.todayOpeningHours"
          class="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {{ $t('common.today') }}:
          {{ formatOpeningHours(poolStore.todayOpeningHours) }}
        </div>

        <!-- Pool Website Link -->
        <div v-if="poolWebsiteUrl" class="mt-3">
          <UButton
            :to="poolWebsiteUrl"
            external
            target="_blank"
            variant="outline"
            color="blue"
            size="sm"
            icon="i-heroicons-link"
          >
            {{ $t('dashboard.stats.visitWebsite') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const poolStore = usePoolStore()

// Scroll to statistics section
const scrollToStatistics = () => {
  const statisticsSection = document.getElementById('statistics-section')
  if (statisticsSection) {
    statisticsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Export data functionality
const exportData = () => {
  const csvUrl = poolStore.csvUrl
  if (csvUrl) {
    window.open(csvUrl, '_blank')
  }
}

// Check if we're on desktop
const isDesktop = useMediaQuery('(min-width: 1024px)')

// Computed property for mobile view toggle
const forceMobileView = computed({
  get: () => poolStore.forceMobileView,
  set: (value: boolean) => poolStore.setForceMobileView(value),
})

// Get current occupancy from store
const currentOccupancy = computed(() => poolStore.currentOccupancy)

// Computed property to determine if we should show occupancy data
const shouldShowOccupancy = computed(() => {
  return poolStore.isPoolOpen && currentOccupancy.value !== null
})

// Format opening hours for display
const formatOpeningHours = (hours: string): string => {
  const [open, close] = hours.split('-')
  return `${open}:00 - ${close}:00`
}

// Get pool status text
const getPoolStatusText = (): string => {
  if (poolStore.isPoolOpen) {
    return t('dashboard.stats.poolOpenReady')
  } else {
    return t('dashboard.stats.poolClosed')
  }
}

// Get occupancy status text
const getOccupancyStatusText = (): string => {
  if (!poolStore.isPoolOpen) {
    return t('dashboard.stats.poolClosed')
  } else if (currentOccupancy.value !== null) {
    return t('dashboard.stats.peopleInPool')
  } else {
    return t('dashboard.stats.noDataToday')
  }
}

// Get pool website URL
const poolWebsiteUrl = computed((): string | null => {
  if (!poolStore.selectedPool) return null

  if (
    poolStore.selectedPoolType === 'inside' &&
    poolStore.selectedPool.insidePool
  ) {
    return poolStore.selectedPool.insidePool.url
  } else if (
    poolStore.selectedPoolType === 'outside' &&
    poolStore.selectedPool.outsidePool
  ) {
    return poolStore.selectedPool.outsidePool.url
  }

  return null
})
</script>
