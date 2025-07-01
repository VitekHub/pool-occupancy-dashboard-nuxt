<template>
  <UButton
    @click="toggleLanguage"
    variant="ghost"
    size="sm"
    :icon="'i-heroicons-language'"
    class="text-white dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    :title="nextLanguageName"
  >
    {{ currentLanguageCode }}
  </UButton>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()

const currentLanguageCode = computed(() => locale.value.toUpperCase())
const nextLanguage = computed(() => {
  const availableLocales = locales.value
  const currentIndex = availableLocales.findIndex(
    (l) => l.code === locale.value
  )
  const nextIndex = (currentIndex + 1) % availableLocales.length
  return availableLocales[nextIndex]
})
const nextLanguageName = computed(() => {
  return `Switch to ${nextLanguage.value.name}`
})
const toggleLanguage = () => {
  setLocale(nextLanguage.value.code)
}
</script>
