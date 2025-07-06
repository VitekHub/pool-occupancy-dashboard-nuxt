<template>
  <UCard
    v-if="isDesktopMediaQuery"
    class="col-span-1 lg:col-span-2 xl:col-span-1"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('card.quickActions') }}
        </h3>
        <UIcon name="i-heroicons-bolt" class="h-5 w-5 text-yellow-500" />
      </div>
    </template>

    <div class="space-y-3">
      <UButton
        block
        variant="soft"
        class="h-10"
        color="blue"
        @click="scrollToStatistics"
      >
        {{ $t('card.viewStatistics') }}
      </UButton>
      <UButton block variant="soft" color="green" @click="exportData">
        {{ $t('card.exportData') }}
      </UButton>

      <!-- Mobile View Toggle (Desktop Only) -->
      <button
        v-if="isDesktopMediaQuery"
        @click="forceMobileView = !forceMobileView"
        class="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
      >
        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
          {{ $t('card.mobileView') }}
        </span>
        <UToggle
          v-model="forceMobileView"
          color="blue"
          size="sm"
          class="shrink-0 pointer-events-none"
        />
      </button>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
const { isDesktopMediaQuery } = useDesktopView()
const forceMobileView = computed({
  get: () => poolStore.forceMobileView,
  set: (value: boolean) => poolStore.setForceMobileView(value),
})

const scrollToStatistics = () => {
  const statisticsSection = document.getElementById('statistics-section')
  if (statisticsSection) {
    statisticsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
const exportData = () => {
  const csvUrl = poolStore.csvUrl
  if (csvUrl) {
    window.open(csvUrl, '_blank')
  }
}
</script>
