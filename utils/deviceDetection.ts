/**
 * Detect if a User-Agent string indicates a mobile device
 * @param userAgent - The User-Agent string from the HTTP request
 * @returns true if the device is likely mobile, false if desktop
 */
export const isMobileUserAgent = (userAgent: string): boolean => {
  if (!userAgent) return false

  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
  return mobileRegex.test(userAgent)
}

/**
 * Detect if a User-Agent string indicates a desktop device
 * @param userAgent - The User-Agent string from the HTTP request
 * @returns true if the device is likely desktop, false if mobile
 */
export const isDesktopUserAgent = (userAgent: string): boolean => {
  return !isMobileUserAgent(userAgent)
}

/**
 * Get detailed device information from User-Agent string
 * @param userAgent - The User-Agent string from the HTTP request
 * @returns object with device type and additional info
 */
export const getDeviceInfo = (userAgent: string) => {
  if (!userAgent) {
    return {
      isMobile: false,
      isDesktop: true,
      isTablet: false,
      deviceType: 'desktop' as const,
    }
  }

  const isMobile = isMobileUserAgent(userAgent)
  const isTablet = /iPad|Android(?=.*Mobile)|Tablet/i.test(userAgent)

  return {
    isMobile,
    isDesktop: !isMobile,
    isTablet,
    deviceType: isTablet
      ? 'tablet'
      : isMobile
        ? 'mobile'
        : ('desktop' as 'mobile' | 'tablet' | 'desktop'),
  }
}
