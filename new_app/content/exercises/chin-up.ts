import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chin-up',
  metaDescription: 'Chin-up: underhand grip, full hang, and how to log chin-ups separately from pull-ups in LIFTAG.',
  steps: [
    'Hang underhand, hands about shoulder width. Start from a still hang.',
    'Pull until the chin is clearly over the bar and the elbows are down by the ribs.',
    'Lower to a full hang. Do not skip the bottom just because the biceps are on fire.',
  ],
  mistakes: [
    { title: 'Logging chin-ups as pull-ups', body: 'Underhand vs overhand is a different lift and a different PR. Keep this slug.' },
    { title: 'Half hangs', body: 'The lengthened biceps and lats are the work. Take the hang.' },
  ],
  variations: [
    { slug: 'pull-up', name: 'Pull-up', note: 'Overhand counterpart.' },
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Machine when you cannot yet chin-up.' },
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Direct biceps if the chin-up is limited by grip or lats.' },
  ],
  progressions: ['Assisted chin-ups or underhand pulldowns.', 'Strict chin-ups.', 'Weighted chin-ups logged with the extra load.'],
  programming: 'Use as the main vertical pull or as the biceps-biased pair to pull-ups. Do not smash both heavy on the same day unless recovery is actually there — LIFTAG’s frequency chart will tell you if you keep stacking them.',
  relatedSlugs: ['pull-up', 'lat-pulldown', 'barbell-curl'],
} satisfies ExerciseOverlay
