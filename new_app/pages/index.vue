<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'
import { homeFaqs } from '~/utils/homeFaqs'

const description = 'Tap NFC tags or scan QR codes on gym machines with LIFTAG. Open exercise setup videos, log sets, run rest timers, and track workout progress from one app.'

useLiftagSeo({
  title: 'LIFTAG | NFC and QR Workout Tracking for Gyms',
  description,
  path: '/',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagWebSite,
  liftagFAQPage(homeFaqs),
])

useReveal()

// The hero phone screenshot is the LCP element on every viewport; without a
// preload it queues behind the font preloads and ~30 lazy <img> tags.
useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/assets/screens/home-hero-no-qr-560.webp', fetchpriority: 'high' },
  ],
})
</script>

<template>
  <div>
    <FilmGrain />
    <SiteNav />
    <Hero />
    <PartnerMarquee />
    <LazyScanSection />
    <LazyHowItWorks />
    <LazyLiftersSection />
    <LazyProgressSection />
    <LazyAppMergeSection />
    <LazyTrainersSection />
    <LazyGymsSection />
    <LazyDashboardSection />
    <LazyRoadmap />
    <HomeFaq />
    <LazyFinalCta />
    <LazySiteFooter />
  </div>
</template>
