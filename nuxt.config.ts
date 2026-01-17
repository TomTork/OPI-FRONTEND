export default defineNuxtConfig({
  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui-pro',
    '@nuxtjs/strapi'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1337/api'
    }
  },
  nitro: {
    routeRules: {
      '/api/**': { 
        proxy: 'http://localhost:1337/**' 
      }
    }
  },
  typescript: {
    shim: false,
    strict: true,
    typeCheck: false
  },
  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v4'
  },
  imports: {
    dirs: [
      'composables/**',
      'types/**'
    ]
  }
})
