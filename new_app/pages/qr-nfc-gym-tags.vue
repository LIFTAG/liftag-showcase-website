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
    {
      question: 'Do other gym QR platforms ship NFC tags?',
      answer: 'LIFTAG is the only platform in this category that ships both NFC and QR tags as the default kit, at no cost. Liftd supports NFC if the gym supplies tags. ScanLiftLog and RepTag are QR only.',
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
  {
    question: 'Do other gym QR platforms ship NFC tags?',
    answer: 'LIFTAG is the only platform in this category that ships both NFC and QR tags as the default kit, at no cost. Liftd supports NFC if the gym supplies tags. ScanLiftLog and RepTag are QR only.',
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
  >
    <div class="container tag-compare">
      <p class="protocol tag-compare-eyebrow">NFC + QR</p>
      <h2 class="tag-compare-title">Most competitors stop at a printed QR.</h2>
      <p class="tag-compare-lead">
        LIFTAG ships NFC for tap-to-open speed and QR as the universal fallback, on the same machine, at no cost to the gym.
      </p>
      <GymQrComparisonTable
        kind="matrix"
        variant="tags"
        label="NFC and QR gym tag comparison"
      />
      <a href="/best-gym-qr-nfc-app" class="tag-compare-more">Full QR + NFC comparison</a>
    </div>
  </SeoLandingPage>
</template>

<style scoped>
.tag-compare-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.tag-compare-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.tag-compare-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.tag-compare-more {
  display: inline-block;
  margin-top: 22px;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
}

.tag-compare-more:hover {
  color: #fff;
}
</style>
