<script setup lang="ts">
const description = 'Guides from LIFTAG on tracking workouts, powerlifting apps, and QR/NFC gym machine tags. Written for serious lifters, trainers, and gyms.'

useLiftagSeo({
  title: 'LIFTAG Guides | Workout Tracking, Powerlifting, QR + NFC',
  description,
  path: '/guides',
})

const guides = [
  {
    href: '/guides/how-to-track-workouts',
    eyebrow: 'LIFTING',
    title: 'How to track workouts properly',
    body: 'What to log, what to ignore, how to read progress, and which workout tracking app actually helps.',
  },
  {
    href: '/guides/best-workout-app-for-powerlifting',
    eyebrow: 'POWERLIFTING',
    title: 'Best workout app for powerlifting',
    body: 'Set tracking, % of 1RM programming, and PR history compared across LIFTAG, Strong, Boostcamp, and Hevy.',
  },
  {
    href: '/guides/qr-nfc-gym-tracking',
    eyebrow: 'GYM TECH',
    title: 'QR and NFC gym tracking',
    body: 'How tap-and-scan machine tags change logging, and which apps actually support the flow.',
  },
  {
    href: '/best-workout-tracking-app',
    eyebrow: 'COMPARISON',
    title: 'Best workout tracking app',
    body: 'An honest head-to-head of LIFTAG against Strong, Hevy, FitNotes, JEFIT, Boostcamp, MacroFactor, and Fitbod.',
  },
  {
    href: '/best-gym-qr-nfc-app',
    eyebrow: 'COMPARISON',
    title: 'Best gym QR and NFC app',
    body: 'LIFTAG versus Liftd, ScanLiftLog, and RepTag: free tags, gym cost, NFC, and who actually wins each row.',
  },
  {
    href: '/guides/best-workout-logger',
    eyebrow: 'COMPARISON',
    title: 'Best workout logger',
    body: 'Logger vs tracker vs paper logbook. Which apps actually write the set down in 2026: LIFTAG, Strong, Hevy, FitNotes.',
  },
  {
    href: '/guides/best-free-workout-tracker',
    eyebrow: 'COMPARISON',
    title: 'Best free workout tracker',
    body: 'What you actually get without paying on LIFTAG, Strong, Hevy, and FitNotes — and where each free tier stops.',
  },
  {
    href: '/alternatives/hevy',
    eyebrow: 'COMPARISON',
    title: 'LIFTAG vs Hevy',
    body: 'Hevy features and pricing in 2026, quoted from its own store listing, next to a tracker with no free-tier caps and no paid tier.',
  },
  {
    href: '/vs/strong',
    eyebrow: 'COMPARISON',
    title: 'LIFTAG vs Strong',
    body: 'Strong caps the free tier at three routines and sells PRO. Where that matters, where it does not, and where Strong still wins.',
  },
  {
    href: '/pricing',
    eyebrow: 'PRICING',
    title: 'LIFTAG pricing',
    body: 'A dated fact sheet: what is free forever, what has no published price, and what a partner gym pays. No invented numbers.',
  },
  {
    href: '/guides/strong-vs-hevy-vs-liftag',
    eyebrow: 'COMPARISON',
    title: 'Strong vs Hevy vs LIFTAG',
    body: 'The comparison people type: logging speed, free tiers, social features, and gym machine tags.',
  },
  {
    href: '/guides/workout-logger',
    eyebrow: 'COMPARISON',
    title: 'Workout logger vs tracker',
    body: 'What a workout logger actually is, how it differs from a tracker and a paper logbook, and which app — or notebook — to pick.',
  },
  {
    href: '/guides/nfc-tags-for-gym-equipment',
    eyebrow: 'GYM TECH',
    title: 'NFC tags for gym equipment',
    body: 'What to put on each machine, where to stick it, and why a dual NFC + QR plate beats QR alone.',
  },
  {
    href: '/guides/what-is-rpe-lifting',
    eyebrow: 'LIFTING',
    title: 'What is RPE in lifting',
    body: 'How to rate a set, when to log RPE in a workout tracker, and how it pairs with rest time and load.',
  },
  {
    href: '/guides/progressive-overload',
    eyebrow: 'LIFTING',
    title: 'Progressive overload',
    body: 'How to add load, reps, or sets without lying to the log — and how a tracker makes the next jump obvious.',
  },
  {
    href: '/guides/gym-nfc-rollout',
    eyebrow: 'GYMS',
    title: 'Gym NFC tag rollout',
    body: 'How a club tags a floor, then 12 locations, without a fake case-study quote. The actual LIFTAG rollout.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Guides', path: '/guides' },
  ]),
  {
    '@type': 'CollectionPage',
    '@id': 'https://liftag.fit/guides#page',
    name: 'LIFTAG Guides',
    url: 'https://liftag.fit/guides',
    description,
    isPartOf: { '@id': 'https://liftag.fit/#website' },
    hasPart: guides.map(guide => ({
      '@type': 'WebPage',
      name: guide.title,
      url: `https://liftag.fit${guide.href}`,
      description: guide.body,
    })),
  },
])
</script>

<template>
  <div class="guides-hub">
    <main>
      <header class="guides-hero container">
        <p class="protocol guides-eyebrow">GUIDES · LIFTAG</p>
        <h1 class="display guides-title">Lift with a <span class="lime">record.</span></h1>
        <p class="guides-lead">{{ description }}</p>
      </header>

      <section class="container guides-grid" aria-label="LIFTAG guides">
        <article
          v-for="guide in guides"
          :key="guide.href"
          class="guides-card"
        >
          <p class="protocol guides-card-eyebrow">{{ guide.eyebrow }}</p>
          <h2>{{ guide.title }}</h2>
          <p>{{ guide.body }}</p>
          <a :href="guide.href" class="guides-card-link">Read the guide</a>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.guides-hub {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.11), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.045), transparent 36%),
    #000;
  color: #fff;
}

.guides-hero {
  padding: 150px 0 48px;
}

.guides-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.guides-title {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(52px, 8vw, 112px);
  line-height: 0.92;
}

.guides-lead {
  max-width: 52ch;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 0 96px;
}

.guides-card {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 280px;
  padding: 28px 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(11, 18, 21, 0.72);
}

.guides-card-eyebrow {
  color: var(--liftag-primary);
  margin: 0;
}

.guides-card h2 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(26px, 3vw, 36px);
  font-style: italic;
  line-height: 1;
  text-transform: uppercase;
}

.guides-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
}

.guides-card-link {
  margin-top: auto;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
}

.guides-card-link:hover {
  color: #fff;
}

@media (max-width: 900px) {
  .guides-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }

  .guides-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .guides-hero {
    padding: 108px 0 36px;
  }

  .guides-card {
    min-height: 0;
  }
}
</style>
