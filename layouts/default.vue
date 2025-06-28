<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex flex-col min-h-screen lg:ml-16">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>
