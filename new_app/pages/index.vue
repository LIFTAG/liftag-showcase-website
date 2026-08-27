<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'
import { homeFaqs } from '~/utils/homeFaqs'

// Keep these two in sync with app.head in nuxt.config.ts, which carries the
// same pair as the pre-hydration fallback.
const description = 'LIFTAG is a free workout tracker and logger for iOS and Android. Tap NFC or scan QR on gym machines to log sets, run rest timers, and track PRs. Works without tags.'

useLiftagSeo({
  title: 'LIFTAG | Free Workout Tracker and Logger',
  description,
  path: '/',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebSite,
  liftagWebPage({
    path: '/',
    name: 'LIFTAG workout tracker',
    description,
    aboutId: APP_ID,
  }),
  liftagFAQPage(homeFaqs),
])

useReveal()

// The hero phone screenshot is the LCP element on every viewport. Split the
// preload by viewport so a 390px run fetches 360w (~22KB) and desktop fetches
// 560w, and neither layout preloads the other's candidate.
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      type: 'image/webp',
      href: '/assets/screens/hero-dashboard-360.webp',
      imagesrcset: '/assets/screens/hero-dashboard-360.webp 360w, /assets/screens/hero-dashboard-560.webp 560w, /assets/screens/hero-dashboard-640.webp 640w',
      imagesizes: '(max-width: 768px) min(46vw, 180px), 280px',
      media: '(max-width: 768px)',
      fetchpriority: 'high',
    },
    {
      rel: 'preload',
      as: 'image',
      type: 'image/webp',
      href: '/assets/screens/hero-dashboard-560.webp',
      media: '(min-width: 769px)',
      fetchpriority: 'high',
    },
  ],
})

</script>

<template>
  <div>
    <div class="film-grain" aria-hidden="true" />
    <SplashCursor />
    <Hero />
    <LazyPartnerMarquee :hydrate-on-visible="{ rootMargin: '200px' }" />
    <!-- 200px is enough to hydrate before a section is on screen, and small
         enough that a 700px Lighthouse viewport does not pull HowItWorks /
         Dashboard JS into the TBT window. -->
    <LazyScanSection :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyHowItWorks :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyLiftersSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyProgressSection :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyAppMergeSection :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyGymsSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    <!-- DashboardSection runs both dashboard acts: the gym MacBook punches in,
         hands the screen over to the coach dashboard, then un-zooms into the
         coach story that TrainersSection picks up. Keep these three adjacent. -->
    <LazyDashboardSection :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyTrainersSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyRoadmap class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyHomeFaq class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    <LazyFinalCta class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
  </div>
</template>
