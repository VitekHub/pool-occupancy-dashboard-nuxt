<template>
  <div class="relative text-center">
    <div
      v-if="poolStore.isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
    >
      <UIcon
        name="i-heroicons-arrow-path-20-solid"
        class="animate-spin h-8 w-8 text-blue-500"
      />
    </div>
    <div :class="{ 'opacity-50 pointer-events-none': poolStore.isLoading }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
</script>
