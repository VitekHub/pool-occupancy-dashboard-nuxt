<template>
  <div class="flex items-end justify-center">
    <UButton
      icon="i-heroicons-chevron-left"
      color="sky"
      variant="solid"
      size="xs"
      @click="goToPreviousPool"
      class="flex-shrink-0 text-white mt-2"
    />
    <slot>
      <SpinnerOverlay>
        <div class="text-center min-w-[230px]">
          {{ poolStore.selectedPool?.name }}
        </div>
      </SpinnerOverlay>
    </slot>
    <UButton
      icon="i-heroicons-chevron-right"
      color="sky"
      variant="solid"
      size="xs"
      @click="goToNextPool"
      class="flex-shrink-0 text-white mt-2"
    />
  </div>
</template>

<script setup lang="ts">
import { POOL_TYPES } from '~/types'

const poolStore = usePoolStore()

const changePool = (direction: 1 | -1) => {
  const count = poolStore.pools.length
  const poolIndex = poolStore.pools.findIndex(
    (pool) => pool.name === poolStore.selectedPool?.name
  )
  const newIndex = (poolIndex + direction + count) % count
  poolStore.setSelectedPool(poolStore.pools[newIndex], POOL_TYPES.OUTSIDE)
}

const goToPreviousPool = () => changePool(-1)
const goToNextPool = () => changePool(1)
</script>
