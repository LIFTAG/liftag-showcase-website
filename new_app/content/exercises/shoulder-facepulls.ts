import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'shoulder-facepulls',
  metaDescription: 'Shoulder face pulls: rope to the face, external rotation, and rear-delt logging that is not a seated row in LIFTAG.',
  steps: [
    'Set a rope on a pulley at face to forehead height. Step back until the stack is floating. Soft knees, ribs down.',
    'Pull the rope toward the face with the elbows high and wide. Finish by rotating the knuckles toward the ears or temples — you should be looking through the V of the rope.',
    'Squeeze the rear delts and the upper back, not the traps up into the ears. The head stays still; the rope comes to you.',
    'Return until the arms are long and the shoulders reach forward a little. Do not let the stack dump you into a shrug.',
  ],
  mistakes: [
    { title: 'Pulling the rope to the sternum with elbows down', body: 'That is a seated cable row with a rope. If the elbows drop, log a row. Face pulls stay high.' },
    { title: 'Heaving a stack you cannot get to the face', body: 'Rear-delt work dies when the load is a row. If the rope stops at arm’s length, drop the pin. Light-moderate is the point.' },
    { title: 'Skipping the external rotation', body: 'Hands to the ears is the last part of the rep. Without it you did a high row. Still useful — still not this lift unless you finish the turn.' },
    { title: 'Using these as your only pulling volume', body: 'Face pulls are a corrector and a rear-delt finisher. They do not replace seated cable row, pulldowns, or pull-ups.' },
  ],
  variations: [
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'Real horizontal-pull volume. Pair it; do not replace it with face pulls.' },
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'Side delt on the same cable column.' },
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'Heavier upright pattern if the shoulder likes it.' },
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'The back work face pulls are not trying to be.' },
  ],
  progressions: [
    'Light rope, elbows high, knuckles to the ears, two-second squeeze.',
    'Add load only while the rope still reaches the face without a lean.',
    'Use them after pressing, or on a pull day after the heavy row.',
  ],
  programming: 'Two to four sets of 12–20. This is not a PR lift — if LIFTAG shows a big jump, you probably started rowing the rope. Keep the load honest, note “rope / high pulley,” and spend the real rest timer on the row or the pulldown that came first.',
  equipmentAlternatives: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'If the gym has no rope, laterals plus a light row still cover the shoulder. It is not the same movement.' },
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'When you need back work, not a face-pull substitute.' },
  ],
  faqs: [
    {
      question: 'Can face pulls replace rows for rear delts?',
      answer: 'No. They hit rear delts and external rotators with a high elbow. Rows build the back you actually pull with. Do both. Log both.',
    },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'seated-cable-row',
    'barbell-bent-over-row',
    'lat-pulldown',
  ],
} satisfies ExerciseOverlay
