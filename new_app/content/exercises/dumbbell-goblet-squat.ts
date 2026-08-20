import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-goblet-squat',
  metaDescription: 'Dumbbell goblet squat: front-loaded setup, depth, and a teaching squat that still deserves a logged progression.',
  steps: [
    'Hold one dumbbell vertically against the chest — hands under the top plate or hugging the bell. Elbows in. Stand in a stance your knees can track.',
    'Brace, then sit between the legs. Hips and knees together. Whole foot planted. The bell stays glued to the chest, not drifting forward.',
    'Go to a depth you can repeat without the pelvis tucking hard or the heels peeling up. Elbows can track inside the knees.',
    'Push the floor away and stand tall. Re-set the breath before the next rep. This is a squat, not a bounce out of a ball.',
  ],
  mistakes: [
    { title: 'Letting the bell pull the chest down', body: 'If the upper back rounds, the squat turned into a poorly loaded good morning. Elbows in, ribs down, or a lighter bell.' },
    { title: 'Chasing depth until the pelvis tucks', body: 'A sharp butt-wink is not extra hypertrophy. Sit as low as you can own, then stop.' },
    { title: 'Skipping the log because it is a “warm-up”', body: 'If it is in the session, it is in LIFTAG. Goblet work is still volume, and it is how most lifters earn a barbell squat.' },
    { title: 'Heels up, knees shooting forward with no control', body: 'The front load is a counterbalance so you can stay on the whole foot. Use it. Raise the heels only if that is a deliberate, noted variant.' },
  ],
  variations: [
    { slug: 'bodyweight-squat', name: 'Bodyweight squat', note: 'No load. Earn the pattern first.' },
    { slug: 'barbell-front-squat', name: 'Barbell front squat', note: 'Same upright torso, now a bar in the rack.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'The main squat this is teaching.' },
    { slug: 'landmine-squat', name: 'Landmine squat', note: 'Front-loaded squat when the dumbbells top out.' },
  ],
  progressions: [
    'Bodyweight squat to a consistent depth, or to a box.',
    'Goblet squat with a pause in the hole.',
    'Heavier bells in sets of 8–15. Add load when every rep hits the same depth.',
    'Front squat or back squat once the goblet is limited by how heavy a dumbbell you can hold, not by the legs.',
  ],
  programming: 'Teaching squat, high-rep finisher, or travel main squat: 3–4 sets of 8–15. It will never match your back-squat load. Do not chase that. When the heaviest dumbbell in the gym is easy for 12, move the progression to barbell-front-squat and keep this as a warm-up.',
  relatedSlugs: [
    'barbell-front-squat',
    'barbell-back-squat',
    'bodyweight-squat',
    'dumbbell-lunge',
  ],
} satisfies ExerciseOverlay
