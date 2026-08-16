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
    { rel: 'preload', as: 'image', href: '/assets/screens/hero-dashboard-560.webp', fetchpriority: 'high' },
  ],
})

// three.js lives in an async chunk (nothing imports it statically) so it no
// longer competes with the LCP image and fonts. Warm it once the page is idle
// so the hero particles and 3D phones still appear on their usual schedule.
// Warming through a consumer component (not `import('three')` directly) keeps
// the unused parts of three tree-shaken out of the chunk.
onNuxtReady(() => {
  // Phones never mount the hero particle field (see Hero.vue), so warming its
  // chunk there would only cost bandwidth.
  if (!window.matchMedia('(max-width: 768px)').matches) {
    import('~/components/HeroParticles.vue').catch(() => {})
  }
  import('~/components/Phone3D.vue').catch(() => {})
})
</script>

<template>
  <div>
    <FilmGrain />
    <SiteNav />
    <Hero />
    <PartnerMarquee />
    <!-- hydrate-on-visible defers each section's JS until the reader nears it.
         The 800px margin exceeds every internal activation threshold (Phone.vue's
         800px preload observer, the 600px 3D init observers, useReveal's 12%
         visibility trigger), so hydration always completes before anything
         visible fires. -->
    <LazyScanSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyQrPortalSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyHowItWorks :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyLiftersSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyProgressSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyAppMergeSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyGymsSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <!-- DashboardSection runs both dashboard acts: the gym MacBook punches in,
         hands the screen over to the coach dashboard, then un-zooms into the
         coach story that TrainersSection picks up. Keep these three adjacent. -->
    <LazyDashboardSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyTrainersSection :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazyRoadmap :hydrate-on-visible="{ rootMargin: '800px' }" />
    <HomeFaq />
    <LazyFinalCta :hydrate-on-visible="{ rootMargin: '800px' }" />
    <LazySiteFooter :hydrate-on-visible="{ rootMargin: '800px' }" />
  </div>
</template>
