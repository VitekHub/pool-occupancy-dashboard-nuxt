<template>
  <div v-if="hasLaneData" class="flex items-center gap-2 flex-shrink-0">
    <label class="flex items-center space-x-2 cursor-pointer select-none">
      <UToggle
        v-model="showOpenLanes"
        color="blue"
        size="sm"
        class="shrink-0"
      />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('heatmap.weekly.showOpenLanes') }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { VIEW_MODES } from '~/types'

const poolStore = usePoolStore()

const hasLaneData = computed(
  () =>
    poolStore.viewMode === VIEW_MODES.WEEKLY &&
    !!poolStore.selectedPool?.totalLanes
)

const showOpenLanes = computed({
  get: () => poolStore.showOpenLanes,
  set: (value: boolean) => poolStore.setShowOpenLanes(value),
})
</script>
