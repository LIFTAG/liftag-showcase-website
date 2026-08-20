import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'split-squat',
  metaDescription: 'Split squat: stance length, knee track, and how to log in-place lunges separately from walking lunges and Bulgarians in LIFTAG.',
  steps: [
    'Take a split stance: front foot flat, rear foot on the ball. Hips square. This footwork does not change during the set.',
    'Brace and lower mostly straight down. Front shin stays roughly vertical; rear knee travels toward the floor.',
    'Drive through the front foot to stand. Keep the torso stacked — a slight lean is fine, a twist is not.',
    'Finish the set, then switch legs. Do not turn it into a walking lunge between reps.',
  ],
  mistakes: [
    { title: 'Stance too short', body: 'The front heel lifts and the knee shoots forward. Lengthen until you can sit between the feet without teetering.' },
    { title: 'Elevating the rear foot and calling it this lift', body: 'That is a Bulgarian split squat. Different range, different slug.' },
    { title: 'Shuffling the feet every rep', body: 'If you are stepping, you are lunging. Plant, squat, stand. The feet stay where you put them.' },
    { title: 'Logging both legs as a walking lunge', body: 'In-place split squat, walking lunge, and Bulgarian are three PRs. Keep this one honest in LIFTAG.' },
  ],
  variations: [
    { slug: 'dumbbell-bulgarian-split-squat', name: 'Dumbbell Bulgarian split squat', note: 'Rear foot elevated, more range, harder on the hip flexor of the back leg.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Stepping version. Use it when you want gait, not a planted stance.' },
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Loaded lunge, usually stepping or reverse, not a frozen split.' },
    { slug: 'smith-machine-split-squat', name: 'Smith machine split squat', note: 'Fixed bar when balance, not the legs, is the limiter.' },
  ],
  progressions: [
    'Bodyweight split squat to a consistent back-knee depth.',
    'Goblet or dumbbell load once the stance no longer wobbles.',
    'Pause in the hole when you start bouncing the rear knee.',
    'Rear-foot elevated (Bulgarian) when you want more range on the front leg.',
  ],
  programming: 'Accessory: 3–4 sets of 6–12 per leg after the main squat. Log each side. Rest between legs if the second side always folds. Bodyweight is a valid load — do not skip the row just because the hands are empty.',
  equipmentAlternatives: [
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Keep single-leg work when you would rather step than plant.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Need a lane, not a bench. Still a split-stance pattern.' },
    { slug: 'barbell-lunge', name: 'Barbell lunge', note: 'Bar on the back when the dumbbells are not heavy enough.' },
  ],
  faqs: [
    {
      question: 'Split squat or lunge?',
      answer: 'Split squat keeps the feet planted for the whole set. A lunge steps. If you reset the feet every rep, log the lunge you actually did — walking, reverse, or barbell — not this slug.',
    },
  ],
  relatedSlugs: [
    'dumbbell-bulgarian-split-squat',
    'barbell-bulgarian-split-squat',
    'walking-lunge',
    'dumbbell-lunge',
    'barbell-lunge',
  ],
} satisfies ExerciseOverlay
