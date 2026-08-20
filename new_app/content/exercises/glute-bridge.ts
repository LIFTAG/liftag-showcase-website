import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'glute-bridge',
  metaDescription: 'Glute bridge: heels, ribcage, and a floor lockout, plus how to log this shorter-range pattern in LIFTAG without mixing it into barbell or machine hip thrusts.',
  steps: [
    'Lie on the floor. Feet flat, about hip-width. Shins should finish near vertical at the top, not a mile in front of you.',
    'Ribs down, then drive through the heels until the hips are fully open and the glutes are doing the lockout.',
    'Pause. Do not crank the lumbar into a second lockout. The floor is the range. There is no bench to extend over.',
    'Lower under control until the hips kiss the floor. Bounce is not a rep.',
    'If you load it, pad the hips and keep the same floor start. A bench under the back is a different lift.',
  ],
  mistakes: [
    { title: 'Overextending the lumbar at lockout', body: 'The glutes finish the lift. If the low back takes over, drop the ribcage and the load.' },
    { title: 'Logging this as a hip thrust', body: 'Floor cuts the range. Bench hip thrusts and machine hip thrusts have their own slugs. Keep this one honest.' },
    { title: 'Feet so far forward the hamstrings steal every rep', body: 'Nudge them in until the shins are close to vertical at the top. Hamstring work is fine. Accidental RDLs on the floor are not the plan.' },
    { title: 'Walking the feet in so close the knees take over', body: 'That is a weird floor press with the hips. Find the stance where the glutes, not the quads, close the hip.' },
  ],
  variations: [
    { slug: 'barbell-hip-thrust', name: 'Barbell hip thrust', note: 'Upper back on a bench. Longer range, more load, different PR.' },
    { slug: 'machine-hip-thrust', name: 'Machine hip thrust', note: 'Same longer-range pattern with a belt or lever.' },
    { slug: 'single-leg-glute-bridge', name: 'Single-leg glute bridge', note: 'Same floor, one leg. Harder without adding plates.' },
    { slug: 'cable-pull-through', name: 'Cable pull-through', note: 'Standing hinge when you want glutes without lying down.' },
  ],
  progressions: [
    'Bodyweight bridges with a pause at lockout and ribs down.',
    'Single-leg when one side always cheats the squeeze.',
    'Loaded floor bridge only after the lockout is a squeeze, not a heave.',
    'Move to a hip thrust when you want the extra range a bench gives you. Change the slug.',
  ],
  programming: 'Accessory or warm-up glute work: 3–4 sets of 8–15. Bodyweight is a valid load. Log it. If you put the upper back on a bench mid-block, switch to barbell-hip-thrust or machine-hip-thrust so next month’s chart is still a floor bridge.',
  equipmentAlternatives: [
    { slug: 'barbell-hip-thrust', name: 'Barbell hip thrust', note: 'Want more range and load. Use a bench, then leave this slug.' },
    { slug: 'cable-pull-through', name: 'Cable pull-through', note: 'Keep glute-hinge volume when the floor is crowded.' },
  ],
  faqs: [
    {
      question: 'Is a glute bridge just a light hip thrust?',
      answer: 'No. The floor stops the hips sooner. A thrust on a bench lets you open further and usually take more load. Same family, different range, different slug. Do not chase a hip-thrust number from a floor bridge.',
    },
  ],
  relatedSlugs: [
    'barbell-hip-thrust',
    'machine-hip-thrust',
    'cable-pull-through',
    'single-leg-glute-bridge',
  ],
} satisfies ExerciseOverlay
