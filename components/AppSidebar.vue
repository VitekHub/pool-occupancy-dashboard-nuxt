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
      'fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 z-50',
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
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
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
              class="ml-3 text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-white"
            >
              {{ $t('sidebar.title') }}
            </h1>
          </div>

          <!-- Mobile close button -->
          <button
            @click="closeMobileMenu"
            class="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UIcon
              name="i-heroicons-x-mark"
              class="h-5 w-5 text-gray-600 dark:text-gray-300"
            />
          </button>
        </div>
      </div>

      <!-- Navigation Items -->
      <div class="flex-1 overflow-y-auto py-4">
        <button
          v-for="(pool, index) in filteredPools"
          :key="pool.name"
          class="sidebar-menu-item"
          :class="{
            'bg-blue-100 dark:bg-blue-600 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-900 dark:text-white':
              poolStore.selectedPool?.name === pool.name,
          }"
          :title="!showText ? pool.name : undefined"
          @click="selectPool(pool)"
        >
          <UIcon :name="getPoolIcon(pool, index)" class="sidebar-icon" />
          <span v-if="showText" class="sidebar-text">
            {{ pool.name }}
          </span>
        </button>
      </div>

      <!-- Footer -->
      <div
        class="p-4 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center"
      >
        <p
          v-if="showText"
          class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {{ $t('sidebar.version') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { POOL_TYPES } from '~/types'

const { isMobileMenuOpen, closeMobileMenu } = useSidebar()
const poolStore = usePoolStore()

// Track if component is mounted to avoid hydration mismatches
const isMounted = ref(false)

const isDesktopExpanded = ref(false)

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
const showText = computed(() => isExpanded.value)

// Set mounted flag after component is mounted
onMounted(() => {
  isMounted.value = true
})

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

// Icons array for assigning to pools
const icons = [
  'i-heroicons-building-office-2',
  'i-heroicons-sun',
  'i-heroicons-beaker',
  'i-heroicons-sparkles',
  'i-heroicons-bolt',
  'i-heroicons-square-3-stack-3d',
]
const filteredPools = computed(() => {
  return poolStore.pools.filter((pool) => pool.outsidePool)
})
const getPoolIcon = (pool: any, index: number) => {
  return pool.icon || icons[index] || 'i-heroicons-building-office-2'
}
const selectPool = (pool: any) => {
  poolStore.setSelectedPool(pool, POOL_TYPES.OUTSIDE)
  closeMobileMenu()
}
</script>

<style scoped>
.sidebar-menu-item {
  @apply w-full flex items-center px-4 py-3 text-left text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700;
}

.sidebar-icon {
  @apply w-6 h-6 flex-shrink-0;
}

.sidebar-text {
  @apply ml-3 whitespace-nowrap overflow-hidden text-ellipsis;
}
</style>
