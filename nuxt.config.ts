// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
  },
  
  // GitHub Pages configuration
  app: {
    baseURL: '/pool-occupancy-dashboard-nuxt/', // Replace with your actual repository name
  },
  
  // Disable SSR for static generation
  ssr: false,
  
  // Enable static site generation
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
})
