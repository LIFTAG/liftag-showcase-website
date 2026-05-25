// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-26',
  devtools: { enabled: true },
  ssr: true,
  modules: ['@vercel/analytics'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Set on Vercel as:
      //   NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<code from Google Search Console>
      //   NUXT_PUBLIC_BING_SITE_VERIFICATION=<code from Bing Webmaster Tools>
      // After claiming the property, redeploy and the verification meta tags
      // will appear on every page automatically.
      googleSiteVerification: '',
      bingSiteVerification: '',
    },
  },
  app: {
    head: {
      title: 'LIFTAG | NFC and QR Workout Tracking for Gyms',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { name: 'description', content: 'Tap NFC tags or scan QR codes on gym machines. LIFTAG opens exercise setup videos, set logging, rest timers, and progress tracking.' },
        { name: 'theme-color', content: '#000000' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/assets/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/logo-apple-touch.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,300;0,700;1,700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700;800&display=swap',
        },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
