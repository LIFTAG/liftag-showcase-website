import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'bodyweight-squat',
  metaDescription: 'Bodyweight squat: stance, depth, and how to log unweighted squats in LIFTAG before you load a bar or goblet.',
  steps: [
    'Stand in a stance you can repeat, toes out only as far as the knees can follow. Whole foot on the floor.',
    'Brace, then break at the hips and knees together. Sit between the legs. Do not let the chest collapse.',
    'Hit a depth you will own every rep — hip crease below the knee for most lifters — then stand without the knees caving.',
    'Reset the breath at the top. If you cannot control the bottom, use a target and rebuild it; do not bounce.',
  ],
  mistakes: [
    { title: 'Cutting depth as soon as it gets hard', body: 'High-rep bodyweight work turns into a pulse squat. Pick a depth and film a set from the side.' },
    { title: 'Heels lifting or knees caving', body: 'Shorten the range, widen or narrow the stance, and own the foot. Do not load a pattern that already falls in.' },
    { title: 'Logging jump squats or goblet squats here', body: 'A jump is a different slug. A dumbbell at the chest is goblet squat. Empty hands stay on this one.' },
    { title: 'Rushing under a bar before the pattern is boring', body: 'If you cannot sit to depth for 15 quiet reps, the barbell will not teach you. It will just hide the miss.' },
  ],
  variations: [
    { slug: 'dumbbell-goblet-squat', name: 'Dumbbell goblet squat', note: 'First loaded squat for most lifters. Same upright pattern, a weight to hold.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'The free-bar version once the brace and depth repeat.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Single-leg if one side always bails in the bilateral squat.' },
    { slug: 'jump-squat', name: 'Jump squat', note: 'Same start, explosive finish. Log it separately so the bodyweight chart stays a squat, not a jump.' },
  ],
  progressions: [
    'Box or target squat to a consistent depth.',
    'Free bodyweight squat with a three-second descent.',
    'Goblet squat once you want load without a bar.',
    'Empty-bar back squat when the pattern is automatic.',
  ],
  programming: 'Teaching squat and a high-rep finisher: 3–4 sets of 8–20. Log it. “Just bodyweight” still has a history, and it is how you see that last month’s 20-rep sets became easy. When you pick up a dumbbell, switch to goblet squat so the chart stays honest.',
  equipmentAlternatives: [
    { slug: 'dumbbell-goblet-squat', name: 'Dumbbell goblet squat', note: 'The usual next step when bodyweight is no longer hard.' },
    { slug: 'kettlebell-goblet-squat', name: 'Kettlebell goblet squat', note: 'Same hold, different implement. Still not this slug.' },
    { slug: 'wall-sit', name: 'Wall sit', note: 'Isometric quad work if a full squat is not available today.' },
  ],
  faqs: [
    {
      question: 'How many bodyweight squats before I use a bar?',
      answer: 'There is no rep target. When depth, brace, and knee track repeat under fatigue, pick up a goblet or an empty bar. A sloppy 50 does not earn a loaded squat.',
    },
  ],
  relatedSlugs: [
    'dumbbell-goblet-squat',
    'barbell-back-squat',
    'split-squat',
    'kettlebell-goblet-squat',
  ],
} satisfies ExerciseOverlay
