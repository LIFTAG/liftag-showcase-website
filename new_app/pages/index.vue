<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'

useReveal()
</script>

<template>
  <div>
    <SiteNav />
    <Hero />
    <PartnerMarquee />
    <ScanSection />
    <HowItWorks />
    <LiftersSection />
    <ProgressSection />
    <TrainersSection />
    <GymsSection />
    <Roadmap />
    <FinalCta />
    <SiteFooter />
  </div>
</template>
