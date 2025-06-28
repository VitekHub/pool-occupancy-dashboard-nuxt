<template>
  <!-- Mobile Overlay -->
  <div
    v-if="isMobileMenuOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="closeMobileMenu"
  />

  <!-- Sidebar -->
  <div
    :class="[
      'fixed left-0 top-0 h-full bg-gray-800 dark:bg-gray-900 text-white shadow-lg transition-all duration-300 z-50',
      // Mobile: slide in/out, Desktop: always visible with hover expansion
      'lg:translate-x-0',
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isExpanded ? 'w-64' : 'w-64 lg:w-16',
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-building-office-2"
                class="h-5 w-5 text-white"
              />
            </div>
            <h1
              v-if="showText"
              class="ml-3 text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis"
            >
              Pool Dashboard
            </h1>
          </div>

          <!-- Mobile close button -->
          <button
            @click="closeMobileMenu"
            class="lg:hidden p-1 rounded-md hover:bg-gray-700 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 overflow-y-auto py-4">
        <NuxtLink
          to="/"
          class="sidebar-menu-item"
          :class="{ 'bg-blue-600 hover:bg-blue-700': $route.path === '/' }"
          :title="!showText ? 'Dashboard' : undefined"
          @click="closeMobileMenu"
        >
          <UIcon name="i-heroicons-home" class="sidebar-icon" />
          <span v-if="showText" class="sidebar-text"> Dashboard </span>
        </NuxtLink>

        <button
          v-for="pool in poolAreas"
          :key="pool.id"
          class="sidebar-menu-item"
          :title="!showText ? pool.name : undefined"
        >
          <UIcon :name="pool.icon" class="sidebar-icon" />
          <span v-if="showText" class="sidebar-text">
            {{ pool.name }}
          </span>
        </button>
      </div>

      <!-- Footer -->
      <div
        class="p-4 border-t border-gray-700 dark:border-gray-600 h-16 flex items-center"
      >
        <p
          v-if="showText"
          class="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          Pool Occupancy Dashboard v1.0.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isMobileMenuOpen, closeMobileMenu } = useSidebar()

// Track if component is mounted to avoid hydration mismatches
const isMounted = ref(false)

// Desktop hover state
const isDesktopExpanded = ref(false)

// Computed to determine when to show text
const showText = computed(() => {
  // Don't check window size until mounted to avoid hydration mismatch
  if (!isMounted.value) {
    return false
  }

  // Always show text on mobile
  if (process.client && window.innerWidth < 1024) {
    return true
  }
  // On desktop, show text when expanded via hover
  return isDesktopExpanded.value
})

// Computed for overall expanded state
const isExpanded = computed(() => {
  // Don't check window size until mounted to avoid hydration mismatch
  if (!isMounted.value) {
    return false
  }

  // Mobile: always expanded when open
  if (process.client && window.innerWidth < 1024) {
    return true
  }
  // Desktop: expanded on hover
  return isDesktopExpanded.value
})

// Set mounted flag after component is mounted
onMounted(() => {
  isMounted.value = true
})

// Mouse events for desktop hover
const onMouseEnter = () => {
  if (isMounted.value && process.client && window.innerWidth >= 1024) {
    isDesktopExpanded.value = true
  }
}

const onMouseLeave = () => {
  if (isMounted.value && process.client && window.innerWidth >= 1024) {
    isDesktopExpanded.value = false
  }
}

// Sample pool areas data
const poolAreas = [
  {
    id: 1,
    name: 'Main Pool',
    icon: 'i-heroicons-square-3-stack-3d',
    occupancy: 12,
  },
  { id: 2, name: 'Kids Pool', icon: 'i-heroicons-heart', occupancy: 5 },
  {
    id: 3,
    name: 'Lap Pool',
    icon: 'i-heroicons-arrow-long-right',
    occupancy: 8,
  },
]
</script>

<style scoped>
.sidebar-menu-item {
  @apply w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-gray-700 dark:hover:bg-gray-800;
}

.sidebar-icon {
  @apply w-6 h-6 flex-shrink-0;
}

.sidebar-text {
  @apply ml-3 whitespace-nowrap overflow-hidden text-ellipsis;
}
</style>
