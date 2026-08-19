import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'flat-dumbbell-bench-press',
  metaDescription: 'Flat dumbbell bench press: how to kick the bells up, control the bottom, and log dumbbell pressing separately from the barbell in LIFTAG.',
  steps: [
    'Sit with the dumbbells on your thighs, then lie back and kick them into the start position over the chest.',
    'Set the same retracted upper back as a barbell bench. Palms face forward or slightly in.',
    'Lower until the handles are about chest level and the elbows are just below the bench, not to a painful dump.',
    'Press up and in so the bells finish over the chest, not over the face. Soft lockout if your elbows hate a slam.',
  ],
  mistakes: [
    { title: 'Crashing the last three inches', body: 'The extra range is the point. Control the bottom or use a smaller drop.' },
    { title: 'Banging the bells together at the top', body: 'That is a metronome, not a lockout. Finish over the chest without a clap.' },
    { title: 'Logging left and right as two exercises', body: 'One lift. If one side fails first, note it. Do not split the progression.' },
  ],
  variations: [
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'Upper chest and more front delt.' },
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'More load, less range.' },
    { slug: 'dumbbell-floor-press', name: 'Dumbbell floor press', note: 'Shorter range when the shoulder hates the stretch.' },
  ],
  progressions: [
    'Push-ups, then light dumbbells you can kick up safely.',
    'Full-range sets of 8–12 before you chase heavy triples.',
    'Add load when both sides finish the set together.',
  ],
  programming: 'Dumbbell bench is a better hypertrophy press than a 1RM test. 3–4 sets of 6–12. Log the actual dumbbell weight, not the pair total, and stay consistent week to week so LIFTAG’s chart means something.',
  relatedSlugs: ['barbell-bench-press', 'incline-dumbbell-press', 'flat-bench-dumbbell-fly'],
} satisfies ExerciseOverlay
