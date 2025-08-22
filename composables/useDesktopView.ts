export const useDesktopView = () => {
  const poolStore = usePoolStore()

  // Use useState to ensure consistent SSR/client initial values
  const isDesktopMediaQuery = useState('isDesktopMediaQuery', () => false)

  // Create reactive media query that only runs on client
  const mediaQuery = import.meta.client
    ? useMediaQuery('(min-width: 1024px)')
    : ref(false)

  // Update the state value when media query changes, but only on client-side after mount
  onMounted(() => {
    if (import.meta.client) {
      // Set initial value
      isDesktopMediaQuery.value = mediaQuery.value

      // Watch for changes and update reactively
      watch(mediaQuery, (newValue) => {
        isDesktopMediaQuery.value = newValue
      })
    }
  })

  const isDesktop = computed(() => {
    if (poolStore.forceMobileView) return false
    return isDesktopMediaQuery.value
  })

  return {
    isDesktopMediaQuery,
    isDesktop,
  }
}
