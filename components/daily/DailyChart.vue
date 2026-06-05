<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {{ $t('heatmap.daily.title') }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ formattedDate }} ({{ localizedDayName }})
      </p>
    </div>
    <DailyChartCanvas />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const poolStore = usePoolStore()

const formattedDate = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const localizedDayName = computed(() => {
  const dayName = poolStore.selectedDailyDayName
  if (!dayName) return ''
  return t(`common.days.${dayName.toLowerCase()}`)
})
</script>
