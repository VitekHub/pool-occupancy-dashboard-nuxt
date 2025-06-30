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
const { t } = useI18n()

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
      return t('heatmap.weeklyAverage.title')
    case 'weekly-raw':
      return t('heatmap.weeklyRaw.title')
    default:
      return t('heatmap.overall.title')
  }
})

const headerDescription = computed(() => {
  switch (props.viewMode) {
    case 'weekly-average':
      return props.selectedWeekId
        ? t('heatmap.weeklyAverage.description', {
            date: formatWeekId(props.selectedWeekId),
          })
        : t('heatmap.weeklyAverage.selectWeek')
    case 'weekly-raw':
      return props.selectedWeekId
        ? t('heatmap.weeklyRaw.description', {
            date: formatWeekId(props.selectedWeekId),
          })
        : t('heatmap.weeklyRaw.selectWeek')
    default:
      return t('heatmap.overall.description')
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
