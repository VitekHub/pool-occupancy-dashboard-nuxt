<template>
  <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- View Mode Selection -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          View Mode
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
      <div v-if="viewMode !== 'overall'">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Week
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
            class="flex-shrink-0 text-white"
          />

          <!-- Week Selector -->
          <USelect
            :model-value="selectedWeekId"
            @update:model-value="updateSelectedWeekId"
            :options="weekOptions"
            option-attribute="label"
            value-attribute="value"
            placeholder="Select a week"
            :disabled="availableWeeks.length === 0"
            color="sky"
            class="flex-1"
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
            class="flex-shrink-0 text-white"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ViewMode = 'overall' | 'weekly-average' | 'weekly-raw'

// Get pool store
const poolStore = usePoolStore()

// Emits - only emit the current state when it changes
defineEmits<{
  'view-state-changed': [{ viewMode: ViewMode; selectedWeekId: string | null }]
}>()

// Local state
const viewMode = ref<ViewMode>('overall')
const selectedWeekId = ref<string | null>(null)

// Available weeks from the store
const availableWeeks = computed(() => poolStore.availableWeekIds)

// Navigation state
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

// View mode options
const viewModeOptions = [
  { value: 'overall', label: 'Overall Average' },
  { value: 'weekly-average', label: 'Weekly Average' },
  { value: 'weekly-raw', label: 'Weekly Min/Max' },
]

// Week options for the select dropdown
const weekOptions = computed(() => {
  return availableWeeks.value.map((weekId) => ({
    value: weekId,
    label: formatWeekLabel(weekId),
  }))
})

// Format week ID for display
const formatWeekLabel = (weekId: string): string => {
  try {
    const date = new Date(weekId)
    return `Week of ${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`
  } catch {
    return `Week ${weekId}`
  }
}

// Navigation functions
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

// Update functions that emit changes
const updateViewMode = (newViewMode: ViewMode) => {
  viewMode.value = newViewMode
  emitViewStateChanged()
}

const updateSelectedWeekId = (newWeekId: string | null) => {
  selectedWeekId.value = newWeekId
  emitViewStateChanged()
}

// Emit function
const emitViewStateChanged = () => {
  emit('view-state-changed', {
    viewMode: viewMode.value,
    selectedWeekId: selectedWeekId.value,
  })
}

// Get emit function
const emit = getCurrentInstance()?.emit

// Auto-select first week when switching to weekly view
watch(
  [viewMode, availableWeeks],
  ([newViewMode, newAvailableWeeks]) => {
    if (
      newViewMode !== 'overall' &&
      newAvailableWeeks.length > 0 &&
      !selectedWeekId.value
    ) {
      updateSelectedWeekId(newAvailableWeeks[newAvailableWeeks.length - 1]) // Select most recent week
    }
  },
  { immediate: true }
)

// Reset week selection when switching back to overall
watch(viewMode, (newViewMode) => {
  if (newViewMode === 'overall') {
    updateSelectedWeekId(null)
  }
})

// Emit initial state
onMounted(() => {
  emitViewStateChanged()
})
</script>
