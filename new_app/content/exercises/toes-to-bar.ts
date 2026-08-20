import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'toes-to-bar',
  metaDescription: 'Toes-to-bar: bar contact, strict versus kipping, and how to log T2B in LIFTAG without mixing those reps into hanging-leg-raise or hanging-knee-raise numbers.',
  steps: [
    'Hang from a bar, overhand, a bit wider than a pull-up. Shoulders packed. A dead-hang shrug is not an active start.',
    'Strict: hollow, then raise the toes to the bar by curling the pelvis and closing the hips. The toes tap the bar. A kick toward the sky that misses is not a rep.',
    'Kipping: the beat is hollow to arch, then the toes tap. Still a tap on the bar, not air in front of it. If the program is strict, do not kip and stay on this slug silently.',
    'Lower without handing the set to a pendulum you cannot stop. The next rep starts from a position you chose.',
    'If you cannot reach the bar, you are not on this lift yet. Log hanging-leg-raise or hanging-knee-raise until the range exists.',
  ],
  mistakes: [
    { title: 'Logging these as hanging-leg-raise', body: 'Hanging-leg-raise is a still hang and a pelvic curl, usually not to the bar. Toes-to-bar is contact. Keep the slugs apart or the chart is a mix of two skills.' },
    { title: 'Kipping on a strict log without a note', body: 'Kipping volume is not a strict PR. Stay on this slug if you kip, and write “kip” in the LIFTAG set note so a butterfly string cannot hide inside strict work.' },
    { title: 'Counting near-misses', body: 'Toes on the bar. Shin to bar is a different standard some gyms use. Pick one, write it down, and stop counting the kick that stopped at eye height.' },
    { title: 'Letting grip and swing become the whole set', body: 'If you cannot kill the swing, cut the set or drop to hanging-knee-raise. A wild unbroken string is conditioning, not a T2B PR, unless that is what you programmed.' },
  ],
  variations: [
    { slug: 'hanging-leg-raise', name: 'Hanging leg raise', note: 'Strict hang, long legs, no bar-touch requirement. The honest sibling, not a substitute log.' },
    { slug: 'hanging-knee-raise', name: 'Hanging knee raise', note: 'Bent knees. Use it until the straight-leg range exists.' },
    { slug: 'pull-up', name: 'Pull-up', note: 'Same bar, different job. Do not log kipping T2B as pull-ups because you were on the bar.' },
    { slug: 'dead-hang', name: 'Dead hang', note: 'Grip and packed shoulders when the raise is not the limiter you are training.' },
  ],
  progressions: [
    'Hanging knee raises with a still hang and a pelvic curl.',
    'Hanging-leg-raise until thighs reach the torso without a swing.',
    'Strict toes-to-bar, actual contact, controlled lower.',
    'Kipping strings only if the session wants them. Note “kip”. Do not mix them into last week’s strict count.',
  ],
  programming: 'Strict T2B: 3–4 sets of 5–10, still hang between reps if you need it. Kipping work can live on this slug with a “kip” note and the rest you actually took. Do not dump either version onto hanging-leg-raise because both happen on a pull-up bar. If grip dies first, split the work with dead-hang or straps and say so in the log.',
  faqs: [
    {
      question: 'Strict or kipping: which one is this slug?',
      answer: 'Both can live here. Strict is the default if you do not write anything. If you kip, stay on toes-to-bar and put “kip” in the set note. Hanging-leg-raise is the strict hang that does not require bar contact. Do not park kipping T2B there to make the raise chart look bigger.',
    },
  ],
  relatedSlugs: [
    'hanging-leg-raise',
    'pull-up',
    'hanging-knee-raise',
    'dead-hang',
  ],
} satisfies ExerciseOverlay
