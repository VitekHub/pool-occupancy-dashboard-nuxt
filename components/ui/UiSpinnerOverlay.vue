<template>
  <div class="relative text-center">
    <div
      v-if="poolStore.isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
    >
      <UiSpinningIcon />
    </div>
    <div :class="{ 'opacity-50 pointer-events-none': poolStore.isLoading }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
</script>
