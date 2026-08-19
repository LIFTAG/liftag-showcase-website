import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'trap-bar-deadlift',
  metaDescription: 'Trap bar deadlift: high vs low handles, start position, and how to log hex-bar pulls in LIFTAG without mixing them into conventional.',
  steps: [
    'Step into the hex, mid-foot under the handles. High handles first if you are new to the lift.',
    'Grab even, set the back, and think “leg press the floor” as much as “pull.”',
    'Stand tall. The finish is a quiet lockout, not a shrug.',
    'Lower with the same hinge you used to start. Do not drop the plates from lockout in a busy gym.',
  ],
  mistakes: [
    { title: 'Treating high-handle and low-handle as the same PR', body: 'Low handles are a different lift. Note the handle in LIFTAG or you will “lose” 20 kg overnight.' },
    { title: 'Turning it into a squat with a rounded back', body: 'The trap bar lets you sit more than conventional. It does not let you dump the lumbar.' },
  ],
  variations: [
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Straight bar, harder start for most lifters.' },
    { slug: 'trap-bar-romanian-deadlift', name: 'Trap bar Romanian deadlift', note: 'Hinge pattern with the same bar.' },
  ],
  progressions: ['High-handle trap bar.', 'Low-handle once the start is clean.', 'Deficit or jumps only after the basic pull is boring.'],
  programming: 'Excellent main pull for athletes and for lifters whose conventional back complains. Log handle height. 3–5 sets of 3–6 on heavy days, higher reps if it is a volume hinge.',
  relatedSlugs: ['conventional-deadlift', 'trap-bar-romanian-deadlift', 'barbell-back-squat'],
} satisfies ExerciseOverlay
