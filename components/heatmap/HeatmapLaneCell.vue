<template>
  <div
    v-if="laneData && poolStore.showOpenLanes"
    :class="[
      'relative mt-2 h-8 cursor-pointer transition-opacity duration-200 hover:opacity-80 flex items-center justify-center overflow-hidden',
      isDesktop ? 'w-12 rounded p-0.5' : 'flex-1 min-w-2',
      isDesktop
        ? isCurrentHour && poolStore.isPoolOpen
          ? 'border-2 border-gray-300 dark:border-red-100'
          : 'border border-gray-200 dark:border-gray-600'
        : '',
    ]"
    :title="laneData.title || ''"
  >
    <!-- Closed lanes fill (bottom portion) - red dotted pattern -->
    <div
      :class="[
        'absolute bottom-0 w-full lane-closed-fill',
        isDesktop ? '' : 'rounded-b-lg',
      ]"
      :style="{
        height: `${laneData.closedRatio * 100}%`,
      }"
    ></div>
    <!-- Open lanes fill (top portion) - blue solid -->
    <div
      :class="[
        'absolute w-full bg-blue-400 dark:bg-blue-500',
        isDesktop
          ? ''
          : laneData.closedRatio == 0
            ? 'rounded-lg'
            : 'rounded-t-lg',
      ]"
      :style="{
        height: `${laneData.openRatio * 100}%`,
        top: 0,
      }"
    ></div>
    <span
      v-if="isDesktop"
      class="text-[12px] font-semibold text-center text-gray-800 dark:text-gray-200 z-10 relative leading-none drop-shadow-sm"
    >
      {{ laneData.displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { LaneCellData } from '~/types'

const { isDesktop } = useDesktopView()

interface Props {
  laneData?: LaneCellData | null
  isCurrentHour?: boolean
}

withDefaults(defineProps<Props>(), {
  laneData: null,
  isCurrentHour: false,
})

const poolStore = usePoolStore()
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
