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
import { isDesktopUserAgent } from '~/utils/deviceDetection'

const poolStore = usePoolStore()

// Server-side device detection from User-Agent
const headers = useRequestHeaders(['user-agent'])
const userAgent = headers['user-agent'] || ''
const serverIsDesktop = isDesktopUserAgent(userAgent)

const { isDesktopMediaQuery } = useDesktopView(serverIsDesktop)

// Pool initialization in the setup context for SSR
await poolStore.loadPoolsConfig()
</script>
