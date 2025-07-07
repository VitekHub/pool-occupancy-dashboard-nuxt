<template>
  <UCard class="col-span-1">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="h3-title">
          {{ $t('card.poolStatus') }}
        </h3>
        <UIcon
          name="i-heroicons-clock"
          :class="['h-5 w-5', poolStatusCssClass]"
        />
      </div>
    </template>

    <div class="text-center">
      <div :class="['text-xl font-semibold mb-2', poolStatusCssClass]">
        <PoolNavigator>
          <div class="min-w-[220px]">
            {{ poolStore.selectedPool?.name }}
          </div>
        </PoolNavigator>
        <div class="mt-2">
          {{ poolStore.isPoolOpen ? $t('common.open') : $t('common.closed') }}
        </div>
      </div>
      <div
        v-if="!poolStore.isPoolOpen"
        class="text-gray-600 dark:text-gray-400"
      >
        {{ t('card.poolClosed') }}
      </div>
      <div
        v-if="poolStore.isPoolOpen && poolStore.todayOpeningHours"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ $t('common.today') }}:
        {{ formatOpeningHours(poolStore.todayOpeningHours) }}
      </div>

      <!-- Buttons -->
      <div class="mt-3 flex flex-col items-center space-y-2">
        <UButton
          v-if="poolWebsiteUrl"
          :to="poolWebsiteUrl"
          external
          target="_blank"
          variant="outline"
          color="blue"
          size="sm"
          icon="i-heroicons-link"
        >
          {{ $t('card.visitWebsite') }}
        </UButton>
        <UButton
          v-if="!isDesktopMediaQuery"
          variant="outline"
          color="blue"
          size="sm"
          icon="i-heroicons-chart-bar"
          @click="scrollToStatistics"
        >
          {{ $t('card.viewStatistics') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const poolStore = usePoolStore()

const scrollToStatistics = () => {
  const statisticsSection = document.getElementById('statistics-section')
  if (statisticsSection) {
    statisticsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
const { isDesktopMediaQuery } = useDesktopView()
const formatOpeningHours = (hours: string): string => {
  const [open, close] = hours.split('-')
  return `${open}:00 - ${close}:00`
}

const poolStatusCssClass = computed(() => {
  return poolStore.isPoolOpen
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
})

const poolWebsiteUrl = computed((): string | null => {
  if (!poolStore.selectedPool) return null

  if (
    poolStore.selectedPoolType === 'inside' &&
    poolStore.selectedPool.insidePool
  ) {
    return poolStore.selectedPool.insidePool.url
  } else if (
    poolStore.selectedPoolType === 'outside' &&
    poolStore.selectedPool.outsidePool
  ) {
    return poolStore.selectedPool.outsidePool.url
  }

  return null
})
</script>
