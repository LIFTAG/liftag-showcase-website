import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pendlay-row',
  metaDescription: 'Pendlay row: dead-stop from the floor, near-horizontal torso, and why it is not a bent-over row in LIFTAG.',
  steps: [
    'Use full-size plates or blocks so the bar sits at a height you can reach with a long spine. Hinge until the torso is near horizontal.',
    'Take an overhand grip, brace, and pull from a dead stop toward the lower chest or upper abdomen. Fast intent, not a bounce.',
    'Return the bar to the floor under control. Let it settle. Reset the breath and the back before the next rep.',
    'The torso stays put. If you have to stand up to finish, it is too heavy for a Pendlay.',
  ],
  mistakes: [
    { title: 'Bouncing the plates', body: 'A rebound is a touch-and-go bent-over row from the floor. Dead stop or it is a different lift.' },
    { title: 'Raising the chest as the bar leaves the floor', body: 'That is a poorly braced deadlift. Stay over the bar; pull it to you.' },
    { title: 'Logging Pendlay as barbell bent-over row', body: 'Different start, different PR. Keep this slug so week-six numbers still mean something.' },
    { title: 'Yanking from a loose shoulder position', body: 'Set the lats, then pull. A slack hang plus a hard yank is a lumbar problem, not a back builder.' },
  ],
  variations: [
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'Hanging start, more time under tension, torso usually a bit higher.' },
    { slug: 't-bar-row', name: 'T-bar row', note: 'Arc path, closer grip, still a hinge row.' },
    { slug: 'inverted-row', name: 'Inverted row', note: 'Bodyweight version while you learn a horizontal pull.' },
  ],
  progressions: [
    'Bent-over rows that you can hold still for a three-second hang.',
    'Pendlay rows from blocks if the floor start rounds you.',
    'Working sets of 3–6 from a true dead stop.',
    'Add load only when every rep starts and ends on the floor without a bounce.',
  ],
  programming: 'Treat it like a pull, not a pump set: 3–5 sets of 3–6, longer rest. It pairs well on deadlift day as the second movement. Do not chase bent-over-row numbers here — the reset costs you load on purpose.',
  faqs: [
    {
      question: 'Can I touch-and-go if the program just says “rows”?',
      answer: 'If it is a Pendlay day, the bar dies on the floor. Touch-and-go belongs on barbell-bent-over-row. Put the style in the set note if you mix them in one week.',
    },
  ],
  relatedSlugs: [
    'barbell-bent-over-row',
    't-bar-row',
    'conventional-deadlift',
    'seated-cable-row',
  ],
} satisfies ExerciseOverlay
