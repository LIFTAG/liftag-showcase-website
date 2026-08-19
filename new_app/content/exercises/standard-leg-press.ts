import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standard-leg-press',
  metaDescription: 'Standard leg press: foot position, depth, and how to log machine squat-pattern volume in LIFTAG.',
  steps: [
    'Sit so the low back is glued to the pad. Place the feet mid-platform, about shoulder width to start.',
    'Unrack and lower until the thighs are at least parallel to the platform, as far as the hips allow without the pelvis tucking.',
    'Press through the whole foot. Finish without slamming the lockout or bouncing out of the hole.',
  ],
  mistakes: [
    { title: 'Letting the pelvis roll at the bottom', body: 'That is lumbar flexion under load. Shorten the range or raise the feet.' },
    { title: 'Tiny range with a huge stack', body: 'You are not fooling the log. LIFTAG will store the load; your knees will store the habit.' },
  ],
  variations: [
    { slug: 'wide-stance-leg-press', name: 'Wide-stance leg press', note: 'More hips, different groove.' },
    { slug: 'single-leg-press', name: 'Single-leg press', note: 'Fixes side-to-side gaps.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'Free-weight counterpart.' },
  ],
  progressions: ['Full-range light presses.', 'Add load when the pelvis stays down.', 'Single-leg when one side always bails first.'],
  programming: 'Quad and glute volume you can do tired. 3–5 sets of 8–15. Scan the actual machine — hack squat and leg press are not the same lift in LIFTAG.',
  relatedSlugs: ['machine-hack-squat', 'barbell-back-squat', 'machine-leg-extension'],
} satisfies ExerciseOverlay
