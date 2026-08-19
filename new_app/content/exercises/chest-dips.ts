import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chest-dips',
  metaDescription: 'Chest dips: torso lean, depth, and how to log weighted or bodyweight dips separately from triceps dips in LIFTAG.',
  steps: [
    'Take the bars, lock out, and lean the torso slightly forward. Toes can drift behind you.',
    'Lower until the shoulders are at or just below the elbows, only as deep as the shoulders allow.',
    'Press back up without shrugging into the neck. Stop shy of a slam at the top.',
  ],
  mistakes: [
    { title: 'Upright “triceps” dips logged as chest dips', body: 'Upright dips belong on the triceps-dip slug. Lean if this is a chest movement.' },
    { title: 'Dumping into the bottom', body: 'Depth without control is a shoulder problem, not hypertrophy.' },
  ],
  variations: [
    { slug: 'assisted-dip', name: 'Assisted dip', note: 'Use the machine until full-range bodyweight is clean.' },
    { slug: 'parallel-bar-triceps-dip', name: 'Parallel bar triceps dip', note: 'More upright, more triceps.' },
    { slug: 'bench-triceps-dip', name: 'Bench triceps dip', note: 'Home-gym fallback.' },
  ],
  progressions: [
    'Assisted dips or feet-on-the-floor partials.',
    'Full-range bodyweight sets of 6–10.',
    'Add a dip belt when extra sets are easy. Log the extra weight in LIFTAG.',
  ],
  programming: 'Treat weighted dips like a press: 3–4 hard sets. If you add a belt, log the plate, not just “bodyweight,” or the PR chart never moves.',
  relatedSlugs: ['push-up', 'barbell-bench-press', 'parallel-bar-triceps-dip'],
} satisfies ExerciseOverlay
