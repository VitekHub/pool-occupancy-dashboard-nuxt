<template>
  <div class="flex items-center gap-2 flex-shrink-0">
    <label class="flex items-center space-x-2 cursor-pointer select-none">
      <UToggle
        v-model="showDailyTooltip"
        color="blue"
        size="sm"
        class="shrink-0"
      />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('heatmap.daily.showTooltip') }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()

const showDailyTooltip = computed({
  get: () => poolStore.showDailyTooltip,
  set: (value: boolean) => poolStore.setShowDailyTooltip(value),
})
</script>
