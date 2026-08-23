// https://nuxt.com/docs/api/configuration/nuxt-config

const DEFERRED_CHUNK = /(?:^|\/)(?:ScanSection|HowItWorks|LiftersSection|ProgressSection|AppMergeSection|GymsSection|DashboardSection|TrainersSection|Roadmap|FinalCta|SiteFooter|HomeFaq|FaqAccordion|PartnerMarquee|Phone3D|Macbook3D|HeroParticles|HeroDesktop|HeroMobile|HeroCharts|NfcTag3D|ForgedPrPlate|HologramPlate|MergeParticles|MergePrismCore|MergePrismaticBurst|MergeBurstHalo|RoadmapParticles|TapTokenCore)(?:\.vue)?(?:-|\.|$)/

function isThreeManifestEntry(key: string, entry: { name?: string, file?: string }) {
  return entry.name === 'three' || key.includes('node_modules/three') || Boolean(entry.file?.includes('three'))
}

function isDeferredManifestEntry(key: string, entry: { name?: string, file?: string }) {
  return DEFERRED_CHUNK.test(key) || DEFERRED_CHUNK.test(entry.name ?? '') || DEFERRED_CHUNK.test(entry.file ?? '')
}

const LONG_CACHE = 'public, max-age=31536000, stale-while-revalidate=86400'

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
      ],
    },
  },
  // Keep SSR CSS inlined. Extracting below-fold files made 15 render-blocking
  // stylesheets and dropped mobile FCP from 2.8s to 5.9s in lab.
  features: {
    inlineStyles: true,
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
    // All three.js consumers are async components behind viewport observers.
    // Without this hook Nuxt still emits <link rel="modulepreload"> for the
    // library and for every chunk that statically imports it (Phone3D,
    // Macbook3D, macbookScreen, particles). The hashed three file is not named
    // "three-*.js", so match on entry.name and on the static-import closure.
    //
    // Lazy homepage sections have the same problem: hydrate-on-visible still
    // lists them as the page's dynamic imports, so Nuxt modulepreloads (fetch
    // + compile) ~400KB of JS during load. Drop preload and prefetch on those
    // entries so Lighthouse's idle window does not parse them into TBT.
    'build:manifest': (manifest) => {
      const threeKeys = new Set<string>()
      for (const [key, entry] of Object.entries(manifest)) {
        if (isThreeManifestEntry(key, entry)) {
          threeKeys.add(key)
          entry.preload = false
          entry.prefetch = false
        } else if (isDeferredManifestEntry(key, entry)) {
          entry.preload = false
          entry.prefetch = false
        }
      }
      let grew = true
      while (grew) {
        grew = false
        for (const [key, entry] of Object.entries(manifest)) {
          if (threeKeys.has(key)) continue
          const staticImports = entry.imports ?? []
          if (!staticImports.some(id => threeKeys.has(id))) continue
          threeKeys.add(key)
          entry.preload = false
          entry.prefetch = false
          grew = true
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
    '/about': { prerender: true },
    '/press': { prerender: true },
    '/contact/**': { prerender: true },
    '/privacy-policy': { prerender: true },
    '/terms-and-conditions': { prerender: true },
    '/cs/**': { prerender: true },
    '/sk/**': { prerender: true },
    // More specific than `/sk/**` so 434 SK exercises are not prerendered at
    // build. Legal pages under /sk/privacy-policy still prerender.
    '/sk/exercises': { isr: 3600 },
    '/sk/exercises/**': { isr: 3600 },
    // Catalog pages regenerate on Vercel at most hourly: new exercises appear
    // without a redeploy, and a build never has to prerender the whole catalog.
    '/exercises': { isr: 3600 },
    '/exercises/**': { isr: 3600 },
    '/machines': { isr: 3600 },
    '/machines/**': { isr: 3600 },
    '/muscles': { isr: 3600 },
    '/muscles/**': { isr: 3600 },
    // Index and marketing URLs are static. Catalog sitemaps stay ISR so a
    // Search Console fetch never waits on a cold catalog aggregation.
    '/sitemap.xml': { prerender: true },
    '/sitemap-pages.xml': { prerender: true },
    '/sitemap-catalog.xml': { isr: 3600 },
    '/sitemap-images.xml': { isr: 3600 },
    '/sitemap-videos.xml': { isr: 3600 },
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
    '/assets/**': { headers: { 'cache-control': LONG_CACHE } },
    '/uploads/**': { headers: { 'cache-control': LONG_CACHE } },
    '/logo.png': { headers: { 'cache-control': LONG_CACHE } },
    '/logo.svg': { headers: { 'cache-control': LONG_CACHE } },
    '/logo_silhouette.svg': { headers: { 'cache-control': LONG_CACHE } },
    '/logo-apple-touch.png': { headers: { 'cache-control': LONG_CACHE } },
    '/og-image.jpg': { headers: { 'cache-control': LONG_CACHE } },
  },
  nitro: {
    prerender: {
      // Not linked from HTML, so the crawler would skip them without this list.
      routes: ['/sitemap.xml', '/sitemap-pages.xml'],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      exclude: ['../tests/**'],
      compilerOptions: {
        // node --test loads these utils via ESM and needs .ts specifiers.
        allowImportingTsExtensions: true,
      },
    },
  },
})
