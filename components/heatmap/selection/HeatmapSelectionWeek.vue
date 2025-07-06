<template>
  <div v-if="viewMode === VIEW_MODES.WEEKLY">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ $t('heatmap.selection.selectWeek') }}
    </label>
    <div class="flex items-center gap-2">
      <!-- Previous Week Button -->
      <UButton
        icon="i-heroicons-chevron-left"
        color="sky"
        variant="solid"
        size="sm"
        :disabled="!canGoPreviousWeek"
        :class="{ 'opacity-40 cursor-not-allowed': !canGoPreviousWeek }"
        @click="goToPreviousWeek"
        class="flex-shrink-0 text-white mt-1"
      />

      <!-- Week Selector -->
      <USelect
        :model-value="selectedWeekId"
        @update:model-value="updateSelectedWeekId"
        :options="weekOptions"
        option-attribute="label"
        value-attribute="value"
        :placeholder="$t('heatmap.selection.selectWeekPlaceholder')"
        :disabled="availableWeeks.length === 0"
        class="flex-1 mt-1 week-selector"
      />

      <!-- Next Week Button -->
      <UButton
        icon="i-heroicons-chevron-right"
        color="sky"
        variant="solid"
        size="sm"
        :disabled="!canGoNextWeek"
        :class="{ 'opacity-40 cursor-not-allowed': !canGoNextWeek }"
        @click="goToNextWeek"
        class="flex-shrink-0 text-white mt-1"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const { t, locale } = useI18n()
import { VIEW_MODES } from '~/types'
import { formatWeekId } from '~/utils/dateUtils'

const poolStore = usePoolStore()
const viewMode = computed(() => poolStore.viewMode)
const selectedWeekId = computed({
  get: () => poolStore.selectedWeekId,
  set: (value: string | null) => poolStore.setSelectedWeekId(value),
})

const weekOptions = computed(() => {
  return availableWeeks.value.map((weekId) => ({
    value: weekId,
    label: formatWeekLabel(weekId),
  }))
})
const formatWeekLabel = (weekId: string): string => {
  return `${t('heatmap.weekOfLabel')} ${formatWeekId(weekId, locale.value)}`
}
const availableWeeks = computed(() => poolStore.availableWeekIds)

const selectedWeekIndex = computed(() => {
  if (!selectedWeekId.value || availableWeeks.value.length === 0) return -1
  return availableWeeks.value.indexOf(selectedWeekId.value)
})
const canGoPreviousWeek = computed(() => {
  return selectedWeekIndex.value > 0
})
const canGoNextWeek = computed(() => {
  return selectedWeekIndex.value < availableWeeks.value.length - 1
})
const goToPreviousWeek = () => {
  if (canGoPreviousWeek.value) {
    updateSelectedWeekId(availableWeeks.value[selectedWeekIndex.value - 1])
  }
}
const goToNextWeek = () => {
  if (canGoNextWeek.value) {
    updateSelectedWeekId(availableWeeks.value[selectedWeekIndex.value + 1])
  }
}
const updateSelectedWeekId = (newWeekId: string | null) => {
  selectedWeekId.value = newWeekId
}

// Auto-select first week when switching to weekly view
watch(
  [viewMode, availableWeeks],
  ([newViewMode, newAvailableWeeks]) => {
    if (newViewMode !== VIEW_MODES.OVERALL && newAvailableWeeks.length > 0) {
      // If no week is selected or selected week is not available, select the most recent week
      if (
        !selectedWeekId.value ||
        !newAvailableWeeks.includes(selectedWeekId.value)
      ) {
        updateSelectedWeekId(newAvailableWeeks[newAvailableWeeks.length - 1])
      }
    }
  },
  { immediate: true }
)

// Reset week selection when switching back to overall
watch(viewMode, (newViewMode) => {
  if (newViewMode === VIEW_MODES.OVERALL) {
    updateSelectedWeekId(null)
  }
})
</script>

<style scoped>
:deep(.week-selector select:focus) {
  --tw-ring-color: transparent !important;
}
</style>
