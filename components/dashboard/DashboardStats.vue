<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    <!-- Quick Actions Card -->
    <UCard class="col-span-1 lg:col-span-2 xl:col-span-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('dashboard.stats.quickActions') }}
          </h3>
          <UIcon name="i-heroicons-bolt" class="h-5 w-5 text-yellow-500" />
        </div>
      </template>

      <div class="space-y-3">
        <UButton
          block
          variant="soft"
          class="h-10"
          color="blue"
          @click="scrollToStatistics"
        >
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

      <div class="text-center">
        <div
          :class="[
            'text-3xl font-bold mb-2',
            shouldShowOccupancy
              ? 'text-blue-600 dark:text-blue-600'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          {{
            shouldShowOccupancy
              ? `${currentOccupancy?.occupancy} / ${poolStore.currentMaxCapacity}`
              : $t('common.na')
          }}
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          {{ getOccupancyStatusText() }}
        </p>
        <div
          v-if="shouldShowOccupancy && poolStore.currentMaxCapacity > 0"
          class="mt-4"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ capacityUsageText }}
          </div>
          <div class="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-600 dark:bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(currentOccupancy!.currentUtilizationRate, 100)}%`,
              }"
            ></div>
          </div>
          <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {{ usualCapacityUsageText }}
          </div>
          <div class="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-400 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(currentOccupancy!.averageUtilizationRate, 100)}%`,
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
            name="i-heroicons-sun"
            :class="[
              'h-5 w-5',
              poolStore.isPoolOpen ? 'text-green-600' : 'text-red-600',
            ]"
          />
        </div>
      </template>

      <div class="text-center">
        <div
          :class="[
            'text-xl font-semibold mb-2',
            poolStore.isPoolOpen
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400',
          ]"
        >
          <div class="mb-2">
            {{ poolStore.selectedPool?.name }}
          </div>
          <div>
            {{ poolStore.isPoolOpen ? $t('common.open') : $t('common.closed') }}
          </div>
        </div>
        <div
          v-if="!poolStore.isPoolOpen"
          class="text-gray-600 dark:text-gray-400"
        >
          {{ t('dashboard.stats.poolClosed') }}
        </div>
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

const scrollToStatistics = () => {
  const statisticsSection = document.getElementById('statistics-section')
  if (statisticsSection) {
    statisticsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const exportData = () => {
  const csvUrl = poolStore.csvUrl
  if (csvUrl) {
    window.open(csvUrl, '_blank')
  }
}

const isDesktop = useMediaQuery('(min-width: 1024px)')
const forceMobileView = computed({
  get: () => poolStore.forceMobileView,
  set: (value: boolean) => poolStore.setForceMobileView(value),
})
const currentOccupancy = computed(() => poolStore.currentOccupancy)
const shouldShowOccupancy = computed(() => {
  return poolStore.isPoolOpen && currentOccupancy.value !== null
})
const formatOpeningHours = (hours: string): string => {
  const [open, close] = hours.split('-')
  return `${open}:00 - ${close}:00`
}
const getOccupancyStatusText = (): string => {
  if (!poolStore.isPoolOpen) {
    return t('dashboard.stats.poolClosed')
  } else if (currentOccupancy.value !== null) {
    return ''
  } else {
    return t('dashboard.stats.noDataToday')
  }
}
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
const capacityUsageText = computed(() =>
  shouldShowOccupancy.value
    ? `${currentOccupancy.value!.currentUtilizationRate}${t('dashboard.stats.capacityUsage')} (${t('dashboard.stats.capacityTime')} ${currentOccupancy.value!.time})`
    : ''
)

const usualCapacityUsageText = computed(() =>
  shouldShowOccupancy.value
    ? `${currentOccupancy.value!.averageUtilizationRate}${t('dashboard.stats.usualCapacityUsage')}`
    : ''
)
</script>
