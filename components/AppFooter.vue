<template>
  <footer
    class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
  >
    <div
      class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
    >
      <div>
        <p>{{ $t('footer.copyright') }}</p>
      </div>
      <div class="flex items-center space-x-4">
        <span>{{ $t('footer.version') }}</span>
      </div>
    </div>
  </footer>
</template>
