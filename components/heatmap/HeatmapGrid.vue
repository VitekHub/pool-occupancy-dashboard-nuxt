<template>
  <div class="space-y-1">
    <div
      v-for="(day, dayIndex) in sortedDays"
      :key="day"
      class="flex items-center"
    >
      <!-- Day label and date -->
      <div
        :class="[
          'flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 flex flex-col items-end',
          isDesktop ? 'w-20 text-right pr-3' : 'w-8 text-xs pr-1',
        ]"
      >
        <span>{{ getDayLabel(day) }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-400">
          {{ getDateForDay(dayIndex) }}
        </span>
      </div>

      <!-- Hour cells -->
      <div class="flex flex-1 gap-1 mb-2">
        <HeatmapCell
          v-for="hour in hours"
          :key="`${day}-${hour}`"
          :cell-data="getCellData(day, hour)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, addDays, parseISO, isValid } from 'date-fns'
import type { BaseCellData } from '~/types'

const { isDesktop } = useDesktopView()

interface Props {
  sortedDays: string[]
  hours: number[]
  getCellData: (day: string, hour: number) => BaseCellData | undefined
  selectedWeekId: string | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const getTranslatedDayName = (englishDayName: string): string => {
  return t(`common.days.${englishDayName.toLowerCase()}`) || englishDayName
}

const getDayLabel = (day: string): string => {
  const translatedDay = getTranslatedDayName(day)

  if (!isDesktop.value) {
    return locale.value === 'cs'
      ? translatedDay.substring(0, 2)
      : translatedDay.substring(0, 3)
  }
  return translatedDay
}

/**
 * Returns formatted date (e.g. 1.7.) for the given day index,
 * where selectedWeekId is the date for Monday (ISO format).
 */
const getDateForDay = (dayIndex: number) => {
  if (!props.selectedWeekId) {
    return isDesktop.value ? t('heatmap.average') : t('heatmap.avg')
  }
  const monday = parseISO(props.selectedWeekId)
  if (!isValid(monday)) return ''
  const date = addDays(monday, dayIndex)
  return format(date, 'd.M.')
}
</script>
