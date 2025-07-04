<template>
  <header
    class="bg-blue-600 text-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2"
  >
    <div class="flex items-center justify-between">
      <!-- Left Side -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu toggle -->
        <UButton
          @click="toggleMobileMenu"
          variant="soft"
          icon="i-heroicons-bars-3"
          class="lg:hidden"
        />
        <div>
          <h2 class="text-xl font-semibold">
            {{ poolStore.selectedPool?.name || $t('header.title') }}
          </h2>
          <p class="text-sm dark:text-gray-400">
            {{ $t('header.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <!-- Mobile View Toggle (Desktop Only) -->
        <div class="hidden lg:flex items-center space-x-2">
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <UToggle
              v-model="forceMobileView"
              color="blue"
              size="sm"
              class="shrink-0"
            />
            <span class="text-sm dark:text-gray-300">
              {{ $t('header.mobileView') }}
            </span>
          </label>
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
