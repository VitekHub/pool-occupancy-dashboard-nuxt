<template>
  <UButton
    @click="toggleLanguage"
    variant="ghost"
    size="sm"
    :icon="'i-heroicons-language'"
    class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    :title="nextLanguageName"
  >
    {{ currentLanguageCode }}
  </UButton>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()

// Get current language code in uppercase
const currentLanguageCode = computed(() => locale.value.toUpperCase())

// Get the next language when toggling
const nextLanguage = computed(() => {
  const availableLocales = locales.value
  const currentIndex = availableLocales.findIndex(
    (l) => l.code === locale.value
  )
  const nextIndex = (currentIndex + 1) % availableLocales.length
  return availableLocales[nextIndex]
})

// Get the next language name for tooltip
const nextLanguageName = computed(() => {
  return `Switch to ${nextLanguage.value.name}`
})

// Toggle between languages
const toggleLanguage = () => {
  setLocale(nextLanguage.value.code)
}
</script>
