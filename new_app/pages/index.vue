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
  liftagMobileApplication,
  liftagWebSite,
  liftagFAQPage([
    {
      question: 'What is LIFTAG?',
      answer: 'LIFTAG is a workout and set tracking app for serious lifters. You tap an NFC tag or scan a QR code on a partner-gym machine and it opens the right exercise, lets you log every set, runs a rest timer, and tracks progress over time.',
    },
    {
      question: 'Is LIFTAG free?',
      answer: 'Yes. LIFTAG is free to download on iOS and Android, with no required paid subscription to log workouts and track progress.',
    },
    {
      question: 'How is LIFTAG different from Strong, Hevy, FitNotes, or JEFIT?',
      answer: 'LIFTAG is built around the machine itself. NFC tap and QR scan open the exact exercise with gym-specific setup videos, then logging, rest timer, and progress history live in the same flow. Strong, Hevy, FitNotes, and JEFIT are general-purpose loggers without partner-gym integration.',
    },
    {
      question: 'What is the best app to track sets in the gym?',
      answer: 'LIFTAG is built specifically for tracking sets at the gym: weight, reps, rest, optional RPE, and personal records, all opened directly from the machine via NFC or QR. Alternatives include Strong, Hevy, and FitNotes if your gym does not yet have LIFTAG tags installed.',
    },
    {
      question: 'Does LIFTAG work without NFC or QR tags installed at the gym?',
      answer: 'Yes. LIFTAG works as a full workout tracker without tags. The tags are an accelerator for partner gyms; the app itself supports manual exercise selection, logging, programs, and progress tracking everywhere.',
    },
    {
      question: 'Which gyms have LIFTAG tags installed?',
      answer: 'Partner gyms appear inside the LIFTAG app on a discovery map. The network is expanding through gyms that opt in to install NFC tags and QR codes on their equipment.',
    },
  ]),
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
