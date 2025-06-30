// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
  },

  // i18n configuration
  i18n: {
    defaultLocale: 'cs',
    locales: [
      { code: 'cs', name: 'Čeština', file: 'cs.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'cs',
    },
  },

  // GitHub Pages configuration
  app: {
    baseURL:
      process.env.NODE_ENV === 'production'
        ? '/pool-occupancy-dashboard-nuxt/'
        : '/',
  },

  // Disable SSR for static generation
  ssr: false,

  // Enable static site generation
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
