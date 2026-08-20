import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'concentration-curl',
  metaDescription: 'Concentration curl: elbow on the thigh, no swing, and how to log this single-arm isolation slug in LIFTAG instead of folding it into standing dumbbell curls.',
  steps: [
    'Sit with the feet wide. Brace the working elbow against the inner thigh, just above the knee. The off-hand can rest on the other knee.',
    'Hang the dumbbell palm-up at long arm. The upper arm is a hitching post. It does not leave the thigh.',
    'Curl toward the shoulder until the biceps fully shorten. Wrist stays stacked. Do not drag the bell across the body into a hammer.',
    'Lower to a full hang and pause a beat. Switch arms and log both sides as one lift.',
  ],
  mistakes: [
    { title: 'Letting the elbow leave the thigh', body: 'Then it is a seated curl with extra theater. Park the elbow. If it will not stay, the bell is too heavy.' },
    { title: 'Logging these as standing dumbbell curls', body: 'You will curl less here. That is the point. Keep concentration-curl or the isolation work disappears into a stronger standing chart.' },
    { title: 'Helping with the off-hand on every rep', body: 'A spot on a true last rep is one thing. A second hand on the wrist from rep one is a different lift. Put “assisted” in the note if you need it.' },
    { title: 'Turning the torso to finish', body: 'Leaning back and rotating to drag the bell up is a cheat standing curl you happen to be sitting for. Sit still or go lighter.' },
  ],
  variations: [
    { slug: 'incline-dumbbell-curl', name: 'Incline dumbbell curl', note: 'Lengthened-position counterpart if you want stretch, not just a squeeze.' },
    { slug: 'standing-dumbbell-bicep-curl', name: 'Standing dumbbell bicep curl', note: 'More load, more cheat available, both arms.' },
    { slug: 'ez-bar-preacher-curl', name: 'EZ-bar preacher curl', note: 'Supported bilateral curl when you want a pad instead of a thigh.' },
    { slug: 'hammer-curls', name: 'Hammer curls', note: 'Neutral grip if the supinated hang bothers the wrist.' },
  ],
  progressions: [
    'Light bell, elbow glued, full hang you can sit through.',
    'Working sets of 10–15 per arm with the same elbow position.',
    'Add a one-second squeeze at the top before you add load.',
    'Preacher or incline as the main curl; keep this as the slow finisher.',
  ],
  programming: 'Finishing isolation, not a main curl: 2–4 sets of 10–15 per arm. Log one bell, both arms as one lift. This will never match your standing dumbbell numbers, so keep this slug. Slow eccentrics belong in the set note, not in a different exercise. Rest just long enough that the second arm does not turn into a swing.',
  faqs: [
    {
      question: 'Can I rest the off-hand on the working wrist?',
      answer: 'Not as the default. The point is one arm, no help. If the last two reps need a tiny spot, finish them and write “assisted” so you do not chase that number next week. A full set with two hands is not this lift.',
    },
  ],
  relatedSlugs: [
    'incline-dumbbell-curl',
    'standing-dumbbell-bicep-curl',
    'ez-bar-preacher-curl',
    'hammer-curls',
  ],
} satisfies ExerciseOverlay
