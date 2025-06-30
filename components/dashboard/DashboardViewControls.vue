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
const { t } = useI18n()
import type { ViewMode } from '~/types'
import { VIEW_MODES } from '~/types'
const poolStore = usePoolStore()
defineEmits<{
  'view-state-changed': [{ viewMode: ViewMode; selectedWeekId: string | null }]
}>()

const viewMode = ref<ViewMode>(VIEW_MODES.OVERALL)
const selectedWeekId = ref<string | null>(null)
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
const viewModeOptions = [
  VIEW_MODES.OVERALL,
  VIEW_MODES.WEEKLY_AVERAGE,
  VIEW_MODES.WEEKLY_RAW,
].map((viewMode) => ({
  value: viewMode,
  label: computed(() => t(`dashboard.viewControls.${viewMode}`)),
}))

const weekOptions = computed(() => {
  return availableWeeks.value.map((weekId) => ({
    value: weekId,
    label: formatWeekLabel(weekId),
  }))
})
const formatWeekLabel = (weekId: string): string => {
  try {
    const date = new Date(weekId)
    return `${t('heatmap.weekOfLabel')} ${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`
  } catch {
    return `Week ${weekId}`
  }
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
  emitViewStateChanged()
}
const updateSelectedWeekId = (newWeekId: string | null) => {
  selectedWeekId.value = newWeekId
  emitViewStateChanged()
}
const emitViewStateChanged = () => {
  emit('view-state-changed', {
    viewMode: viewMode.value,
    selectedWeekId: selectedWeekId.value,
  })
}
const emit = getCurrentInstance()?.emit

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

onMounted(() => {
  emitViewStateChanged()
})
</script>
<style scoped>
:deep(.week-selector select:focus) {
  --tw-ring-color: transparent !important;
}
</style>
