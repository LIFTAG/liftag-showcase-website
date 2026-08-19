import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'sumo-deadlift',
  metaDescription: 'Sumo deadlift: stance, start position, and how to log it as its own pull in LIFTAG instead of mixing it with conventional.',
  steps: [
    'Take a wide stance so the arms hang inside the knees. Toes out enough that the knees track the feet.',
    'Sit into the hips, set the back, and pull the slack. The bar should already be against the shins.',
    'Push the floor apart and finish tall. Do not scoop the hips through with a soft back.',
  ],
  mistakes: [
    { title: 'A “sumo” stance that is barely wider than conventional', body: 'If the arms are still outside the knees, it is not sumo. Widen or switch lifts.' },
    { title: 'Logging sumo PRs on conventional', body: 'Different stance, different PR. Keep this slug.' },
  ],
  variations: [
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Narrower stance, more back.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Neutral handles if sumo hips are cranky.' },
  ],
  progressions: ['Wide-stance kettlebell deadlift.', 'Sumo from the floor with a reset every rep.', 'Add load when the start stays in the hips, not the low back.'],
  programming: 'Pick conventional or sumo as the competition-style pull and keep the other as accessory. Mixing them week to week makes LIFTAG’s 1RM look like noise.',
  relatedSlugs: ['conventional-deadlift', 'trap-bar-deadlift', 'barbell-romanian-deadlift-rdl'],
} satisfies ExerciseOverlay
