<script setup lang="ts">
const title = 'NFC and QR gym tags that open the <span class="lime">right exercise.</span>'
const description = 'LIFTAG combines NFC tags and QR codes for gym machines so lifters can tap or scan equipment to open setup videos, exercise details, and workout tracking.'

useLiftagSeo({
  title: 'NFC and QR Gym Tags for Exercise Machines | LIFTAG',
  description,
  path: '/qr-nfc-gym-tags',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'NFC and QR Gym Tags', path: '/qr-nfc-gym-tags' },
  ]),
  liftagFAQPage([
    {
      question: 'What should a gym put on each machine?',
      answer: 'A combined NFC tag and QR sticker is the strongest setup: NFC for tap-to-open speed, QR for universal scan access, and both pointing to the same machine-specific Liftag flow.',
    },
    {
      question: 'Do NFC and QR tags help with member onboarding?',
      answer: 'Yes. Tags reduce uncertainty at the machine by opening the correct exercise setup, variations, and gym-filmed instruction video directly from the equipment.',
    },
  ]),
])

const metrics = [
  { value: 'TAP', label: 'nfc tag' },
  { value: 'SCAN', label: 'qr code' },
  { value: 'LOG', label: 'set tracking' },
]

const sections = [
  {
    title: 'NFC for the fastest interaction',
    body: 'NFC tags let lifters tap the machine and immediately open the relevant Liftag flow. It feels native, fast, and clear for repeat gym use.',
  },
  {
    title: 'QR codes as a universal fallback',
    body: 'QR stickers keep the same machine-sync experience available across devices, lighting conditions, and member habits. Gyms can use both on the same machine.',
  },
  {
    title: 'Content and tracking in one destination',
    body: 'The tag does more than open a web page. It connects the machine to exercise instructions, trainer videos, logging, rest timing, and long-term workout history.',
  },
]

const faqs = [
  {
    question: 'What should a gym put on each machine?',
    answer: 'A combined NFC tag and QR sticker is the strongest setup: NFC for tap-to-open speed, QR for universal scan access, and both pointing to the same machine-specific Liftag flow.',
  },
  {
    question: 'Do NFC and QR tags help with member onboarding?',
    answer: 'Yes. Tags reduce uncertainty at the machine by opening the correct exercise setup, variations, and gym-filmed instruction video directly from the equipment.',
  },
]
</script>

<template>
  <SeoLandingPage
    eyebrow="MACHINE SYNC"
    :title="title"
    :lead="description"
    :metrics="metrics"
    :sections="sections"
    :faqs="faqs"
    cta-label="See scan flow"
    cta-href="/#scan"
  />
</template>
