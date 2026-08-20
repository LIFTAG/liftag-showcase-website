import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-leg-extension',
  metaDescription: 'Machine leg extension: knee-to-pivot setup, range, and how to log isolation quads in LIFTAG without treating it as a squat.',
  steps: [
    'Line the knee up with the machine’s cam. The pad sits on the lower shin, not the mid-foot.',
    'Sit so the hips stay down and the back is on the pad. Grab the handles.',
    'Extend until the knees are straight without kicking the stack or hyperextending.',
    'Lower under control into a stretch you can own — stop before the plates crash.',
  ],
  mistakes: [
    { title: 'Pivot not at the knee', body: 'If the cam is behind or in front of the joint, every rep shears. Move the seat until the axes match.' },
    { title: 'Swinging the weight up', body: 'A kick hides the hard part of the range. Slow the last 30° or drop the pin.' },
    { title: 'Tiny range with a huge stack', body: 'LIFTAG will store the load. Your knees will store the habit. Own the stretch and the lockout.' },
    { title: 'Logging extensions as squat volume', body: 'This is isolation. Hack squat, leg press, and this slug are three charts. Keep them that way.' },
  ],
  variations: [
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Compound quad volume when you still want a machine.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Sled squat if you need more than a kick.' },
    { slug: 'barbell-front-squat', name: 'Barbell front squat', note: 'Upright free-weight squat with a real quad tax.' },
  ],
  progressions: [
    'Light full-range extensions with the knee on the cam.',
    'Pause a beat at lockout without hyperextending.',
    'Single-leg when one side always bails first.',
    'Heavier 8–12 once the seat setup is the same every session.',
  ],
  programming: 'Finisher, not a squat replacement: 2–4 sets of 8–15. Scan the actual machine — the tag should open this exercise. If the knees complain, shorten the bottom slightly and slow the top rather than piling plates on a bounced lockout.',
  equipmentAlternatives: [
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Keep quad work when the extension machine is a queue.' },
    { slug: 'pendulum-squat', name: 'Pendulum squat', note: 'Guided compound if you want load without an isolation kick.' },
  ],
  faqs: [
    {
      question: 'Are leg extensions bad for the knees?',
      answer: 'They are a long-lever isolation. Align the pivot, pick a range you control, and do not bounce. If a given machine always hurts, swap to hack squat or leg press and log that instead.',
    },
  ],
  relatedSlugs: [
    'standard-leg-press',
    'machine-hack-squat',
    'barbell-front-squat',
    'pendulum-squat',
  ],
} satisfies ExerciseOverlay
