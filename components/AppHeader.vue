<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
  >
    <div class="flex items-center justify-between">
      <!-- Left Side -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu toggle -->
        <UButton
          @click="toggleMobileMenu"
          variant="ghost"
          icon="i-heroicons-bars-3"
          class="lg:hidden"
        />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Pool Occupancy Dashboard
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring and analytics
          </p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <UButton variant="ghost" icon="i-heroicons-bell" class="relative" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { toggleMobileMenu } = useSidebar()
</script>
