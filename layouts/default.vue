<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex flex-col min-h-screen lg:ml-16">
      <AppHeader :class="isDesktopMediaQuery ? 'sticky top-0 z-40' : ''" />

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
const { isDesktopMediaQuery } = useDesktopView()

// Pool initialization in the setup context for SSR
await poolStore.loadPoolsConfig()

// Pre-fetch all pools data
await Promise.all(
  poolStore.pools.map(async (pool) => {
    const csvFileName = pool.outsidePool?.csvFile || pool.insidePool?.csvFile
    try {
      if (csvFileName) {
        await $fetch(`${import.meta.env.VITE_CSV_BASE_URL}${csvFileName}`)
      }
    } catch (err) {
      console.error(`Failed to fetch ${csvFileName}:`, err)
    }
  })
)
</script>
