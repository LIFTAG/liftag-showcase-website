<script setup lang="ts">
const title = 'NFC and QR tags for <span class="lime">gym machines.</span>'
const description = 'LIFTAG helps gyms attach NFC tags and QR codes to machines so members can open exercise instructions, setup videos, and tracking flows directly from the equipment.'

useLiftagSeo({
  title: 'NFC and QR Gym Machine Tags | LIFTAG for Gyms',
  description,
  path: '/for-gyms',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'For Gyms', path: '/for-gyms' },
  ]),
  liftagFAQPage([
    {
      question: 'Can LIFTAG work across multiple gym locations?',
      answer: 'Yes. LIFTAG is designed for a shared equipment catalog that can be deployed across multiple locations, with machines and staff managed from one place.',
    },
    {
      question: 'Do gyms need NFC or QR codes?',
      answer: 'LIFTAG supports both. NFC creates a fast tap experience, while QR codes keep the same flow accessible on more phones and surfaces.',
    },
  ]),
])

const metrics = [
  { value: '1→12', label: 'multi-location rollout' },
  { value: 'NFC', label: 'tap to open' },
  { value: 'QR', label: 'scan backup' },
]

const sections = [
  {
    title: 'Turn every machine into an entry point',
    body: 'Add a LIFTAG NFC tag or QR sticker to each machine. Members land on the correct movement, machine setup, variations, and logging screen without searching.',
  },
  {
    title: 'Use your own trainer videos',
    body: 'Gyms can connect machine-specific instruction videos filmed by their own trainers, on their own equipment, so members get guidance that matches the actual floor.',
  },
  {
    title: 'Manage locations from one dashboard',
    body: 'Keep machines, locations, staff access, and rollout status organized from a central dashboard instead of rebuilding the same catalog for every gym.',
  },
]

const faqs = [
  {
    question: 'Can LIFTAG work across multiple gym locations?',
    answer: 'Yes. LIFTAG is designed for a shared equipment catalog that can be deployed across multiple locations, with machines and staff managed from one place.',
  },
  {
    question: 'Do gyms need NFC or QR codes?',
    answer: 'LIFTAG supports both. NFC creates a fast tap experience, while QR codes keep the same flow accessible on more phones and surfaces.',
  },
]
</script>

<template>
  <SeoLandingPage
    eyebrow="FOR GYM OWNERS"
    :title="title"
    :lead="description"
    :metrics="metrics"
    :sections="sections"
    :faqs="faqs"
    cta-label="See gym flow"
    cta-href="/#gyms"
  />
</template>
