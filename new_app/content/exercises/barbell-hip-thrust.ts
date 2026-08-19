import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-hip-thrust',
  metaDescription: 'Barbell hip thrust: bench setup, lockout, and how to log glute thrusts in LIFTAG without mixing them into glute bridges.',
  steps: [
    'Set the upper back on a bench. Bar over the hips with a pad. Shins near vertical at the top.',
    'Brace, then drive through the heels until the hips are fully open and the ribs stay down.',
    'Lower under control. Do not bounce the plates off the floor unless you like noisy, half-range sets.',
  ],
  mistakes: [
    { title: 'Overextending the lumbar at lockout', body: 'The glutes finish the lift. If the low back takes over, drop the ribcage and the load.' },
    { title: 'Bench too high or too low', body: 'Upper back on the bench, not the neck. A bad bench height makes every rep a fight.' },
  ],
  variations: [
    { slug: 'machine-hip-thrust', name: 'Machine hip thrust', note: 'Same pattern, easier setup.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Floor version, shorter range.' },
    { slug: 'smith-machine-hip-thrust', name: 'Smith machine hip thrust', note: 'When there is no free barbell pad station.' },
  ],
  progressions: ['Glute bridge.', 'Bodyweight hip thrust on a bench.', 'Barbell once the lockout is a squeeze, not a heave.'],
  programming: 'Main glute lift: 3–4 sets of 6–12. Log the plate load. If you use a hip thrust machine on other days, that is a different slug so the chart stays clean.',
  relatedSlugs: ['machine-hip-thrust', 'glute-bridge', 'barbell-back-squat'],
} satisfies ExerciseOverlay
