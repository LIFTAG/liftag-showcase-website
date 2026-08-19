import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'incline-dumbbell-press',
  metaDescription: 'Incline dumbbell press: bench angle, range of motion, and how to log upper-chest dumbbell work in LIFTAG.',
  steps: [
    'Set a low-to-moderate incline. Kick the bells into position the same way as a flat dumbbell press.',
    'Start over the upper chest. Lower until the handles are beside the upper pecs, not by the ears.',
    'Press up and slightly in. Keep the low back from turning the incline into a flat bench.',
  ],
  mistakes: [
    { title: 'Steep incline plus huge bells', body: 'The front delts take over and the kick-up gets dangerous. Drop the angle or the load.' },
    { title: 'Letting the wrists collapse', body: 'Stack knuckles to the ceiling. A broken wrist at the bottom is how this lift dies.' },
  ],
  variations: [
    { slug: 'barbell-incline-bench-press', name: 'Barbell incline bench press', note: 'More load, less range.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'The same pattern at 0°.' },
    { slug: 'incline-dumbbell-fly', name: 'Incline dumbbell fly', note: 'Isolation at the same angle.' },
  ],
  progressions: [
    'Light incline presses you can kick up without a spotter.',
    'Add a pause at the bottom before you add load.',
  ],
  programming: 'Pair this with a flat press or a fly, not with another steep incline. 3–4 sets of 8–12. Note the bench hole number if the gym’s inclines are not labeled.',
  relatedSlugs: ['barbell-incline-bench-press', 'flat-dumbbell-bench-press', 'incline-dumbbell-fly'],
} satisfies ExerciseOverlay
