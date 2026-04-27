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
    <AppMergeSection />
    <LiftersSection />
    <ProgressSection />
    <TrainersSection />
    <GymsSection />
    <DashboardSection />
    <Roadmap />
    <FinalCta />
    <SiteFooter />
  </div>
</template>
