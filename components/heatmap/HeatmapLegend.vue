<template>
  <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Occupancy Rate Legend
    </h3>
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
</script>
