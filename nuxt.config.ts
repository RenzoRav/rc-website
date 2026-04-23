export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],

  runtimeConfig: {
    adminPasswordHash: '',
    salt: '',
    supabaseUrl:        '',
    supabaseServiceKey: '',
    public: {
      supabaseUrl: '',
      supabaseKey: '',
    },
  },

  nitro: {
    preset: 'netlify',
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options':           'DENY',
          'X-Content-Type-Options':    'nosniff',
          'Referrer-Policy':           'strict-origin-when-cross-origin',
          'Permissions-Policy':        'camera=(), microphone=(), geolocation=(), payment=()',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Resource-Policy': 'same-origin',
        },
      },
    },
  },


  $development: {
    nitro: {
      routeRules: {
        '/**': {
          headers: {
            'Content-Security-Policy':
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "worker-src 'self' blob:; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https: blob:; " +
              "font-src 'self'; " +
              "connect-src 'self' ws://localhost:* wss://localhost:*; " +
              "object-src 'none'; " +
              "frame-ancestors 'none'",
          },
        },
      },
    },
  },

 
  $production: {
    nitro: {
      routeRules: {
        '/**': {
          headers: {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'Content-Security-Policy':
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https: blob:; " +
              "font-src 'self'; " +
              "connect-src 'self'; " +
              "object-src 'none'; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "upgrade-insecure-requests",
          },
        },
      },
    },
  },
})
