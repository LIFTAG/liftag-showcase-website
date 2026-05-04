<script setup lang="ts">
const title = 'Workout tracking for <span class="lime">lifters.</span>'
const description = 'LIFTAG lets lifters tap NFC tags or scan QR codes on gym machines to open the right exercise, log sets, run rest timers, and track progress over time.'

useLiftagSeo({
  title: 'Workout Tracking App for Lifters | LIFTAG',
  description,
  path: '/for-lifters',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'For Lifters', path: '/for-lifters' },
  ]),
])

const metrics = [
  { value: 'NFC', label: 'tap machine tags' },
  { value: 'QR', label: 'scan machine codes' },
  { value: 'PR', label: 'progress history' },
]

const sections = [
  {
    title: 'Open the right exercise instantly',
    body: 'Tap the NFC tag or scan the QR code on a partner gym machine. LIFTAG opens the exact exercise, setup notes, variations, and trainer video without browsing through menus.',
  },
  {
    title: 'Log every set without friction',
    body: 'Track weight, reps, rest time, and optional RPE in a few taps. Every set is timestamped and stored so serious training no longer depends on notes apps or memory.',
  },
  {
    title: 'See progress compound',
    body: 'Follow volume trends, personal records, estimated 1RM, body-part splits, streaks, and workout history across weeks and months.',
  },
]

const faqs = [
  {
    question: 'Does LIFTAG replace a workout notes app?',
    answer: 'Yes. LIFTAG is built to replace scattered notes, spreadsheets, and generic logging apps with a gym-aware workout tracker that opens the right exercise from the machine itself.',
  },
  {
    question: 'Can lifters use QR codes and NFC tags?',
    answer: 'Yes. Partner gyms can use both NFC tags and QR stickers so lifters can tap or scan depending on their phone and the machine setup.',
  },
]
</script>

<template>
  <SeoLandingPage
    eyebrow="FOR LIFTERS"
    :title="title"
    :lead="description"
    :metrics="metrics"
    :sections="sections"
    :faqs="faqs"
    cta-label="See lifter flow"
    cta-href="/#lifters"
  />
</template>
