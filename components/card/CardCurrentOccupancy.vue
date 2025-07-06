<template>
  <UCard class="col-span-1">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mr-6">
          {{ $t('card.currentOccupancy') }}
        </h3>
        <UIcon name="i-heroicons-users" class="h-5 w-5 text-blue-600" />
      </div>
    </template>

    <SpinnerOverlay>
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
    </SpinnerOverlay>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const poolStore = usePoolStore()
const currentOccupancy = computed(() => poolStore.currentOccupancy)
const shouldShowOccupancy = computed(() => {
  return poolStore.isPoolOpen && currentOccupancy.value !== null
})
const capacityUsageText = computed(() =>
  shouldShowOccupancy.value
    ? `${currentOccupancy.value!.currentUtilizationRate}${t('card.capacityUsage')} (${t('card.capacityTime')} ${currentOccupancy.value!.time})`
    : ''
)

const usualCapacityUsageText = computed(() =>
  shouldShowOccupancy.value
    ? `${currentOccupancy.value!.averageUtilizationRate}${t('card.usualCapacityUsage')}`
    : ''
)
const getOccupancyStatusText = (): string => {
  if (!poolStore.isPoolOpen) {
    return t('card.poolClosed')
  } else if (currentOccupancy.value !== null) {
    return ''
  } else {
    return t('card.noDataToday')
  }
}
</script>
