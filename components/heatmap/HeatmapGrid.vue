<template>
  <div class="space-y-1">
    <div v-for="day in sortedDays" :key="day" class="flex items-center">
      <!-- Day label -->
      <div
        :class="[
          'flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300',
          isDesktop ? 'w-20 text-right pr-3' : 'w-8 text-xs',
        ]"
      >
        {{ getDayLabel(day) }}
      </div>

      <!-- Hour cells -->
      <div :class="['flex flex-1', isDesktop ? 'gap-1' : 'gap-1']">
        <HeatmapCell
          v-for="hour in hours"
          :key="`${day}-${hour}`"
          :cell-data="getCellData(day, hour)"
          :is-desktop="isDesktop"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseCellData } from '~/types'

interface Props {
  sortedDays: string[]
  hours: number[]
  isDesktop: boolean
  getCellData: (day: string, hour: number) => BaseCellData | undefined
  getDayLabel: (day: string) => string
}

defineProps<Props>()
</script>
