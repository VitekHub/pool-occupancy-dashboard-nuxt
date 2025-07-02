<template>
  <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- View Mode Selection -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('dashboard.viewControls.viewMode') }}
        </label>
        <div class="flex flex-wrap gap-1 p-1">
          <UButton
            v-for="option in viewModeOptions"
            :key="option.value"
            :variant="viewMode === option.value ? 'solid' : 'outline'"
            color="sky"
            size="sm"
            @click="updateViewMode(option.value)"
            class="flex-1 justify-center"
          >
            {{ option.label }}
          </UButton>
        </div>
      </div>

      <!-- Week Selection (only for weekly views) -->
      <div v-if="viewMode !== VIEW_MODES.OVERALL">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('dashboard.viewControls.selectWeek') }}
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
            :placeholder="$t('dashboard.viewControls.selectWeekPlaceholder')"
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
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
import type { ViewMode } from '~/types'
import { VIEW_MODES } from '~/types'
import { formatWeekId } from '~/utils/dateUtils'

const poolStore = usePoolStore()
const { isDesktop } = useDesktopView()
const viewMode = computed({
  get: () => poolStore.viewMode,
  set: (value: ViewMode) => poolStore.setViewMode(value),
})
const selectedWeekId = computed({
  get: () => poolStore.selectedWeekId,
  set: (value: string | null) => poolStore.setSelectedWeekId(value),
})
const availableWeeks = computed(() => poolStore.availableWeekIds)
const canGoPreviousWeek = computed(() => {
  if (!selectedWeekId.value || availableWeeks.value.length === 0) return false
  const currentIndex = availableWeeks.value.indexOf(selectedWeekId.value)
  return currentIndex > 0
})
const canGoNextWeek = computed(() => {
  if (!selectedWeekId.value || availableWeeks.value.length === 0) return false
  const currentIndex = availableWeeks.value.indexOf(selectedWeekId.value)
  return currentIndex < availableWeeks.value.length - 1
})
const viewModeOptions = computed(() => {
  return [
    VIEW_MODES.OVERALL,
    VIEW_MODES.WEEKLY_AVERAGE,
    ...(isDesktop.value ? [VIEW_MODES.WEEKLY_RAW] : []),
  ].map((mode) => ({
    value: mode,
    label: computed(() => t(`dashboard.viewControls.${mode}`)),
  }))
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
const goToPreviousWeek = () => {
  if (!canGoPreviousWeek.value) return
  const currentIndex = availableWeeks.value.indexOf(selectedWeekId.value!)
  if (currentIndex > 0) {
    updateSelectedWeekId(availableWeeks.value[currentIndex - 1])
  }
}
const goToNextWeek = () => {
  if (!canGoNextWeek.value) return
  const currentIndex = availableWeeks.value.indexOf(selectedWeekId.value!)
  if (currentIndex < availableWeeks.value.length - 1) {
    updateSelectedWeekId(availableWeeks.value[currentIndex + 1])
  }
}
const updateViewMode = (newViewMode: ViewMode) => {
  viewMode.value = newViewMode
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
