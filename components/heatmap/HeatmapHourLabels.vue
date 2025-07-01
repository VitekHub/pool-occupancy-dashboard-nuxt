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
            'font-medium flex items-end justify-center',
            isDesktop ? 'min-w-12' : 'flex-1 min-w-2',
            hour === new Date().getHours()
              ? 'text-sm text-red-600 dark:text-red-400'
              : 'text-xs text-gray-600 dark:text-gray-400',
          ]"
        >
          <div>
            <UIcon
              v-if="!isDesktop && hour === new Date().getHours()"
              name="i-heroicons-arrow-long-down"
              class="h-6 w-6 text-red-600"
            />
            <div v-if="isDesktop">{{ hour }}:00</div>
            <div v-else>{{ hour % 3 === 0 ? hour : '&nbsp;' }}</div>
          </div>
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
