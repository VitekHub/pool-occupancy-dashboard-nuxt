<template>
  <div
    :class="
      !isMobile && poolStore.forceMobileView
        ? 'w-[500px] mx-auto'
        : 'max-w-fit mx-auto'
    "
  >
    <DashboardViewControls />
    <Heatmap />
  </div>
</template>

<script setup lang="ts">
const poolStore = usePoolStore()
const isMobile = computed(() => {
  return !useMediaQuery('(min-width: 1024px)').value
})
</script>
