export const useDesktopView = () => {
  const poolStore = usePoolStore()

  const isDesktopMediaQuery = computed(
    () => useMediaQuery('(min-width: 1024px)').value
  )

  const isDesktop = computed(() => {
    if (poolStore.forceMobileView) return false
    return isDesktopMediaQuery.value
  })

  return {
    isDesktopMediaQuery,
    isDesktop,
  }
}
