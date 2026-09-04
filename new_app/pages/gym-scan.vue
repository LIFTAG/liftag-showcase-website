<template>
  <div class="gym-scan-page">
    <div class="film-grain" aria-hidden="true" />
    <SplashCursor :visible="cursorOn" />
    <SiteNav deferred :visible="navIn" />
    <main>
      <h1 class="gym-scan-page__title">LIFTAG Pivot Leg Press machine intelligence</h1>
      <GymScanHero @handoff="onHandoff" @cursor-visible="onCursorVisible" />
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

// Full-bleed opening: the nav is mounted but held off until the film has
// handed the frame to the landing hero, so the room still starts as a dark
// gym rather than as a page with a menu on it. The splash cursor is the same
// one `/` uses; it stays invisible through the film and arms at the cut.
definePageMeta({ layout: false })

const navIn = ref(false)
const cursorOn = ref(false)

function onHandoff(active: boolean) {
  navIn.value = active
}

function onCursorVisible(active: boolean) {
  cursorOn.value = active
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
.gym-scan-page__title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
html:has(.gym-scan-page) {
  background: #000;
}
</style>
