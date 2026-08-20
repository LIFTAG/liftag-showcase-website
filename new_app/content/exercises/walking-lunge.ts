import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'walking-lunge',
  metaDescription: 'Walking lunge: stride, space, and how to log steps without mixing reverse lunges into the same PR.',
  steps: [
    'Clear a lane. Stand tall, step forward into a split you can land quietly, and lower by bending both knees to a depth you can repeat.',
    'Front foot planted, knee tracking the toes, pelvis facing forward — not a tightrope line and not a wide sloppy step.',
    'Push through the front foot, bring the rear leg through, and keep walking. Pause a beat if momentum is doing the next landing.',
    'Shorter steps bias the knee; longer steps bias the hip. Pick one stride and keep it for the set.',
  ],
  mistakes: [
    { title: 'Walking a tightrope', body: 'Feet should land about hip-width. A single-file line is why people wobble and dump the knee inward.' },
    { title: 'Rushing the landing', body: 'If you cannot stop at the bottom, the next step is a fall. Slow down or drop the load.' },
    { title: 'Logging reverse or split squats here', body: 'Walking lunges have a different landing and a different PR. Reverse lunges and split-squat have their own slugs.' },
    { title: 'Counting only one side', body: 'Decide total steps or steps per leg and keep it. “20 walking lunges” that were 10 per side is fine; mixing the two week to week is not.' },
  ],
  variations: [
    { slug: 'dumbbell-lunge', name: 'Dumbbell lunge', note: 'Usually in-place or shorter. Same pattern, easier to control the landing.' },
    { slug: 'dumbbell-reverse-lunge', name: 'Dumbbell reverse lunge', note: 'Step back. Often kinder on the front knee.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Stationary. No walking tax.' },
    { slug: 'barbell-lunge', name: 'Barbell lunge', note: 'Same idea with a bar. Earn this first.' },
  ],
  progressions: [
    'Bodyweight walking lunges in a straight line with quiet landings.',
    'Goblet or light dumbbells once the stride is automatic.',
    'Working sets of 8–12 per leg. Add load when the last steps still look like the first.',
    'Reverse lunges or split squats if the walk is the limiter, not the legs.',
  ],
  programming: 'Conditioning and single-leg volume, not a max-effort lift: 2–4 sets of 8–12 per leg after squats. Log the implement (bodyweight, goblet, two dumbbells) in the note. A “PR” from switching bodyweight to a 20 kg goblet is real; a PR from shortening the lane is not.',
  faqs: [
    {
      question: 'How should I count reps?',
      answer: 'Pick total steps or reps per leg and stick with it on this slug. Per-leg is easier to compare to reverse lunges and split squats. Put “/leg” in the set note if there is any chance future-you will guess.',
    },
  ],
  relatedSlugs: [
    'dumbbell-lunge',
    'barbell-lunge',
    'dumbbell-reverse-lunge',
    'split-squat',
  ],
} satisfies ExerciseOverlay
