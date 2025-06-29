<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {{ poolStore.selectedPool?.name || 'Pool Dashboard' }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400">
      Monitor real-time pool usage and analytics for {{ poolStore.selectedPool?.name || 'this pool' }}.
    </p>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
</script>
