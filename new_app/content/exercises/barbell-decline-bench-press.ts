import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-decline-bench-press',
  metaDescription: 'Barbell decline bench press: bench angle, touch point, and how to log decline pressing separately from flat bench in LIFTAG.',
  steps: [
    'Hook the legs and set a modest decline, often 15–30°. Eyes slightly behind the racked bar. A spotter still matters.',
    'Take an even grip, set the upper back, and unrack. Lower to the lower chest / sternum line, not the same touch as flat bench.',
    'Press to a stable lockout. Wrists stacked. Do not let the bar drift toward the face — decline already wants to dump it that way.',
    'Re-rack with control. If getting the bar in and out of the hooks feels sketchy, you need a spotter or a different press.',
  ],
  mistakes: [
    { title: 'Extreme decline that is mostly a dip with a bar', body: 'Steep boards shift the work off the chest and make unracking worse. Flatten the bench if the goal is still a press.' },
    { title: 'Logging decline PRs on flat bench', body: 'Shorter range, different angle. Keep this slug or both charts lie.' },
    { title: 'Unracking without a spot', body: 'A decline bench can pin you in a hole you cannot dump the bar from. Collars, safeties if the station has them, and a human who is actually watching.' },
    { title: 'Bouncing off the lower chest', body: 'The bar already travels a shorter path. A bounce just hides the bottom. Pause or stay in control on the touch.' },
  ],
  variations: [
    { slug: 'decline-dumbbell-press', name: 'Decline dumbbell press', note: 'Independent handles, easier to dump if a rep dies, same angle.' },
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'Flat version. The default horizontal press.' },
    { slug: 'machine-decline-chest-press', name: 'Machine decline chest press', note: 'Fixed path when you want decline volume without a bar over the face.' },
    { slug: 'chest-dips', name: 'Chest dips', note: 'Decline-like line of pull, no bench, loadable with a belt.' },
  ],
  progressions: [
    'Decline dumbbell press until the angle and the leg hooks feel natural.',
    'Empty-bar decline with a pause on the lower chest.',
    'Working sets at the same bench angle. Add load when the touch point stays put.',
    'Dips or close-grip bench when the lockout is the stall, not the touch.',
  ],
  programming: 'Second chest day or accessory after flat: 3–4 sets of 5–10. Log the angle in a note if the gym has more than one decline. Do not chase flat-bench numbers here — the range is shorter and the groove is different.',
  equipmentAlternatives: [
    { slug: 'decline-dumbbell-press', name: 'Decline dumbbell press', note: 'Default swap when the barbell station is awkward to unrack.' },
    { slug: 'chest-dips', name: 'Chest dips', note: 'No decline bench. Still a lower-chest-biased press if you lean.' },
    { slug: 'machine-decline-chest-press', name: 'Machine decline chest press', note: 'Solo training without a bar over the face.' },
  ],
  faqs: [
    {
      question: 'Do I need decline bench for lower chest?',
      answer: 'No. Flat bench, dips, and flyes cover most lifters. Decline is a shorter-range press some people like. Use it if the station is good and the shoulders agree — then log it here, not as flat bench.',
    },
  ],
  relatedSlugs: [
    'decline-dumbbell-press',
    'barbell-bench-press',
    'machine-decline-chest-press',
    'chest-dips',
  ],
} satisfies ExerciseOverlay
