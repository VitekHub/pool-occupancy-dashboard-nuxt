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

import { formatWeekId } from '~/utils/dateUtils'

const poolStore = usePoolStore()

const headerTitle = computed(
  () =>
    `${t(`heatmap.${poolStore.viewMode}.title`)}: ${poolStore.selectedPool?.name || ''}`
)

const headerDescription = computed(() =>
  t(`heatmap.${poolStore.viewMode}.description`, {
    date: formatWeekId(poolStore.selectedWeekId || '', locale.value),
  })
)
</script>
