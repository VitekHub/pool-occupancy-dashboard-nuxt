<template>
  <div
    v-if="viewMode === VIEW_MODES.OVERALL || isDesktop"
    class="flex items-end"
  >
    <URadioGroup
      v-model="metricType"
      :options="metricItems"
      :uiRadio="{
        inner: 'ms-1',
        wrapper: 'mb-0.5',
        base: 'cursor-pointer',
        label: 'cursor-pointer',
      }"
      class="metric-types"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
import type { MetricType, ViewMode } from '~/types'
import { METRIC_TYPES, VIEW_MODES } from '~/types'

const poolStore = usePoolStore()
const { isDesktop } = useDesktopView()

const viewMode = computed({
  get: () => poolStore.viewMode,
  set: (value: ViewMode) => poolStore.setViewMode(value),
})
const metricType = computed({
  get: () => poolStore.metricType,
  set: (value: MetricType) => poolStore.setMetricType(value),
})

const metricItems = computed(() => {
  const overalViewMetrics = [METRIC_TYPES.AVERAGE, METRIC_TYPES.MEDIAN]
  const weeklyViewMetrics = [
    METRIC_TYPES.PERCENTAGE,
    METRIC_TYPES.MIN_MAX,
    METRIC_TYPES.AVERAGE,
  ]
  const metrics =
    viewMode.value === VIEW_MODES.OVERALL
      ? overalViewMetrics
      : weeklyViewMetrics
  return metrics.map((metric) => ({
    value: metric,
    label: t(`heatmap.selection.${metric}`),
  }))
})
</script>
