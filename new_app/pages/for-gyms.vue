<script setup lang="ts">
const title = 'NFC and QR tags for <span class="lime">gym machines.</span>'
const description = 'LIFTAG gives gyms free NFC and QR tags, listing, machine setup, and a core dashboard. Advanced business tools are optional.'

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
    {
      question: 'What does LIFTAG cost for gyms?',
      answer: 'Tags, listing, machine setup, and the core dashboard are free forever. Advanced business tools are optional.',
    },
    {
      question: 'How does LIFTAG compare to Liftd, ScanLiftLog, or RepTag?',
      answer: 'LIFTAG is the only one of those four that ships NFC and QR tags and keeps core gym tools free. Liftd leads on paid owner-side churn analytics. ScanLiftLog is the no-app option. RepTag is strongest for DACH studios that want trainer chat and a digital floor plan. The full table is on the QR and NFC comparison page.',
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
    body: 'Keep machines, locations, staff access, and rollout status organized from a central dashboard. The core dashboard is free forever; advanced business tools are optional.',
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
  {
    question: 'What does LIFTAG cost for gyms?',
    answer: 'Tags, listing, machine setup, and the core dashboard are free forever. Advanced business tools are optional.',
  },
  {
    question: 'How does LIFTAG compare to Liftd, ScanLiftLog, or RepTag?',
    answer: 'LIFTAG is the only one of those four that ships NFC and QR tags and keeps core gym tools free. Liftd leads on paid owner-side churn analytics. ScanLiftLog is the no-app option. RepTag is strongest for DACH studios that want trainer chat and a digital floor plan. The full table is on the QR and NFC comparison page.',
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
  >
    <div class="container gym-compare">
      <p class="protocol gym-compare-eyebrow">THE DECIDER</p>
      <h2 class="gym-compare-title">The only free core in the category.</h2>
      <p class="gym-compare-lead">
        Liftd, ScanLiftLog, and RepTag all charge the gym a monthly platform fee. LIFTAG ships NFC and QR tags and keeps listing, machine setup, and the core dashboard free.
      </p>
      <GymQrComparisonTable
        kind="matrix"
        variant="gym"
        label="Gym cost and tag comparison"
      />
      <a href="/best-gym-qr-nfc-app" class="gym-compare-more">Full QR + NFC comparison</a>
    </div>
  </SeoLandingPage>
</template>

<style scoped>
.gym-compare-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.gym-compare-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.gym-compare-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.gym-compare-more {
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

.gym-compare-more:hover {
  color: #fff;
}
</style>
