<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {{ $t('heatmap.daily.title') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ formattedDate }} ({{ localizedDayName }})
        </p>
      </div>
    </div>
    <h2 class="mt-2 h2-title">
      <div
        class="relative flex items-center justify-center"
        :class="!isDesktop && 'flex-col gap-2'"
      >
        <DailyTooltipToggle
          v-if="isDesktop"
          :class="isDesktop ? 'absolute left-0 mt-1' : ''"
        />
        <PoolNavigator />
        <ShowOpenLanesToggle
          v-if="isDesktop"
          :class="isDesktop ? 'absolute right-0 mt-1' : ''"
        />
        <div v-else class="flex items-center justify-center gap-6">
          <DailyTooltipToggle />
          <ShowOpenLanesToggle />
        </div>
      </div>
    </h2>
    <DailyChartCanvas />
    <DailyLaneStrip />
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const { isDesktop } = useDesktopView()
const poolStore = usePoolStore()
const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-US'))

const formattedDate = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  return new Intl.DateTimeFormat(localeStr.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
})

const localizedDayName = computed(() => {
  const dayName = poolStore.selectedDailyDayName
  if (!dayName) return ''
  return t(`common.days.${dayName.toLowerCase()}`)
})
</script>
