<template>
  <div
    :class="[
      'relative dark:border-gray-600 cursor-pointer transition-opacity duration-200 hover:opacity-80 flex items-center justify-center',
      isDesktop
        ? 'border border-gray-200 w-12 h-12 rounded p-1'
        : 'flex-1 min-w-2 h-16',
      cellData?.isCurrentHour ? 'animate-pulse' : '',
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
        height: HeatmapColorProcessor.getBarHeight(
          colorFillRatio,
          uniformHeatmapBarHeight && isDesktop
        ),
      }"
    ></div>
    <span
      v-if="isDesktop && cellData?.displayText"
      class="text-xs font-medium text-center text-gray-800 dark:text-gray-200 z-10 relative leading-tight break-words overflow-hidden px-1"
    >
      {{ cellData.displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { BaseCellData } from '~/types'
import HeatmapColorProcessor from '~/utils/heatmapColorProcessor'

const { isDesktop } = useDesktopView()

interface Props {
  cellData?: BaseCellData
}

const props = defineProps<Props>()
const poolStore = usePoolStore()
const colorFillRatio = computed(() => props.cellData?.colorFillRatio || 0)
const uniformHeatmapBarHeight = computed(
  () => poolStore.uniformHeatmapBarHeight
)
</script>
