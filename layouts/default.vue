<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex flex-col min-h-screen lg:ml-16">
      <div class="sticky top-0 z-40">
        <AppHeader />
      </div>

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto pt-6">
        <slot />
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()

onMounted(async () => {
  try {
    await poolStore.loadPoolsConfig()
  } catch (error) {
    console.error('Error initializing pool config:', error)
  }
})
</script>
