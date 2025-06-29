<template>
  <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <!-- Legend Items, Toggle and Slider on one line -->
    <div class="mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Occupancy Rate Legend
      </h3>
      <div class="flex flex-col lg:flex-row lg:items-center gap-6">
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
          <UToggle v-model="uniformBarHeight" color="blue" />
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Uniform Bar Height
          </label>
        </div>

        <!-- High Threshold Slider -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="flex-shrink-0">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              High Threshold
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
interface LegendItem {
  color: string
  label: string
}

interface Props {
  legendItems: LegendItem[]
}

defineProps<Props>()

// Get pool store
const poolStore = usePoolStore()

// Computed property for threshold value with getter/setter
const thresholdValue = computed({
  get: () => poolStore.heatmapHighThreshold,
  set: (value: number) => poolStore.setHeatmapHighThreshold(value),
})

// Computed property for uniform bar height with getter/setter
const uniformBarHeight = computed({
  get: () => poolStore.uniformHeatmapBarHeight,
  set: (value: boolean) => poolStore.setUniformHeatmapBarHeight(value),
})

// Explanation data to eliminate duplication
const explanations = [
  {
    icon: '🎨',
    text: 'The color represents absolute occupancy rate compared to maximum pool capacity - darker colors indicate higher occupancy.',
  },
  {
    icon: '📏',
    text: 'The height of the colored bar represents relative occupancy within that day - a taller bar indicates higher occupancy compared to other hours of the same day.',
  },
]
</script>
