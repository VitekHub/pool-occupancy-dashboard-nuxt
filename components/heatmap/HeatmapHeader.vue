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
const { t, locale } = useI18n()

import type { ViewMode } from '~/types'
import { VIEW_MODES } from '~/types'
import { formatWeekId } from '~/utils/dateUtils'

interface Props {
  viewMode?: ViewMode
  selectedWeekId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: VIEW_MODES.OVERALL,
  selectedWeekId: null,
})

const headerTitle = computed(() => t(`heatmap.${props.viewMode}.title`))

const headerDescription = computed(() =>
  t(`heatmap.${props.viewMode}.description`, {
    date: formatWeekId(props.selectedWeekId, locale.value),
  })
)
</script>
