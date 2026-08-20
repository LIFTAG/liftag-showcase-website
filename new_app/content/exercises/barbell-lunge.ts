import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-lunge',
  metaDescription: 'Barbell lunge: rack setup, balance, and why the dumbbell version should be boring before the bar goes on.',
  steps: [
    'Set the bar in a rack at back-squat height, safeties where you can dump it, and enough clear floor to step. Bar on the upper back, not the neck.',
    'Walk out, brace, and step forward into a split you already own with dumbbells. Front foot whole, knee tracking the toes.',
    'Lower both knees, then push through the front foot to return. The bar stays over the mid-foot of the front leg — if it drifts, the set is over.',
    'In-place reverse or forward steps are easier to bail than a walking barbell lunge. Choose the version you can rack without a stumble.',
  ],
  mistakes: [
    { title: 'Loading a pattern you do not own', body: 'If dumbbell lunges still wobble, a bar on the back is not the fix. Stay on dumbbell-lunge until the stride is boring.' },
    { title: 'Walking them out in a crowded aisle', body: 'A missed step with a bar is a different problem than a missed step with dumbbells. Use a platform, a rack, or stay in place.' },
    { title: 'Tightrope feet under a bar', body: 'Hip-width landings. A narrow line plus a high center of mass is how the bar dumps sideways.' },
    { title: 'Logging walking lunges and barbell lunges as one PR', body: 'Different implement, different balance cost. Keep this slug for the bar.' },
  ],
  variations: [
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'The version you should already be good at.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Traveling version. Do it with dumbbells or goblet before a bar.' },
    { slug: 'smith-machine-lunge', name: 'Smith machine lunge', note: 'Guided bar when you want lunge load without a walk-out.' },
    { slug: 'barbell-bulgarian-split-squat', name: 'Barbell Bulgarian split squat', note: 'Rear foot up, even less room for a bad bailout. Advanced.' },
  ],
  progressions: [
    'Bodyweight, then dumbbell lunges, same stride you will use with the bar.',
    'Empty-bar in-place lunges inside a rack with safeties.',
    'Working sets of 6–10 per leg at a load you can re-rack without a dance.',
    'Smith or split squat if the walk is the limiter.',
  ],
  programming: 'A specialist single-leg barbell lift, not a beginner progression: 3–4 sets of 6–10 per leg. It will be much lighter than your back squat. Log rest — these add up. If LIFTAG shows a jump the week you started bouncing off the back knee, that PR is not the one to chase.',
  relatedSlugs: [
    'dumbbell-lunge',
    'walking-lunge',
    'split-squat',
    'barbell-back-squat',
  ],
} satisfies ExerciseOverlay
