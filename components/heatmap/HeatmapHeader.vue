<template>
  <div class="mb-3">
    <h2 class="h2-title">
      {{ headerTitle }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ headerDescription }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

import { formatWeekId } from '~/utils/dateUtils'

const poolStore = usePoolStore()

const headerTitle = computed(
  () => `${t(`heatmap.${poolStore.viewMode}.${poolStore.metricType}.title`)}`
)

const headerDescription = computed(() =>
  t(`heatmap.${poolStore.viewMode}.${poolStore.metricType}.description`, {
    date: formatWeekId(poolStore.selectedWeekId || '', locale.value),
  })
)
</script>
