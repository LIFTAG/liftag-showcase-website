import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'diamond-push-up',
  metaDescription: 'Diamond push-up: hand placement, elbow path, and how to log close-grip push-ups as triceps work in LIFTAG instead of mixing them with regular push-ups.',
  steps: [
    'Start in a high plank. Hands closer than a standard push-up — thumbs and index fingers can make a loose diamond if the wrists tolerate it.',
    'Brace so the body stays a straight line from head to heels. Elbows track back along the ribs, not out to 90°.',
    'Lower until the chest is close to the hands. The diamond is a smaller target; own the bottom instead of hovering.',
    'Press the floor away without piking the hips or shrugging the neck into the lockout.',
  ],
  mistakes: [
    { title: 'Hands so close the wrists fold', body: 'A touching-thumbs diamond is optional. Close and comfortable beats a pretty shape that inflames the wrists.' },
    { title: 'Flaring the elbows anyway', body: 'If the elbows look like a wide push-up, the close grip did nothing. Keep them by the torso.' },
    { title: 'Logging these as regular push-ups', body: 'You will do fewer reps. Keep this slug so triceps volume is visible and the push-up PR stays honest.' },
    { title: 'Half reps at the top', body: 'Chest toward the hands, full lockout. Partial diamonds belong on a regression, not as fake volume.' },
  ],
  variations: [
    { slug: 'push-up', name: 'Push-up', note: 'Wider hands, more chest, the default pattern.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'The loadable version of the same elbow path.' },
    { slug: 'knee-push-up', name: 'Knee push-up', note: 'Regression that still lets you keep a close grip.' },
    { slug: 'parallel-bar-triceps-dip', name: 'Parallel bar triceps dip', note: 'Upright close-grip pattern when the floor is too easy.' },
  ],
  progressions: [
    'Close-grip knee push-ups until the wrists and lockout feel boring.',
    'Full diamond push-ups in sets of 6–12.',
    'Pause on the chest, or elevate the hands on dumbbells if the wrists want a neutral grip.',
    'Weighted vest or a plate on the back. Log the extra load.',
  ],
  programming: 'Triceps accessory after a press, or the main press on a travel day. 3–4 sets, stop 2–3 reps before the hips start to pike. Log them. LIFTAG will show whether your “easy” close-grip volume is actually trending down.',
  faqs: [
    {
      question: 'Do my hands have to form a perfect diamond?',
      answer: 'No. The catalog name is the shape, not a joint requirement. Hands inside shoulder width with elbows tucked is the lift. If a true diamond hurts the wrists, keep the close grip and skip the fingertip origami.',
    },
  ],
  relatedSlugs: [
    'push-up',
    'close-grip-bench-press',
    'chest-dips',
    'parallel-bar-triceps-dip',
  ],
} satisfies ExerciseOverlay
