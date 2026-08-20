import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-shrug',
  metaDescription: 'Dumbbell shrug: straight-up elevation, a pause at the top, and trap work that is not a rolled upright row in LIFTAG.',
  steps: [
    'Stand with the dumbbells at your sides, arms long, chest up, neck long. A tiny forward lean is optional; a fold at the waist is a row.',
    'Elevate the shoulders straight toward the ears. Do not roll. Pause until the traps are actually doing something, not just bouncing.',
    'Lower until the traps stretch and the bells hang. That lengthened position is the start of the next rep, not a rest with bent elbows.',
    'Grip hard or strap up once the hands die. If you have to bend the elbows to move the weight, it is too heavy or it is no longer a shrug.',
  ],
  mistakes: [
    { title: 'Rolling the shoulders', body: 'Forward-circle shrugs are theater and a reliable way to irritate the AC joint. Up, pause, down. Traps elevate; they do not orbit.' },
    { title: 'Turning it into an upright row', body: 'Elbows bent and bells traveling up the ribs is a different lift. Log barbell upright row if that is what you did. Shrugs keep the arms long.' },
    { title: 'Crane-neck at the top', body: 'The head stays tall. Reaching the chin forward to “feel it more” just loads the neck. Shoulders to ears, not ears to shoulders.' },
    { title: 'Bouncing 50s for triples', body: 'Shrugs reward time under tension more than a fake 1RM. If the bells are moving and the traps are not pausing, drop the load.' },
  ],
  variations: [
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'More delt, still upper trap, only if the shoulder likes the path.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Heavy lockouts load the traps as a compound, not as a shrug substitute.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Heavy lockouts on a trap bar hit upper traps; actual shrugs still belong on this slug.' },
  ],
  progressions: [
    'Light dumbbells, two-second pause, full stretch at the bottom.',
    'Add load when the pause is still there and the elbows stay straight.',
    'Straps once grip is the limiter and traps are the target — note “straps” so the chart is honest.',
    'Slow lowers if you run out of heavy bells before you run out of quality reps.',
  ],
  programming: 'Shrugs are accessory work: three to four sets of 8–15 after a pull or a press. Log the dumbbell weight, not the pair total. A LIFTAG PR here only matters if the pause stayed in; bouncing a heavier pair is not a trap PR. Rest just long enough that the next set is not a grip contest unless that is the point.',
  equipmentAlternatives: [
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'If you only have a bar and the shoulders allow it. Different pattern — log it as the row.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Use the trap bar for heavy pulls. Shrug it only if the movement is actually a shrug, and still log this lift.' },
  ],
  faqs: [
    {
      question: 'Should I roll my shoulders at the top?',
      answer: 'No. Elevate and lower. Rolling does not add a secret trap fiber; it just grinds the shoulder girdle. If you want more work, pause longer or add a slow lower.',
    },
  ],
  relatedSlugs: [
    'barbell-upright-row',
    'standing-barbell-overhead-press',
    'trap-bar-deadlift',
    'conventional-deadlift',
  ],
} satisfies ExerciseOverlay
