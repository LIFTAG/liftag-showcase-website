import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-farmers-walk',
  metaDescription: 'Dumbbell farmers walk: pick-up, posture, and how to log loaded carries in LIFTAG without mixing trap-bar farmer numbers onto this slug.',
  steps: [
    'Clear a straight walking lane. Hinge to the bells, grip hard, and stand tall the same way you would for a dumbbell deadlift.',
    'Pack the lats so the weights hang beside the thighs, not swinging into them. Ribs over pelvis, eyes forward.',
    'Walk with short, controlled steps. Heel to toe, no race-walking, no shrugging the bells toward the ears.',
    'Set the bells down with a hinge. Dropping them from lockout is loud, rude, and a missed last eccentric.',
  ],
  mistakes: [
    { title: 'Shrugging the whole walk', body: 'Traps on is not the same as ears-to-shoulders. If you are shrugging, the load is too heavy or the walk is too long.' },
    { title: 'Leaning back or letting the bells pull you into a fold', body: 'Stand between the weights. A behind-the-body lean is how carries turn into a low-back test.' },
    { title: 'Logging trap-bar farmers as dumbbell farmers', body: 'Hex-bar carries are a different slug and usually a different load. trap-bar-farmers-walk exists — use it.' },
    { title: 'No distance, no time, just “3 sets”', body: 'A 10 m shuffle and a 40 m grind are not the same session. Pick meters or seconds, put it in the log, and keep the path length the same week to week.' },
  ],
  variations: [
    { slug: 'trap-bar-farmers-walk', name: 'Trap bar farmer\'s walk', note: 'Heavier, more stable, different slug.' },
    { slug: 'dead-hang', name: 'Dead hang', note: 'Grip without the walk when space is gone.' },
    { slug: 'dumbbell-shrug', name: 'Dumbbell shrug', note: 'Direct upper traps if the carry is limited by grip first.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'The pick you already own, without the walk.' },
  ],
  progressions: [
    'Light bells, 20–30 m, posture you could hold in a photo.',
    'Add load or add distance — one variable per week.',
    'Longer trips or slower tempos once the shrug and the lean are gone.',
    'Trap-bar farmers when the dumbbells are no longer the limiter.',
  ],
  programming: 'Finisher or main grip work: 3–5 trips. Log the weight of one dumbbell, not the pair, and keep the path length honest. Put meters or seconds in the set note so a 10 m shuffle cannot masquerade as a 40 m grind. Rest enough that the next pick-up is still a hinge, not a round-back yank.',
  equipmentAlternatives: [
    { slug: 'trap-bar-farmers-walk', name: 'Trap bar farmer\'s walk', note: 'Use when the gym has a hex bar and the dumbbells top out.' },
    { slug: 'dead-hang', name: 'Dead hang', note: 'No lane, no farmers. Grip still trains.' },
  ],
  faqs: [
    {
      question: 'Should I log distance or time?',
      answer: 'Either works if you stay consistent. Distance is cleaner when you have a marked lane; time is cleaner in a crowded gym. Do not switch units mid-block and call it a PR.',
    },
  ],
  relatedSlugs: [
    'trap-bar-farmers-walk',
    'dead-hang',
    'trap-bar-deadlift',
    'barbell-shrugs',
  ],
} satisfies ExerciseOverlay
