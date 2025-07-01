<template>
  <div>
    <!-- Hour labels -->
    <div class="flex mb-2">
      <div :class="isDesktop ? 'w-20' : 'w-8'" class="flex-shrink-0"></div>
      <!-- Space for day labels -->
      <div class="flex flex-1 gap-1">
        <div
          v-for="hour in hours"
          :key="hour"
          :class="[
            'text-center text-xs font-medium text-gray-600 dark:text-gray-400',
            isDesktop ? 'min-w-12' : 'flex-1 min-w-2',
          ]"
        >
          <span v-if="isDesktop">{{ hour }}:00</span>
          <span v-else-if="hour % 3 === 0">{{ hour }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isDesktop } = useDesktopView()

interface Props {
  hours: number[]
}

defineProps<Props>()
</script>
