<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2"
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
            {{ poolStore.selectedPool?.name || $t('header.title') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('header.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <UButton
          variant="ghost"
          icon="i-heroicons-bell"
          class="relative"
          :title="$t('header.notifications')"
        />

        <!-- Mobile View Toggle (Desktop Only) -->
        <div class="hidden lg:flex items-center space-x-2">
          <UToggle
            v-model="forceMobileView"
            color="blue"
            size="sm"
            class="shrink-0"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{
            $t('header.mobileView')
          }}</span>
        </div>
        <LanguageSwitcher />
        <ColorModeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { toggleMobileMenu } = useSidebar()
const poolStore = usePoolStore()
const forceMobileView = computed({
  get: () => poolStore.forceMobileView,
  set: (value: boolean) => poolStore.setForceMobileView(value),
})
</script>
