import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-hip-thrust',
  metaDescription: 'Machine hip thrust: pad height, lockout, and how to log glute machines separately from barbell hip thrusts in LIFTAG.',
  steps: [
    'Set the back pad so it supports you near the lower shoulder blades, not the neck. Belt or lever sits on the hip crease.',
    'Plant the feet where the shins can finish near vertical at the top. Too far forward and it becomes an awkward bridge; too close and the knees take over.',
    'Brace, ribs down, then drive through the whole foot until the hips are fully open and the glutes are doing the lockout.',
    'Lower under control. Do not bounce the plates or the stack off the bottom unless you like noisy half-range sets.',
  ],
  mistakes: [
    { title: 'Overextending the lumbar at lockout', body: 'The glutes finish the lift. If the low back takes over, drop the ribcage and the load. A higher pad is not a better squeeze.' },
    { title: 'Logging this as barbell hip thrust', body: 'Different setup, different loading, different PR. Keep this slug. Scan the tag on the machine so it does not open the barbell lift.' },
    { title: 'Feet so far forward the hamstrings steal every rep', body: 'Nudge the feet in until the shins are close to vertical at the top. Hamstring work is fine; accidental RDLs on a glute machine are not the plan.' },
    { title: 'Bouncing out of the bottom', body: 'If the belt has to rebound you into the next rep, the range is fake. Pause a centimeter off the bottom or drop a plate.' },
  ],
  variations: [
    { slug: 'barbell-hip-thrust', name: 'Barbell hip thrust', note: 'Bench and bar, more setup, same pattern.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Floor version, shorter range, no machine.' },
    { slug: 'smith-machine-hip-thrust', name: 'Smith machine hip thrust', note: 'When the gym has a Smith and a bench but no hip-thrust unit.' },
    { slug: 'cable-pull-through', name: 'Cable pull-through', note: 'Hinge-biased glute work from a standing start.' },
  ],
  progressions: [
    'Bodyweight or empty lever until the lockout is a squeeze, not a heave.',
    'Working sets of 8–12 with ribs down at the top.',
    'Pause at lockout before you add load.',
    'Single-leg or banded versions only after the bilateral machine groove is clean — note them.',
  ],
  programming: 'Main glute lift on machine days: 3–4 sets of 8–12. If you barbell-thrust on other days, that is a different slug so the chart stays clean. Log the stack or the plate load the machine actually shows, and use the same unit week to week.',
  faqs: [
    {
      question: 'Machine or barbell hip thrust — which should I log?',
      answer: 'Whichever one you sat in. The machine removes the bar-setup tax and usually changes what you can load. Mixing them on barbell-hip-thrust makes both PRs meaningless.',
    },
  ],
  relatedSlugs: [
    'barbell-hip-thrust',
    'glute-bridge',
    'smith-machine-hip-thrust',
    'cable-pull-through',
  ],
} satisfies ExerciseOverlay
