import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-step-up',
  metaDescription: 'Dumbbell step-up: box height, working-leg drive, and how to log step-ups in LIFTAG without counting them as lunges, split squats, or a cheat push-off.',
  steps: [
    'Pick a box about mid-shin to knee. Whole working foot on the box, not the toes hanging off the edge.',
    'Dumbbells at the sides. Stand close enough that you step up, not jump forward. Brace.',
    'Drive through the working heel. The trailing leg is luggage, not a spring. If you have to push hard off the floor, the box is too high or the load is theater.',
    'Stand tall on the box. Do not hitch the lockout. Lower under control with the same working leg, or alternate if that is the set.',
    'Keep the pelvis square. A hiking hip is a step-up you are not logging honestly.',
  ],
  mistakes: [
    { title: 'Pushing off the rear leg', body: 'That is a jump with dumbbells. Pause the trailing toes a centimeter off the floor on a few reps. If you cannot, drop the box or the bells.' },
    { title: 'Box too high', body: 'A thigh well above parallel at the start turns this into a scramble. Mid-shin to knee is plenty. Higher is not a better lift.' },
    { title: 'Logging it as a lunge or a split squat', body: 'You stepped onto a box. Different pattern, different PR. Keep this slug. Box-step-up is the unloaded cousin, not this loaded one.' },
    { title: 'Using a flexing plate stack as a box', body: 'If the surface moves, the foot does too. Use a box, a bench you trust, or skip the lift.' },
  ],
  variations: [
    { slug: 'box-step-up', name: 'Box step-up', note: 'Bodyweight version. Same drive, no bells, still not a lunge.' },
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Forward step on the floor when you do not have a box.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Feet planted. Use it when the step-up is all balance and no legs.' },
    { slug: 'dumbbell-reverse-lunge', name: 'Dumbbell reverse lunge', note: 'Single-leg on the floor, stepping back instead of up.' },
  ],
  progressions: [
    'Bodyweight step-ups to a mid-shin box with a quiet trailing leg.',
    'Light dumbbells, 8–12 per leg, same box height both sides.',
    'Add load when you can pause the rear foot off the floor at the start of the drive.',
    'Slightly higher box only after the push-off is gone. Note the height in LIFTAG.',
  ],
  programming: 'Accessory after the squat: 3–4 sets of 6–12 per leg. Log the pair of dumbbells and the box height in the set note. A “PR” from a shorter box is not a PR. If you dump the box and start lunging, switch slug so the chart stays a step-up.',
  equipmentAlternatives: [
    { slug: 'box-step-up', name: 'Box step-up', note: 'No dumbbells. Keep the pattern, leave the load off this slug.' },
    { slug: 'split-squat', name: 'Split squat', note: 'No honest box. Still single-leg, feet stay put.' },
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Keep the bells, lose the box.' },
  ],
  faqs: [
    {
      question: 'How high should the box be?',
      answer: 'High enough that the working thigh is around parallel at the start, not a mountain-climber. If the rear leg has to launch you, the box won. Drop it, log the height, and own the working leg. Taller next month is a note, not a silent new exercise.',
    },
  ],
  relatedSlugs: [
    'dumbbell-lunge',
    'split-squat',
    'box-step-up',
    'dumbbell-reverse-lunge',
  ],
} satisfies ExerciseOverlay
