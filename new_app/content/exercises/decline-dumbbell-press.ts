import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'decline-dumbbell-press',
  metaDescription: 'Decline dumbbell press: leg lock, bottom position, and how to log lower-chest dumbbell work separately from flat press in LIFTAG.',
  steps: [
    'Hook the legs under the pads before you lie back. A modest decline is enough — steep boards send blood to the head and the bells toward the face.',
    'Get the dumbbells to the start with a thigh kick or a handoff. Start beside the lower chest, palms forward or slightly in.',
    'Lower until the handles are about lower-chest level and the elbows are just below the torso, not a painful dump toward the floor.',
    'Press up and slightly in so the bells finish over the lower chest. Soft lockout if the elbows hate a slam.',
    'Sit up by bringing the bells to the thighs. Getting out is part of the lift — do not dump 30 kg past your face.',
  ],
  mistakes: [
    { title: 'Skipping the leg lock', body: 'On a decline, unhooked legs are how the bells and the lifter leave the bench together. Secure first, then press.' },
    { title: 'Using a steep “decline” that is almost inverted', body: 'You wanted lower chest, not a circus act. One or two notches below flat is plenty for most benches.' },
    { title: 'Logging decline PRs on flat dumbbell bench', body: 'Shorter range, different groove. Keep this slug or both charts become fiction.' },
    { title: 'Crashing the last three inches', body: 'Decline already lengthens the bottom. Control it or you will feel it in the front of the shoulder, not the pec.' },
  ],
  variations: [
    { slug: 'barbell-decline-bench-press', name: 'Barbell decline bench press', note: 'More load, less range, still needs the leg lock.' },
    { slug: 'machine-decline-chest-press', name: 'Machine decline chest press', note: 'Fixed path when you do not want to kick bells on a decline.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'The same pattern at 0°. Start here if decline setup feels sketchy.' },
    { slug: 'decline-dumbbell-fly', name: 'Decline dumbbell fly', note: 'Isolation at the same angle after the press.' },
  ],
  progressions: [
    'Own flat dumbbell bench with a controlled bottom.',
    'Modest-decline presses you can kick up and sit up without a spotter.',
    'Pause an inch off the chest before you chase heavier bells.',
    'Add load only when both sides finish the set together.',
  ],
  programming: 'Hypertrophy press, not a 1RM test. 3–4 sets of 8–12. Pair with an incline or a fly, not with decline barbell on the same day unless your elbows asked for it. Log the actual dumbbell weight, not the pair total, and stay consistent so the chart means something.',
  equipmentAlternatives: [
    { slug: 'machine-decline-chest-press', name: 'Machine decline chest press', note: 'Use when the decline bench has no way to kick the bells up safely.' },
    { slug: 'decline-push-up', name: 'Decline push-up', note: 'Feet-elevated press when there are no dumbbells.' },
  ],
  faqs: [
    {
      question: 'Do I need decline work for lower chest?',
      answer: 'No. Flat pressing and dips already hit the sternal pec. Decline is a useful second angle, not a required one. If the setup feels worse than the pump, skip it — LIFTAG will track the press you actually do.',
    },
  ],
  relatedSlugs: [
    'barbell-decline-bench-press',
    'machine-decline-chest-press',
    'flat-dumbbell-bench-press',
    'chest-dips',
  ],
} satisfies ExerciseOverlay
