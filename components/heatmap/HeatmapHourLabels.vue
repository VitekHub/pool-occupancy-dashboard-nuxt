<template>
  <div>
    <!-- Hour labels (desktop only) -->
    <div v-if="isDesktop" class="flex mb-2">
      <div class="w-20 flex-shrink-0"></div>
      <!-- Space for day labels -->
      <div class="flex flex-1 gap-1">
        <div
          v-for="hour in hours"
          :key="hour"
          class="min-w-12 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          {{ hour }}:00
        </div>
      </div>
    </div>

    <!-- Hour labels (mobile - selective) -->
    <div v-if="!isDesktop" class="flex mb-2">
      <div class="w-8 flex-shrink-0"></div>
      <!-- Space for day labels -->
      <div class="flex flex-1 gap-1">
        <div
          v-for="hour in hours"
          :key="hour"
          class="flex-1 min-w-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          <!-- Show label every 3rd hour for mobile -->
          <span v-if="hour % 3 === 0">{{ hour }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hours: number[]
  isDesktop: boolean
}

defineProps<Props>()
</script>
