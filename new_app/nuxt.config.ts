// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-26',
  devtools: { enabled: true },
  ssr: true,
  modules: ['@vercel/analytics', '@nuxtjs/turnstile', 'nuxt-gtag'],
  css: ['~/assets/css/main.css'],
  turnstile: {
    siteKey: '0x4AAAAAADV3ju2YEd8uiR-k',
  },
  gtag: {
    id: 'G-GHP3YKQJG7',
    initMode: 'manual',
  },
  runtimeConfig: {
    public: {
      // Set on Vercel as:
      //   NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<code from Google Search Console>
      //   NUXT_PUBLIC_BING_SITE_VERIFICATION=<code from Bing Webmaster Tools>
      // After claiming the property, redeploy and the verification meta tags
      // will appear on every page automatically.
      googleSiteVerification: '',
      bingSiteVerification: '',
      apiBaseUrl: 'https://api.liftag.fit',
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
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/inter-latin.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/space-grotesk-latin.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/jetbrains-mono-latin.woff2' },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
