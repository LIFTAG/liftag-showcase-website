import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-reverse-lunge',
  metaDescription: 'Dumbbell reverse lunge: step-back landing, quiet front knee, and how to log reverse lunges in LIFTAG without mixing walking or forward-lunge numbers here.',
  steps: [
    'Stand tall with dumbbells at the sides, knuckles forward, shoulders packed. The front foot is about to stay planted. That is the point.',
    'Step back onto the ball of the rear foot into a split you can land quietly. Front foot whole, heel down.',
    'Lower both knees. Front shin stays calmer than a forward lunge. Torso stacked over the pelvis, not a bow toward the front knee.',
    'Push through the front foot to stand back up. The rear foot returns. Do not hop the front foot around between reps.',
    'Shorter step, more knee; longer step, more hip. Pick one and keep it for the set.',
  ],
  mistakes: [
    { title: 'Turning it into a walking lunge', body: 'If you keep traveling, you left this slug. Walking-lunge has a different landing and a different PR.' },
    { title: 'Logging forward lunges here', body: 'Stepping forward slams a new shin angle every rep. Reverse keeps the front foot honest. Use dumbbell-lunge for the forward step.' },
    { title: 'Tiny curtsy depth as the bells get heavier', body: 'If week four is a dip, the PR is fake. Film one side or pick a floor target for the back knee.' },
    { title: 'Bells swinging like walking metronomes', body: 'Quiet hands. A swinging dumbbell means the torso is late. Pause at the bottom or drop a size.' },
  ],
  variations: [
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Forward step. Different landing, usually a crankier front knee.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Keep moving. More balance, more systemic fatigue.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Feet stay put. Best when the step itself is the problem.' },
    { slug: 'dumbbell-step-up', name: 'Dumbbell step-up', note: 'Single-leg, but onto a box, not a reverse step.' },
  ],
  progressions: [
    'Bodyweight reverse lunges until the back-foot landing is quiet.',
    'Light dumbbells, 8–12 per leg, same depth both sides.',
    'Add load when the front heel never pops and the bells stay still.',
    'Walking or Bulgarian once the reverse step is not the limiter.',
  ],
  programming: 'The default loaded reverse lunge: 3–4 sets of 8–12 per leg after a squat. Log the pair of dumbbells and each leg. If you switch to a forward step or a walking set mid-block, change slug or the estimated 1RM is two landings pretending to be one lift.',
  equipmentAlternatives: [
    { slug: 'split-squat', name: 'Split squat', note: 'No step. Keep the split stance when the landing is the issue.' },
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Forward version if reverse is clean and you actually want the other landing.' },
  ],
  faqs: [
    {
      question: 'Why reverse instead of a forward lunge?',
      answer: 'The front foot stays planted. You are not slamming into a new shin angle every rep, which is why cranky knees often like reverse better. If reverse is clean and forward is not, program this slug and leave dumbbell-lunge for later. Do not grind a painful forward step just to “do lunges.”',
    },
  ],
  relatedSlugs: [
    'dumbbell-lunge',
    'walking-lunge',
    'split-squat',
    'dumbbell-step-up',
  ],
} satisfies ExerciseOverlay
