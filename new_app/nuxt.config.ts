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
      title: 'LIFTAG | Workout Tracker with NFC and QR Gym Tags',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        // viewport-fit=cover lets the page paint into the display cutout area
        // (Dynamic Island / notch) instead of iOS filling it from theme-color,
        // and is what makes env(safe-area-inset-*) resolve to anything but 0.
        // Everything that must stay clear of the cutout reads the
        // --liftag-safe-* tokens in assets/css/main.css.
        //
        // interactive-widget=resizes-content asks the browser to shrink the
        // layout viewport (not just the visual one) when the software keyboard
        // opens, so fixed and sticky boxes stay where the user can see them
        // with no JS compensation. Chrome/Firefox/Samsung on Android honor it;
        // engines that don't (iOS Safari today) ignore the token and keep the
        // --liftag-vv-top fallback published by SiteNav.
        { name: 'viewport', content: 'width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content' },
        { name: 'description', content: 'LIFTAG is a free workout tracker. Tap NFC tags or scan QR codes on gym machines to open setup videos, log sets, run rest timers, and track progress.' },
        { name: 'theme-color', content: '#000000' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-itunes-app', content: 'app-id=6761140080' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'application-name', content: 'LIFTAG' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/assets/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/logo-apple-touch.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'text/plain', href: 'https://liftag.fit/llms.txt', title: 'llms.txt' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/inter-latin.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/space-grotesk-latin.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/assets/fonts/jetbrains-mono-latin.woff2' },
      ],
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Keep three.js in its own async chunk instead of letting Rollup
          // merge every 3D component into one oversized bundle.
          manualChunks: (id: string) => (id.includes('node_modules/three/') ? 'three' : undefined),
        },
      },
    },
  },
  hooks: {
    // All three.js consumers are async components behind viewport observers,
    // and pages/index.vue warms the chunk on idle. Without this hook Nuxt
    // still emits <link rel="modulepreload"> for it, putting ~180KB gzip back
    // in contention with the LCP image and fonts on first paint.
    'build:manifest': (manifest) => {
      for (const entry of Object.values(manifest)) {
        if (entry.name === 'three' || entry.file?.includes('three')) {
          entry.preload = false
          entry.prefetch = false
        }
      }
    },
  },
  router: {
    options: {
      strict: false,
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/for-lifters': { prerender: true },
    '/for-trainers': { prerender: true },
    '/for-gyms': { prerender: true },
    '/become-a-coach': { prerender: true },
    '/qr-nfc-gym-tags': { prerender: true },
    '/best-workout-tracking-app': { prerender: true },
    '/best-gym-qr-nfc-app': { prerender: true },
    '/guides': { prerender: true },
    '/guides/**': { prerender: true },
    '/contact/**': { prerender: true },
    '/privacy-policy': { prerender: true },
    '/terms-and-conditions': { prerender: true },
    '/cs/**': { prerender: true },
    '/sk/**': { prerender: true },
    // Catalog pages regenerate on Vercel at most hourly: new exercises appear
    // without a redeploy, and a build never has to prerender the whole catalog.
    '/exercises': { isr: 3600 },
    '/exercises/**': { isr: 3600 },
    '/machines': { isr: 3600 },
    '/machines/**': { isr: 3600 },
    '/muscles': { isr: 3600 },
    '/muscles/**': { isr: 3600 },
    '/api/catalog/**': {
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
    '/get': {
      headers: {
        'x-robots-tag': 'noindex, nofollow',
        'cache-control': 'no-store',
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      exclude: ['../tests/**'],
    },
  },
})
