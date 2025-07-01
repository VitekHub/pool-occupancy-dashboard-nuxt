import { computed } from 'vue'

export const useDesktopView = () => {
  const poolStore = usePoolStore()

  const isDesktop = computed(() => {
    if (poolStore.forceMobileView) return false
    return useMediaQuery('(min-width: 1024px)').value
  })

  return {
    isDesktop,
  }
}
