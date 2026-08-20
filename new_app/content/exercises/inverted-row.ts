import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'inverted-row',
  metaDescription: 'Inverted row: bar height, rigid body line, and how to progress without fake chin-to-bar reps.',
  steps: [
    'Set a bar in a rack around waist height, or rings/TRX at a similar line. Lie under it and take an overhand or neutral grip.',
    'Make a long line from head to heels (or head to knees if you are regressing). Pull the chest to the bar by driving the elbows back.',
    'Touch the chest, not the chin. Lower until the arms are long and the shoulder blades reach.',
    'Raise the bar and bend the knees to make it easier. Lower the bar, straighten the legs, or elevate the feet to make it harder. Note the setup.',
  ],
  mistakes: [
    { title: 'Sagging at the hips', body: 'A piked or banana body is not a row. Squeeze the glutes and keep the ribs down, or raise the bar.' },
    { title: 'Reaching with the chin', body: 'Chest to bar. A chicken-neck rep does not count just because the face got closer.' },
    { title: 'An unsecured bar', body: 'J-hooks only, no collars, bar spinning — fix the station before you hang from it.' },
    { title: 'Changing bar height every week with no note', body: 'Lower bar is a harder lift. If LIFTAG shows a “PR” after you raised the bar, that is a different exercise.' },
  ],
  variations: [
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'Loadable version of the same horizontal pull.' },
    { slug: 'pull-up', name: 'Pull-up', note: 'Vertical next step once inverted rows are easy at a low bar.' },
    { slug: 'single-arm-dumbbell-row', name: 'Single-arm dumbbell row', note: 'Free-weight row once you can load more than bodyweight.' },
  ],
  progressions: [
    'Bent-knee inverted rows at a higher bar.',
    'Straight-leg rows, chest touching, sets of 8–12.',
    'Feet elevated or a pause at the chest.',
    'Add a plate on the hips or a vest and log the extra load.',
  ],
  programming: 'The horizontal pull you can do in any rack: 3–4 sets of 6–12. Use it as the main row while pull-ups are still assisted, or as back-off after heavy barbell work. Log added load; bodyweight-only still belongs in the session so the volume is real.',
  faqs: [
    {
      question: 'Rings or a bar?',
      answer: 'Both count on this slug if the body line and chest-to-handle standard stay the same. Note “rings” when you switch — the stability tax is different even at the same height.',
    },
  ],
  relatedSlugs: [
    'pull-up',
    'seated-cable-row',
    'barbell-bent-over-row',
    'assisted-pull-up',
  ],
} satisfies ExerciseOverlay
