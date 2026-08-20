import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'wide-grip-pull-up',
  metaDescription: 'Wide-grip pull-up: modest width, full hang, and why it is not your standard pull-up PR in LIFTAG.',
  steps: [
    'Hang overhand, hands only modestly wider than the shoulders. Ultra-wide is shorter range and crankier shoulders, not “more lat.”',
    'Set the shoulder blades, brace, and pull the elbows down as the upper chest moves toward the bar.',
    'Chin clearly over the bar without craning. Lower to a still hang. The last inch at the bottom still counts.',
    'Keep the legs quiet. If you need a kip to get there, that is not this lift.',
  ],
  mistakes: [
    { title: 'Hands at the bar ends', body: 'A wider grip shortens travel and can irritate the shoulders. Stay just outside a normal pull-up, not a crucifix.' },
    { title: 'Logging these as pull-ups', body: 'Harder, usually fewer reps. Keep this slug or the standard pull-up chart looks like you went backwards.' },
    { title: 'Chicken-necking a 2 cm clearance', body: 'Chest toward the bar. If you cannot get there, use assistance or a closer grip.' },
    { title: 'Skipping the hang because the width already hurts', body: 'Then the width is too wide. Move the hands in until a full hang is honest.' },
  ],
  variations: [
    { slug: 'pull-up', name: 'Pull-up', note: 'Shoulder-width overhand. More range, usually more reps.' },
    { slug: 'chin-up', name: 'Chin-up', note: 'Underhand. More biceps, often the easier strict vertical pull.' },
    { slug: 'wide-grip-lat-pulldown', name: 'Wide-grip lat pulldown', note: 'Same width idea you can load in small jumps.' },
    { slug: 'assisted-pull-up', name: 'Assisted pull-up', note: 'Use until wide-grip sets of 4–5 are clean.' },
  ],
  progressions: [
    'Strict shoulder-width pull-ups first. Width is a variation, not a starting point.',
    'Assisted wide-grip or pulldowns at the same hand position.',
    'Strict wide-grip sets of 4–8.',
    'Add a belt only after the hang and the clearance are repeatable. Log the extra weight.',
  ],
  programming: 'A harder vertical pull, not a width magic trick: 3–5 sets, fewer reps than your normal pull-up. Do not program heavy wide-grip and heavy pull-ups on the same day. Weighted work still belongs here with the plate logged.',
  relatedSlugs: [
    'pull-up',
    'chin-up',
    'wide-grip-lat-pulldown',
    'assisted-pull-up',
  ],
} satisfies ExerciseOverlay
