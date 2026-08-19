import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-romanian-deadlift-rdl',
  metaDescription: 'Barbell Romanian deadlift: hip hinge, range of motion, and how to log RDLs separately from conventional deadlifts in LIFTAG.',
  steps: [
    'Unrack or pick the bar up, stand tall, and unlock the knees slightly. They stay that way.',
    'Push the hips back. The bar stays on the thighs, then the shins. Spine stays long.',
    'Stop when the hamstrings run out of range — usually mid-shin — not when the plates hit the floor.',
    'Drive the hips forward to stand. This is a hinge, not a shrug.',
  ],
  mistakes: [
    { title: 'Bending the knees into a deadlift', body: 'If the knees travel forward, you are squatting the bar down. Push the hips, not the knees.' },
    { title: 'Touching the floor every rep', body: 'That is a stiff-leg deadlift from the floor, not an RDL. Range is hamstring-limited.' },
    { title: 'Logging RDLs as conventional deadlifts', body: 'Different start, different PR. Keep this slug.' },
  ],
  variations: [
    { slug: 'dumbbell-romanian-deadlift', name: 'Dumbbell Romanian deadlift', note: 'Easier to learn, travel-friendly.' },
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Floor start, more load.' },
    { slug: 'barbell-good-morning', name: 'Barbell good morning', note: 'Bar on the back, even more hinge.' },
  ],
  progressions: ['Hip hinge with a dowel.', 'Light RDLs to mid-shin.', 'Add load when the back angle stays constant.'],
  programming: 'Primary hamstring hinge: 3–4 sets of 5–10. It will be much lighter than your conventional deadlift. If LIFTAG shows them on the same chart, you logged the wrong lift.',
  relatedSlugs: ['conventional-deadlift', 'dumbbell-romanian-deadlift', 'machine-lying-leg-curl'],
} satisfies ExerciseOverlay
