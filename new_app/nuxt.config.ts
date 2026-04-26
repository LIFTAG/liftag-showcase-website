// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-26',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'LIFTAG — For Lifters / By Lifters',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { name: 'description', content: 'Scan any machine. Track every set. Watch your numbers compound.' },
      ],
      link: [
        { rel: 'icon', href: '/logo.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,300;0,400;0,500;0,700;1,700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700;800&display=swap',
        },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
