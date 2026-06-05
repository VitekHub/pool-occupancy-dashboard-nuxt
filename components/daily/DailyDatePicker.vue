<template>
  <div class="flex items-center gap-0">
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
    <div class="mx-1">
      <VueDatePicker
        :model-value="pickerDate"
        :max-date="maxDate"
        :week-start="1"
        :locale="datePickerLocale"
        :dark="colorMode.value === 'dark'"
        auto-apply
        teleport
        @update:model-value="onPickerChange"
      >
        <template #trigger>
          <div
            class="flex items-center gap-2 px-3 py-[7px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer select-none transition-colors"
          >
            <span class="whitespace-nowrap">{{ formattedDate }}</span>
            <UIcon
              name="i-heroicons-calendar-days"
              class="w-4 h-4 text-gray-400 flex-shrink-0"
            />
          </div>
        </template>
      </VueDatePicker>
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
    <UButton
      color="gray"
      variant="outline"
      size="xs"
      :disabled="isToday"
      class="ml-1.5 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700 disabled:opacity-40"
      @click="goToToday"
    >
      {{ $t('common.today') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { addDays, format } from 'date-fns'
import { cs, enGB } from 'date-fns/locale'
import { nowInPrague } from '~/utils/dateUtils'

const poolStore = usePoolStore()
const { locale } = useI18n()
const colorMode = useColorMode()

const todayDate = computed(() => format(nowInPrague(), 'yyyy-MM-dd'))
const maxDate = computed(
  () => poolStore.lastAvailableDailyDate ?? todayDate.value
)

const pickerDate = computed(() =>
  poolStore.selectedDailyDate
    ? new Date(poolStore.selectedDailyDate + 'T12:00:00')
    : null
)

const localeStr = computed(() => (locale.value === 'cs' ? 'cs-CZ' : 'en-GB'))
const datePickerLocale = computed(() => (locale.value === 'cs' ? cs : enGB))

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

const isToday = computed(() => poolStore.selectedDailyDate === todayDate.value)

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

const goToToday = () => {
  poolStore.setSelectedDailyDate(todayDate.value)
}

const onPickerChange = (date: Date | null) => {
  if (date) {
    poolStore.setSelectedDailyDate(format(date, 'yyyy-MM-dd'))
  }
}
</script>
