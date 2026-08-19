import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-hack-squat',
  metaDescription: 'Machine hack squat: back pad, depth, and how to log sled squats in LIFTAG separately from leg press and free squats.',
  steps: [
    'Get the shoulders under the pads, feet forward enough that the knees track over mid-foot at the bottom.',
    'Unrack, descend until the hips are at least as deep as a squat you would count in the rack.',
    'Drive up without the low back peeling off the pad. Re-rack with the hands, not a hope.',
  ],
  mistakes: [
    { title: 'Feet so far forward it becomes a glute press', body: 'Fine if that is the point. If you wanted a squat, bring the feet back.' },
    { title: 'Logging hack squat as back squat', body: 'Different groove, different PR. Keep this slug.' },
  ],
  variations: [
    { slug: 'reverse-hack-squat', name: 'Reverse hack squat', note: 'Facing in, more posterior chain on some machines.' },
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Seated sled instead of a standing one.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'The free-weight version.' },
  ],
  progressions: ['Light hack squats to depth.', 'Add load when the pad contact never breaks.', 'Pause reps if you bounce.'],
  programming: 'Use as a primary squat when the barbell back is fried, or as the second squat of the week. 3–4 sets of 6–12. The tag on the sled should open this exercise, not “squat.”',
  relatedSlugs: ['standard-leg-press', 'barbell-back-squat', 'smith-machine-squat'],
} satisfies ExerciseOverlay
