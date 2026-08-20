import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'smith-machine-flat-bench-press',
  metaDescription: 'Smith machine flat bench press: bar path, safety stops, and how to log a rail press separately from free barbell bench in LIFTAG.',
  steps: [
    'Centre a flat bench so the bar meets mid-to-lower chest, not the neck. Set safeties just below the touch.',
    'Lie with eyes slightly in front of the bar, feet planted, scapulae set. Unhook with a wrist twist.',
    'Lower under control to the chest. The rail will not let you press back toward the rack the way a free bar does — own that path.',
    'Press to a stable lockout and re-hook deliberately. Do not bounce off the chest or the safeties.',
  ],
  mistakes: [
    { title: 'Bench too far forward', body: 'If the bar lands on the neck, slide the bench until the touch is mid-chest. The rail will not forgive a bad setup.' },
    { title: 'Logging it as barbell bench press', body: 'No balance, no backward press. Different groove, different PR. Keep this slug.' },
    { title: 'No safeties because the hooks are “there”', body: 'The hooks are for unracking. The stops are for missing. Set them.' },
    { title: 'Flaring 90° because the rail feels guided', body: 'Tuck slightly so the forearms stay stacked. A fixed path is not a reason to dump the shoulders.' },
  ],
  variations: [
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'Free bar. The lift most people mean when they say bench.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'Independent handles, longer range, often kinder to the shoulders.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'Seated or reclined machine when you want pressing volume without a rail.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'Narrower free-bar press if the triceps are the target.' },
  ],
  progressions: [
    'Push-up or machine chest press until a full range is honest.',
    'Light Smith with a pause on the chest and safeties set.',
    'Working sets at RPE 7–8. Add load when the touch point never wanders.',
    'Free-bar bench once you want a walk-out press, not a heavier rail.',
  ],
  programming: 'Pressing volume when you are alone or the free bench is taken: 3–5 sets of 5–10. A Smith PR is not a barbell bench PR. If LIFTAG estimated 1RM jumps because you moved from free bar to rail, you mixed the slugs.',
  equipmentAlternatives: [
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'Default when a free bench and a spotter exist.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'Fixed path, no rail, still a press you can do without a spot.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'Swap here if the Smith line of pull bothers the shoulders.' },
  ],
  faqs: [
    {
      question: 'Will Smith bench transfer to free bench?',
      answer: 'The pressing pattern is similar. The stabilizer demand is not. Use Smith for volume or solo training, then keep free-bar work on its own chart if that is the lift you care about.',
    },
  ],
  relatedSlugs: [
    'barbell-bench-press',
    'flat-dumbbell-bench-press',
    'machine-chest-press',
    'close-grip-bench-press',
  ],
} satisfies ExerciseOverlay
