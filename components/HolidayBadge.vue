<template>
  <UPopover v-if="isHoliday" mode="hover" :popper="{ placement: 'top' }">
    <button
      type="button"
      class="inline-flex items-center justify-center text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors focus:outline-none"
      :aria-label="$t('holiday.label')"
    >
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
    </button>
    <template #panel>
      <div class="p-3 max-w-[220px]">
        <p
          class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-calendar"
            class="w-4 h-4 text-amber-500 flex-shrink-0"
          />
          {{ $t('holiday.label') }}
        </p>
        <p
          class="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
        >
          {{ $t('holiday.notice') }}
        </p>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { isCzechPublicHoliday } from '~/utils/czechHolidays'

const props = defineProps<{
  date: Date | null
}>()

const isHoliday = computed(
  () => !!props.date && isCzechPublicHoliday(props.date)
)
</script>
