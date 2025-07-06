<template>
  <div>
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ $t('heatmap.selection.viewMode') }}
    </label>
    <div class="flex flex-wrap gap-1 p-1">
      <UButton
        v-for="option in viewModeOptions"
        :key="option.value"
        :variant="viewMode === option.value ? 'solid' : 'outline'"
        color="sky"
        size="sm"
        @click="updateViewMode(option.value)"
        class="flex-1 justify-center"
      >
        {{ option.label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
import type { MetricType, ViewMode } from '~/types'
import { METRIC_TYPES, VIEW_MODES } from '~/types'

const poolStore = usePoolStore()

const viewMode = computed({
  get: () => poolStore.viewMode,
  set: (value: ViewMode) => poolStore.setViewMode(value),
})
const metricType = computed({
  get: () => poolStore.metricType,
  set: (value: MetricType) => poolStore.setMetricType(value),
})

const viewModeOptions = computed(() => {
  return [VIEW_MODES.OVERALL, VIEW_MODES.WEEKLY].map((mode) => ({
    value: mode,
    label: t(`heatmap.selection.${mode}`),
  }))
})
const updateViewMode = (newViewMode: ViewMode) => {
  metricType.value =
    newViewMode === VIEW_MODES.OVERALL
      ? METRIC_TYPES.AVERAGE
      : METRIC_TYPES.PERCENTAGE
  viewMode.value = newViewMode
}
</script>
