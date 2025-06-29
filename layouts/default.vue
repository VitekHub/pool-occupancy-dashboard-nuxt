<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex flex-col min-h-screen lg:ml-16">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()

// Initialize the store with pool configurations and occupancy data
onMounted(async () => {
  try {
    // First load the pool configurations
    await poolStore.loadPoolsConfig()

    // Then load and process the occupancy data for the selected pool
    await poolStore.loadAndProcessOccupancyData()
  } catch (error) {
    console.error('Error initializing pool data:', error)
  }
})
</script>
