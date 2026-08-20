import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bulgarian-split-squat',
  metaDescription: 'Barbell Bulgarian split squat: rear-foot height, bar on the back, and how to log each leg in LIFTAG without mixing dumbbell Bulgarians or split squats.',
  steps: [
    'Set the bar in a rack at squat height, safeties where you can dump it. Rear laces on a knee-height bench, not a jammed toe on a high box.',
    'Walk the front foot far enough forward that the shin can stay roughly vertical at the bottom. Bar on the upper back, not the neck.',
    'Brace and drop the back knee toward the floor. Front knee tracks mid-foot. The bar stays over the front mid-foot, not drifting toward the bench.',
    'Drive through the front heel and mid-foot to stand. Finish the set on one leg, then switch. Do not alternate every rep under a bar.',
    'Re-rack like a squat. A missed Bulgarian with a bar is not a shrug-and-drop.',
  ],
  mistakes: [
    { title: 'Loading a stance you do not own with dumbbells', body: 'If the dumbbell version still wobbles, a bar on the back is not the fix. Stay on dumbbell-bulgarian-split-squat until the stride is boring.' },
    { title: 'Rear foot too high', body: 'A box above the knee turns this into a hip-flexor stretch with a squat bar. Start at knee height or lower.' },
    { title: 'Logging it as a dumbbell Bulgarian or a split squat', body: 'Bar on the back, rear foot up, feet planted. Three different PRs. Keep this slug, and log each leg.' },
    { title: 'Bouncing the back knee off the floor', body: 'The hard part is the bottom. Touch or hover. Do not use the floor as a trampoline under a bar.' },
  ],
  variations: [
    { slug: 'dumbbell-bulgarian-split-squat', name: 'Dumbbell Bulgarian split squat', note: 'Same rear-foot setup, easier to dump. Earn the bar here first.' },
    { slug: 'split-squat', name: 'Split squat', note: 'Rear foot on the floor. Learn the stance without the bench or the bar.' },
    { slug: 'barbell-lunge', name: 'Barbell lunge', note: 'Stepping version with a bar. Different landing, still axial.' },
    { slug: 'smith-machine-split-squat', name: 'Smith machine split squat', note: 'Fixed rail when balance, not the legs, is the limiter.' },
  ],
  progressions: [
    'Split squat, then bodyweight Bulgarian, until the rear-foot depth is automatic.',
    'Dumbbell Bulgarian. Add load when both legs hit the same depth for all work sets.',
    'Empty bar in a rack with safeties. Then working sets of 6–10 per leg.',
    'Pause in the hole only after you can re-rack without a dance.',
  ],
  programming: 'A specialist single-leg barbell lift, not a beginner progression: 3–4 sets of 6–10 per leg after the main squat. It will be much lighter than your back squat. Log each leg in LIFTAG. If you skip the bench, switch to split-squat. If you swap to dumbbells, switch slug so the bar chart stays a bar chart.',
  equipmentAlternatives: [
    { slug: 'dumbbell-bulgarian-split-squat', name: 'Dumbbell Bulgarian split squat', note: 'Default when you do not want a bar on the back, or the rack is busy.' },
    { slug: 'split-squat', name: 'Split squat', note: 'No bench. Same single-leg pattern with less stretch.' },
    { slug: 'barbell-lunge', name: 'Barbell lunge', note: 'Keep the bar, lose the rear-foot bench.' },
  ],
  faqs: [
    {
      question: 'Bar or dumbbells for Bulgarians?',
      answer: 'Dumbbells until the stance is boring. The bar adds axial load and a worse bail. If one side is still two reps behind, stay on dumbbells and log each leg. Do not paper over a gap with a walk-out.',
    },
  ],
  relatedSlugs: [
    'dumbbell-bulgarian-split-squat',
    'split-squat',
    'barbell-lunge',
    'bodyweight-bulgarian-split-squat',
  ],
} satisfies ExerciseOverlay
