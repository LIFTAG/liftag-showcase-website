<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'

const description = 'Tap NFC tags or scan QR codes on gym machines with LIFTAG. Open exercise setup videos, log sets, run rest timers, and track workout progress from one app.'

useLiftagSeo({
  title: 'LIFTAG | NFC and QR Workout Tracking for Gyms',
  description,
  path: '/',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  {
    '@type': 'WebSite',
    '@id': 'https://liftag.fit/#website',
    name: 'LIFTAG',
    url: 'https://liftag.fit/',
    description,
    publisher: {
      '@id': 'https://liftag.fit/#organization',
    },
  },
])

useReveal()
</script>

<template>
  <div>
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
    <LazyFinalCta />
    <LazySiteFooter />
  </div>
</template>
