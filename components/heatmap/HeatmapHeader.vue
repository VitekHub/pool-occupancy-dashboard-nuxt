<template>
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {{ headerTitle }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ headerDescription }}
    </p>
  </div>
</template>

<script setup lang="ts">
type ViewMode = 'overall' | 'weekly-average' | 'weekly-raw'

interface Props {
  viewMode?: ViewMode
  selectedWeekId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'overall',
  selectedWeekId: null,
})

const headerTitle = computed(() => {
  switch (props.viewMode) {
    case 'weekly-average':
      return `Weekly Pool Occupancy Heatmap (Average)`
    case 'weekly-raw':
      return `Weekly Pool Occupancy Heatmap (Min/Max)`
    default:
      return `Overall Pool Occupancy Heatmap`
  }
})

const headerDescription = computed(() => {
  switch (props.viewMode) {
    case 'weekly-average':
      return props.selectedWeekId
        ? `Average occupancy rates for week starting ${formatWeekId(props.selectedWeekId)}`
        : 'Select a week to view average occupancy rates'
    case 'weekly-raw':
      return props.selectedWeekId
        ? `Min/Max occupancy values for week starting ${formatWeekId(props.selectedWeekId)}`
        : 'Select a week to view min/max occupancy values'
    default:
      return 'Average occupancy rates across all recorded weeks'
  }
})

const formatWeekId = (weekId: string): string => {
  try {
    const date = new Date(weekId)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return weekId
  }
}
</script>
