export const useSidebar = () => {
  const isMobileMenuOpen = useState('sidebar.isMobileMenuOpen', () => false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  return {
    isMobileMenuOpen: readonly(isMobileMenuOpen),
    toggleMobileMenu,
    closeMobileMenu,
  }
}
