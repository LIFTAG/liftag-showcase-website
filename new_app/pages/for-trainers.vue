<script setup lang="ts">
const title = 'Client progress tracking for <span class="lime">trainers.</span>'
const description = 'LIFTAG gives trainers a profile, discovery surface, shared plans, and client workout progress tracking tied to real set history.'

useLiftagSeo({
  title: 'Trainer Client Progress Tracking | LIFTAG',
  description,
  path: '/for-trainers',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'For Trainers', path: '/for-trainers' },
  ]),
])

const metrics = [
  { value: 'PLAN', label: 'share workouts' },
  { value: 'PRs', label: 'client progress' },
  { value: 'BIO', label: 'trainer profile' },
]

const sections = [
  {
    title: 'Track clients from real set history',
    body: 'Instead of chasing screenshots and vague updates, trainers can review workout history, progress signals, PRs, and consistency from the same system clients use to train.',
  },
  {
    title: 'Share plans where clients log',
    body: 'Build and share workout plans inside the product flow so clients can move from plan to machine to logged set without switching tools.',
  },
  {
    title: 'Be discoverable inside the gym network',
    body: 'LIFTAG gives trainers a profile and discovery surface connected to the gyms, lifters, and training context where coaching decisions happen.',
  },
]

const faqs = [
  {
    question: 'Is LIFTAG only a trainer directory?',
    answer: 'No. The trainer surface is part of a broader coaching platform: profile, discovery, plan sharing, and client progress tracking live together.',
  },
  {
    question: 'Can trainers see workout progress over time?',
    answer: 'Yes. LIFTAG is built around set history, volume, PRs, estimated 1RM, and other progress signals that matter for coaching.',
  },
]
</script>

<template>
  <SeoLandingPage
    eyebrow="FOR TRAINERS"
    :title="title"
    :lead="description"
    :metrics="metrics"
    :sections="sections"
    :faqs="faqs"
    cta-label="See trainer flow"
    cta-href="/#trainers"
  />
</template>
