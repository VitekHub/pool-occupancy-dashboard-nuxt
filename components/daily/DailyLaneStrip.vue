<template>
  <div v-if="poolStore.showOpenLanes && hasLaneData" class="mt-4 pl-10">
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
      {{ $t('heatmap.daily.lanesStripLabel', { dayDate: dayDateLabel }) }}
    </p>
    <div :class="['flex gap-1 items-end pb-1', isDesktop ? '' : 'w-full']">
      <div
        v-for="(item, index) in stripItems"
        :key="item.hour"
        :class="[
          'flex flex-col items-center gap-1',
          isDesktop ? 'flex-shrink-0' : 'flex-1 min-w-[8px]',
        ]"
      >
        <!-- Lane bar cell -->
        <div
          v-if="item.laneData"
          :class="[
            'relative overflow-hidden cursor-default',
            isDesktop
              ? 'w-10 h-10 rounded border border-gray-200 dark:border-gray-600'
              : 'w-full h-8',
          ]"
          :title="
            isDesktop
              ? `${item.laneData.openLanes}/${item.laneData.totalLanes} ${$t('heatmap.daily.lanesAt', { hour: item.hour })}`
              : ''
          "
        >
          <!-- Closed lanes fill (bottom) -->
          <div
            :class="[
              'absolute bottom-0 w-full lane-closed-fill',
              !isDesktop ? 'rounded-b-lg' : '',
            ]"
            :style="{ height: `${item.laneData.closedRatio * 100}%` }"
          />
          <!-- Open lanes fill (top) -->
          <div
            :class="[
              'absolute top-0 w-full bg-blue-400 dark:bg-blue-500',
              !isDesktop
                ? item.laneData.closedRatio === 0
                  ? 'rounded-lg'
                  : 'rounded-t-lg'
                : '',
            ]"
            :style="{ height: `${item.laneData.openRatio * 100}%` }"
          />
          <span
            v-if="isDesktop"
            class="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-gray-800 dark:text-gray-200 z-10 leading-none drop-shadow-sm"
          >
            {{ item.laneData.displayText }}
          </span>
        </div>
        <!-- Empty placeholder -->
        <div
          v-else
          :class="[
            'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
            isDesktop ? 'w-10 h-10 rounded border' : 'w-full h-8',
          ]"
        />
        <!-- Hour label (desktop: every other; mobile: hidden) -->
        <span
          v-if="isDesktop || index % 2 === 0"
          class="text-[10px] text-gray-400 dark:text-gray-500"
        >
          {{ `${item.hour}:00` }}
        </span>
        <span v-else-if="!isDesktop" class="h-[15px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDailyChartData } from '~/composables/useDailyChartData'

const { t, locale } = useI18n()
const { isDesktop } = useDesktopView()
const poolStore = usePoolStore()

const { hours, currentDayLaneData, hasCurrentDayLaneData } = useDailyChartData()

const hasLaneData = hasCurrentDayLaneData

const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-US'))

const dayDateLabel = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  const shortDate = new Intl.DateTimeFormat(localeStr.value, {
    month: 'long',
    day: 'numeric',
  }).format(date)
  const dayName = poolStore.selectedDailyDayName
  const localizedDay = dayName ? t(`common.days.${dayName.toLowerCase()}`) : ''
  return localizedDay ? `${localizedDay} (${shortDate})` : shortDate
})

const stripItems = computed(() =>
  hours.map((hour, index) => ({
    hour,
    laneData: currentDayLaneData.value[index] ?? null,
  }))
)
</script>

<style scoped>
.lane-closed-fill {
  background-color: #fca5a5;
  background-image: radial-gradient(circle, #e65e5e 1.5px, transparent 1.5px);
  background-size: 6px 6px;
}

.dark .lane-closed-fill {
  background-color: #c06060;
  background-image: radial-gradient(circle, #991b1b 1.5px, transparent 1.5px);
  background-size: 6px 6px;
}
</style>
