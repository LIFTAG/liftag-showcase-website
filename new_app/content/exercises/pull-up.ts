import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pull-up',
  metaDescription: 'Pull-up: overhand grip, full hang, and how to log strict pull-ups, kipping, and weighted work in LIFTAG.',
  steps: [
    'Hang from a bar with an overhand grip, just outside shoulder width. Start from a still hang.',
    'Pull the chest toward the bar. Elbows drive down, not back into a shrug.',
    'Chin clearly over the bar, then lower to a full hang. That last inch at the bottom is the next rep’s start.',
  ],
  mistakes: [
    { title: 'Kipping on a strict-pull-up log', body: 'Kipping is a different skill. If the program is strict, log strict. Note kips or use a different row.' },
    { title: 'Chin barely clearing with a chicken neck', body: 'Chest to bar is the standard if you want the PR to mean something later.' },
    { title: 'Not logging negatives or assisted reps', body: 'Assisted pull-up is its own slug. Negatives can live here with a note, or on assisted if the machine did the work.' },
  ],
  variations: [
    { slug: 'chin-up', name: 'Chin-up', note: 'Underhand, usually more biceps.' },
    { slug: 'wide-grip-pull-up', name: 'Wide-grip pull-up', note: 'Harder, less range for many lifters.' },
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'The machine version you can load in small jumps.' },
    { slug: 'assisted-pull-up', name: 'Assisted pull-up', note: 'Use until strict sets of 5 are clean.' },
  ],
  progressions: [
    'Dead hangs and scapular pull-ups.',
    'Assisted or banded pull-ups.',
    'Strict sets of 5–8.',
    'Add a belt. Log the extra weight.',
  ],
  programming: 'Vertical pull of record: 3–5 sets, as many clean reps as you own, then assisted or pulldown back-off. Weighted pull-ups belong on this slug with the plate logged, not as a mystery PR.',
  relatedSlugs: ['chin-up', 'lat-pulldown', 'assisted-pull-up', 'wide-grip-pull-up'],
} satisfies ExerciseOverlay
