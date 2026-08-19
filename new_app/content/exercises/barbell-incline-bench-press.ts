import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-incline-bench-press',
  metaDescription: 'Barbell incline bench press: bench angle, setup, mistakes, and how to log upper-chest pressing separately from flat bench in LIFTAG.',
  steps: [
    'Set the bench between 15° and 45°. Higher than that is mostly a front-delt press.',
    'Unrack with the same tucked, retracted setup as flat bench. Eyes stay under the bar.',
    'Lower to the upper chest / clavicle line, not the same touch point as flat bench.',
    'Press up and slightly back to lockout. Do not let the elbows dump behind the bench.',
  ],
  mistakes: [
    { title: 'Using a 60° “incline”', body: 'That is an overhead press with a backrest. Drop the bench if the goal is chest.' },
    { title: 'Logging incline PRs on the flat-bench lift', body: 'Keep this slug. Mixing angles wrecks both charts.' },
    { title: 'Flaring so the bar lands on the neck', body: 'Touch the upper chest. If the bar is at your throat, the elbows are too high.' },
  ],
  variations: [
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'More range, independent arms.' },
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'The flat version of the same pattern.' },
    { slug: 'smith-machine-incline-press', name: 'Smith machine incline press', note: 'Fixed path when you are training alone.' },
  ],
  progressions: [
    'Incline dumbbell press until the angle feels natural.',
    'Empty-bar incline with a pause on the upper chest.',
    'Add load when all work sets stay at the same bench angle.',
  ],
  programming: 'Use incline as a primary press on a second chest day or as the first accessory after flat bench. 3–4 sets of 5–10. Log the bench angle in a note if your gym has more than one incline.',
  equipmentAlternatives: [
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'Default swap when the barbell bothers the shoulders.' },
    { slug: 'low-to-high-cable-fly', name: 'Low-to-high cable fly', note: 'Isolation volume for the same line of pull.' },
  ],
  relatedSlugs: ['barbell-bench-press', 'incline-dumbbell-press', 'machine-incline-chest-press'],
} satisfies ExerciseOverlay
