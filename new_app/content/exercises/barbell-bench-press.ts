import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bench-press',
  metaDescription: 'Barbell bench press: setup, common mistakes, variations, and how to log every set in LIFTAG. Chest, triceps, and shoulders on a flat bench.',
  steps: [
    'Lie on a flat bench with eyes under the bar, feet planted, and head, upper back, and glutes supported.',
    'Take an even closed grip, retract and depress the shoulder blades, and unrack with a spotter when the load is heavy.',
    'Lower the bar under control toward the mid-to-lower chest with wrists stacked over forearms. Touch without bouncing.',
    'Press upward and slightly back to a stable lockout. Reset the shoulder blades before the next rep.',
    'Set rack safeties, use collars, and pick a grip width that keeps the shoulders comfortable.',
  ],
  mistakes: [
    { title: 'Bouncing off the chest', body: 'A bounce hides the bottom of the press and dumps stress into the shoulders. Pause or at least stay in control on the touch.' },
    { title: 'Flaring the elbows to 90°', body: 'Tuck slightly so the forearms stay vertical at the bottom. Wide elbows plus a high touch is a common impingement setup.' },
    { title: 'Losing the upper-back shelf', body: 'If the scapulae drift forward, the bar path lengthens and the shoulders take the load. Reset between reps if you have to.' },
    { title: 'Logging the warm-ups as work sets', body: 'LIFTAG PRs and estimated 1RM read your logged sets. Keep ramp-up triples out of the work-set row unless the program counts them.' },
  ],
  variations: [
    { slug: 'barbell-incline-bench-press', name: 'Barbell incline bench press', note: 'Same pattern, more clavicular pec and front delt.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'Narrower grip, more triceps, still a press you can load.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'Independent handles, longer range, easier on some shoulders.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'Fixed path when you want pressing volume without a spotter.' },
  ],
  progressions: [
    'Push-up or machine chest press until you can control a full range.',
    'Empty-bar bench with a pause at the chest.',
    'Working sets at a repeatable RPE 7–8, adding load or a rep when all sets stay clean.',
    'Paused or close-grip variants when the lockout or the touch-and-go pattern stalls.',
  ],
  programming: 'Most lifters do well with 3–5 work sets of 3–8 on a primary bench day. Log every working set in LIFTAG with rest time; the rest timer is the difference between a real heavy triple and a rushed one. Chase a rep PR before you chase a load PR if the bar speed is dying. Estimated 1RM in the app is a trend, not a meet attempt.',
  equipmentAlternatives: [
    { slug: 'smith-machine-flat-bench-press', name: 'Smith machine flat bench press', note: 'Use when the gym has no free bench or you are training alone.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'Swap here if the barbell bothers the shoulders but you still want pressing volume.' },
    { slug: 'push-up', name: 'Push-up', note: 'No bench, no problem. Log it as a separate lift so the progression stays honest.' },
  ],
  faqs: [
    {
      question: 'Is barbell bench press the best chest exercise?',
      answer: 'It is the most loadable horizontal press for most lifters, not a required chest exercise. If your shoulders hate the barbell, dumbbell or machine presses plus flyes still build a chest. LIFTAG will track whichever press you actually do.',
    },
    {
      question: 'How should I log paused bench versus touch-and-go?',
      answer: 'Treat them as the same lift if you only pause occasionally. If paused bench is the programmed variation, keep using barbell bench press and put “pause” in the set note so next week’s you knows what last week actually was.',
    },
  ],
  relatedSlugs: [
    'barbell-incline-bench-press',
    'close-grip-bench-press',
    'flat-dumbbell-bench-press',
    'machine-chest-press',
    'push-up',
  ],
} satisfies ExerciseOverlay
