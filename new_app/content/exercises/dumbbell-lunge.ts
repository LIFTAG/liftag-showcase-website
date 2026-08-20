import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-lunge',
  metaDescription: 'Dumbbell lunge: forward step, knee track, and how to keep reverse and walking lunges on their own slugs.',
  steps: [
    'Stand tall with dumbbells hanging at the sides, knuckles forward, shoulders packed. Step forward into a split you can land quietly.',
    'Lower both knees. Front foot stays planted, knee follows the toes, torso stacked over the pelvis — not a bow toward the front shin.',
    'Push through the front foot to return, or continue into a walking pattern if that is the set. The bells stay quiet; if they swing, the step was a fall.',
    'Shorter stride, more knee; longer stride, more hip. Do not chase a 90° picture. Chase a repeatable depth that does not crank the front knee.',
  ],
  mistakes: [
    { title: 'Bells swinging like walking metronomes', body: 'Quiet hands. A swinging dumbbell means the torso is late. Pause at the bottom or drop a size.' },
    { title: 'Front knee caving on the push-back', body: 'Track the toe. If the arch collapses, shorten the step or lose the load until the knee stays in line.' },
    { title: 'Logging reverse lunges here', body: 'Stepping back is a different landing and usually a different load. Use dumbbell-reverse-lunge.' },
    { title: 'Cutting depth as the bells get heavier', body: 'If week four is a curtsy of a dip, the PR is fake. Film one side or pick a floor target for the back knee.' },
  ],
  variations: [
    { slug: 'dumbbell-reverse-lunge', name: 'Dumbbell reverse lunge', note: 'Step back. Often easier on the front knee and the landing.' },
    { slug: 'walking-lunge', name: 'Walking lunge', note: 'Keep moving. More balance, more systemic fatigue.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Feet stay put. Best when the step is the problem.' },
    { slug: 'dumbbell-bulgarian-split-squat', name: 'Dumbbell Bulgarian split squat', note: 'Rear foot elevated. Harder, less room to hide.' },
  ],
  progressions: [
    'Bodyweight lunges or split squats until the landing is quiet.',
    'Light dumbbells, in place, 8–12 per leg.',
    'Add load when both sides match depth and the bells stay still.',
    'Reverse, walking, or Bulgarian once the basic forward step is not the limiter.',
  ],
  programming: 'The default loaded lunge: 3–4 sets of 8–12 per leg after a squat. Log the pair of dumbbells, not “lunges.” If you switch to reverse mid-block, change slug or the estimated 1RM is two landings pretending to be one lift.',
  faqs: [
    {
      question: 'Forward or reverse if my knee complains?',
      answer: 'Try reverse first — the front foot stays planted and you are not slamming into a forward shin angle. If reverse is clean and forward is not, program reverse and leave this slug for later. Do not grind through a painful forward step just to “do lunges.”',
    },
  ],
  relatedSlugs: [
    'walking-lunge',
    'dumbbell-reverse-lunge',
    'split-squat',
    'dumbbell-goblet-squat',
  ],
} satisfies ExerciseOverlay
