<template>
  <div class="flex items-center gap-0.5">
    <UButton
      icon="i-heroicons-chevron-double-left"
      color="gray"
      variant="ghost"
      size="xs"
      :title="$t('heatmap.selection.weekBack')"
      @click="shiftDate(-7)"
    />
    <UButton
      icon="i-heroicons-chevron-left"
      color="gray"
      variant="ghost"
      size="xs"
      :title="$t('heatmap.selection.dayBack')"
      @click="shiftDate(-1)"
    />
    <div class="relative mx-1">
      <div
        class="flex items-center gap-2 px-3 py-[7px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer select-none transition-colors pointer-events-none"
      >
        <span class="whitespace-nowrap">{{ formattedDate }}</span>
        <UIcon
          name="i-heroicons-calendar-days"
          class="w-4 h-4 text-gray-400 flex-shrink-0"
        />
      </div>
      <input
        ref="inputRef"
        type="date"
        :value="poolStore.selectedDailyDate ?? ''"
        :max="maxDate"
        class="date-picker-input absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabindex="-1"
        @change="onDateChange"
      />
    </div>
    <UButton
      icon="i-heroicons-chevron-right"
      color="gray"
      variant="ghost"
      size="xs"
      :disabled="isAtMax"
      :title="$t('heatmap.selection.dayForward')"
      @click="shiftDate(1)"
    />
    <UButton
      icon="i-heroicons-chevron-double-right"
      color="gray"
      variant="ghost"
      size="xs"
      :disabled="isAtMaxWeek"
      :title="$t('heatmap.selection.weekForward')"
      @click="shiftDate(7)"
    />
  </div>
</template>

<script setup lang="ts">
import { addDays, format } from 'date-fns'
import { nowInPrague } from '~/utils/dateUtils'

const poolStore = usePoolStore()
const { locale } = useI18n()

const inputRef = ref<HTMLInputElement | null>(null)
const maxDate = computed(() => format(nowInPrague(), 'yyyy-MM-dd'))

const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-US'))

const formattedDate = computed(() => {
  if (!poolStore.selectedDailyDate) return ''
  const date = new Date(poolStore.selectedDailyDate + 'T12:00:00')
  return new Intl.DateTimeFormat(localeStr.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
})

const isAtMax = computed(() => {
  if (!poolStore.selectedDailyDate) return true
  return poolStore.selectedDailyDate >= maxDate.value
})

const isAtMaxWeek = computed(() => {
  if (!poolStore.selectedDailyDate) return true
  const shifted = addDays(
    new Date(poolStore.selectedDailyDate + 'T12:00:00'),
    7
  )
  return format(shifted, 'yyyy-MM-dd') > maxDate.value
})

const shiftDate = (days: number) => {
  if (!poolStore.selectedDailyDate) return
  const shifted = addDays(
    new Date(poolStore.selectedDailyDate + 'T12:00:00'),
    days
  )
  const newDate = format(shifted, 'yyyy-MM-dd')
  if (newDate > maxDate.value) return
  poolStore.setSelectedDailyDate(newDate)
}

const onDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value) {
    poolStore.setSelectedDailyDate(target.value)
  }
}
</script>

<style scoped>
.date-picker-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  background: transparent;
}
</style>
