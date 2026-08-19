import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-front-squat',
  metaDescription: 'Barbell front squat: rack position, elbow height, and how to log it separately from back squat in LIFTAG.',
  steps: [
    'Rack the bar on the front delts. Clean grip or crossed-arm — pick the one you can keep the elbows up with.',
    'Walk out, brace, and sit between the legs with an upright torso.',
    'Hit a repeatable depth, then stand without the elbows collapsing and dumping the bar.',
  ],
  mistakes: [
    { title: 'Elbows dropping in the hole', body: 'The bar rolls and the set is over. Upper-back work and a slightly narrower grip usually fix this faster than “try harder.”' },
    { title: 'Turning it into a back squat with a front rack', body: 'If you are folding forward, drop the load. Front squat is an upright pattern.' },
  ],
  variations: [
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'More load, more posterior chain.' },
    { slug: 'dumbbell-goblet-squat', name: 'Dumbbell goblet squat', note: 'Teaching version of the same torso angle.' },
  ],
  progressions: ['Goblet squat.', 'Empty-bar front squat holds in the rack.', 'Working sets once the rack position is boring.'],
  programming: 'Great second squat day or Olympic-lifting main squat. Loads will sit well below back squat — that is expected. Do not chase back-squat numbers on this slug.',
  relatedSlugs: ['barbell-back-squat', 'dumbbell-goblet-squat', 'barbell-zercher-squat'],
} satisfies ExerciseOverlay
