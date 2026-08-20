import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-bulgarian-split-squat',
  metaDescription: 'Dumbbell Bulgarian split squat: rear-foot height, front-shin angle, and how to log each leg in LIFTAG without mixing split squats.',
  steps: [
    'Stand a long stride in front of a knee-height bench. Rest the rear laces on the pad — not a jammed toe on a high box.',
    'Hold dumbbells at the sides. The front foot is far enough forward that the shin stays roughly vertical at the bottom.',
    'Drop the back knee toward the floor. Front knee tracks over mid-foot; a slight torso lean is fine, a collapse is not.',
    'Drive through the front heel and mid-foot to stand. Finish the set on one leg, then switch — do not alternate every rep.',
    'Keep the rear hip from twisting open. If the front heel pops, the stance is too short.',
  ],
  mistakes: [
    { title: 'Rear foot too high', body: 'A box above the knee turns this into a hip-flexor stretch with dumbbells. Start at knee height or lower.' },
    { title: 'Front foot too close', body: 'The heel lifts, the knee shoots past the toes, and the back hip dumps. Lengthen the stride until the front shin can stay quiet.' },
    { title: 'Bouncing the back knee off the floor', body: 'The hard part is the bottom. Touch the floor or hover — do not use it as a trampoline.' },
    { title: 'Logging it as a split squat or a lunge', body: 'Elevated rear foot is a different range and a different PR. Keep this slug, and log each leg.' },
  ],
  variations: [
    { slug: 'split-squat', name: 'Split squat', note: 'Same pattern, rear foot on the floor. Learn the stance here first.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Stepping version when you want gait and extra range.' },
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'In-place or stepping, still two dumbbells, no bench.' },
    { slug: 'smith-machine-split-squat', name: 'Smith machine split squat', note: 'Fixed bar when the dumbbells are not the limiter — balance is.' },
  ],
  progressions: [
    'Split squat with bodyweight until the stance is boring.',
    'Bodyweight Bulgarian to a consistent back-knee depth.',
    'Dumbbells. Add load when both legs hit the same depth for all work sets.',
    'Pause in the hole, or a slightly lower rear pad, when the quads stall.',
  ],
  programming: 'Accessory after the main squat: 3–4 sets of 6–12 per leg. Rest between legs if the second side always falls apart. Log each leg in LIFTAG — a left/right split is the point, not a combined “24 reps.” If you skip the bench, switch to split squat so next month’s chart is still true.',
  equipmentAlternatives: [
    { slug: 'split-squat', name: 'Split squat', note: 'No bench. Same single-leg pattern with less stretch.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Keep the split-stance work when every bench in the gym is a preacher curl.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Bilateral quad volume if a rear-foot issue is the limiter.' },
  ],
  faqs: [
    {
      question: 'Should I lean forward or stay upright?',
      answer: 'A slight forward lean loads the glute and hip more; a stacked torso hits more quad. Pick one and repeat it. Changing lean every week is a new exercise you are not logging.',
    },
    {
      question: 'Do I log both legs as one set?',
      answer: 'Log each leg. If LIFTAG only has one row, put the weaker leg in the load/reps and note the stronger side. Chasing a PR off the easy leg is how imbalances hide.',
    },
  ],
  relatedSlugs: [
    'split-squat',
    'walking-lunge',
    'dumbbell-lunge',
    'barbell-back-squat',
  ],
} satisfies ExerciseOverlay
