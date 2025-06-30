<template>
  <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <!-- Legend Items, Toggle and Slider on one line -->
    <div class="mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {{ $t('heatmap.legend.title') }}
      </h3>
      <div
        :class="[
          'flex flex-col gap-6',
          !poolStore.forceMobileView && 'lg:flex-row lg:items-center',
        ]"
      >
        <!-- Legend Items -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="legend in legendItems"
            :key="legend.label"
            class="flex items-center"
          >
            <div :class="['w-4 h-4 rounded mr-2', legend.color]"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ legend.label }}
            </span>
          </div>
        </div>

        <!-- Uniform Bar Height Toggle -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <UToggle
            v-model="uniformBarHeight"
            color="blue"
            size="sm"
            class="shrink-0"
          />
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('heatmap.legend.uniformBarHeight') }}
          </label>
        </div>

        <!-- High Threshold Slider -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="flex-shrink-0">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('heatmap.legend.threshold') }}
            </label>
          </div>
          <div class="flex items-center gap-2 flex-1">
            <span
              class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
            >
              10%
            </span>
            <URange
              v-model="thresholdValue"
              :min="10"
              :max="90"
              :step="1"
              color="blue"
              class="flex-1"
            />
            <span
              class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
            >
              90%
            </span>
          </div>
          <div class="flex-shrink-0">
            <span
              class="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-12 text-center inline-block"
            >
              {{ thresholdValue }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Explanations -->
    <div class="space-y-3">
      <div
        v-for="explanation in explanations"
        :key="explanation.icon"
        class="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p
          class="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200"
        >
          <span class="flex-shrink-0">{{ explanation.icon }}</span>
          <span>{{ explanation.text }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const poolStore = usePoolStore()

interface LegendItem {
  color: string
  label: string
}

interface Props {
  legendItems: LegendItem[]
}

defineProps<Props>()

const thresholdValue = computed({
  get: () => poolStore.heatmapHighThreshold,
  set: (value: number) => poolStore.setHeatmapHighThreshold(value),
})
const uniformBarHeight = computed({
  get: () => poolStore.uniformHeatmapBarHeight,
  set: (value: boolean) => poolStore.setUniformHeatmapBarHeight(value),
})
const explanations = [
  {
    icon: '🎨',
    text: computed(() => t('heatmap.legend.explanations.color')),
  },
  {
    icon: '📏',
    text: computed(() => t('heatmap.legend.explanations.height')),
  },
]
</script>
