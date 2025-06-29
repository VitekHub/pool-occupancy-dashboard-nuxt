<template>
  <div
    :class="[
      'relative dark:border-gray-600 cursor-pointer transition-opacity duration-200 hover:opacity-80 flex items-center justify-center',
      isDesktop
        ? 'border border-gray-200 min-w-12 h-10 rounded p-1'
        : 'flex-1 min-w-2 h-16',
    ]"
    :title="cellData?.title || ''"
  >
    <!-- Fill based on colorFillRatio -->
    <div
      :class="[
        'absolute bottom-0 w-full',
        cellData?.color || 'bg-gray-100 dark:bg-gray-600',
        isDesktop ? 'rounded-b' : 'rounded-lg',
      ]"
      :style="{
        height: `${cellData?.colorFillRatio * 100 || 0}%`,
      }"
    ></div>
    <span
      v-if="isDesktop && cellData?.displayText"
      class="text-xs font-medium text-center text-gray-800 dark:text-gray-200 z-10 relative"
    >
      {{ cellData.displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { BaseCellData } from '~/types'

interface Props {
  cellData?: BaseCellData
  isDesktop: boolean
}

defineProps<Props>()
</script>
