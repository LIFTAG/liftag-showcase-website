import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bent-over-row',
  metaDescription: 'Barbell bent-over row: hinge, torso angle, and how to keep Pendlay and Yates rows off this LIFTAG PR.',
  steps: [
    'Hinge until the torso is 15–45° above horizontal, knees soft, bar hanging over mid-foot. Brace before the first pull — the hinge is the lift.',
    'Take an even overhand grip just outside the legs. Pull the bar to the lower ribs or upper abdomen by driving the elbows back, not by standing up.',
    'Lower until the arms are long and the lats are stretched. The torso angle stays put; if it rises every rep, the load is too heavy.',
    'Re-brace between reps. Straps are fine when grip dies before the back does — put “straps” in the set note.',
    'Pick one grip and torso angle and keep it. A more upright “Yates” row is a different lever; log it as a note, not a mystery PR.',
  ],
  mistakes: [
    { title: 'Standing up through the pull', body: 'If the torso rises, you turned a row into a shrug-hinge. Drop the load until the back angle is boringly still.' },
    { title: 'Yanking from a slack hang', body: 'The plates clank, the lumbar takes it. Set the shoulders, pull the slack, then row.' },
    { title: 'Logging Pendlay rows here', body: 'Floor-start, dead-stop rows belong on pendlay-row. Mixing them inflates this chart with a different lift.' },
    { title: 'Rounding the lumbar to reach the floor', body: 'The bar does not need to kiss the plates. Range is whatever you can hold with a long spine.' },
  ],
  variations: [
    { slug: 'pendlay-row', name: 'Pendlay row', note: 'Each rep starts on the floor. More start strength, less time under tension.' },
    { slug: 't-bar-row', name: 'T-bar row', note: 'Landmine or T-bar station, closer grip, arc path.' },
    { slug: 'single-arm-dumbbell-row', name: 'Single-arm dumbbell row', note: 'Supported, one side at a time, easier on the low back.' },
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'Constant tension when the hinge is the limiter.' },
  ],
  progressions: [
    'Chest-supported or inverted rows until the pull is a row, not a heave.',
    'Light bent-over rows with a three-second lower and a frozen torso.',
    'Working sets of 6–10 at a repeatable torso angle. Add load when the last set still looks like the first.',
    'Pendlay or paused-at-the-hang work if the start is the weak point.',
  ],
  programming: 'Primary horizontal pull: 3–5 sets of 5–10 after your main hinge or squat. It will sit well below your deadlift — that is the point. Log rest; two to three minutes is normal. If LIFTAG shows a jump the week you stood up on every rep, add a note or drop the load.',
  faqs: [
    {
      question: 'Overhand or underhand?',
      answer: 'Overhand is the default on this slug. Underhand (Yates) usually lets you pull heavier and more biceps. Pick one as the logged version and put the other in a set note, or the estimated 1RM is two lifts fighting.',
    },
  ],
  relatedSlugs: [
    'pendlay-row',
    't-bar-row',
    'single-arm-dumbbell-row',
    'seated-cable-row',
    'chest-supported-t-bar-row',
  ],
} satisfies ExerciseOverlay
