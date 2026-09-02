<template>
  <div class="gym-scan-page">
    <div class="film-grain" aria-hidden="true" />
    <SiteNav deferred :visible="navIn" />
    <main>
      <GymScanHero @handoff="onHandoff" />
      <LazyPartnerMarquee :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyScanSection :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyHowItWorks :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyLiftersSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyProgressSection :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyAppMergeSection :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyGymsSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyDashboardSection :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyTrainersSection class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyRoadmap class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyHomeFaq class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
      <LazyFinalCta class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
    </main>
    <LazySiteFooter class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
  </div>
</template>

<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'

// Full-bleed opening: nav is mounted but held off until the 3D act hands
// the frame to the landing hero, so the room still starts as a dark gym.
definePageMeta({ layout: false })

const navIn = ref(false)

function onHandoff(active: boolean) {
  navIn.value = active
}

useReveal()

// Prototype route for the new 3D hero. Kept off the live landing page so the
// two can be compared side by side; noindex until it is promoted.
useHead({
  title: 'LIFTAG // Machine Intelligence',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'theme-color', content: '#000000' },
  ],
})
</script>

<style>
.gym-scan-page {
  background: #000;
  color: #fff;
}
html:has(.gym-scan-page) {
  background: #000;
}
</style>
