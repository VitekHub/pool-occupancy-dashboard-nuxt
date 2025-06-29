<template>
  <UButton
    :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
    variant="ghost"
    size="sm"
    @click="toggleColorMode"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
  />
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
