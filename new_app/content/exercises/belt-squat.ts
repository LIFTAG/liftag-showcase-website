import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'belt-squat',
  metaDescription: 'Belt squat: belt fit, stance, and how to log hip-loaded squats in LIFTAG when the back cannot take a barbell.',
  steps: [
    'Cinch the belt around the hips, not the waist. Attach it to the pin or cable and stand even on the platform.',
    'Hands on the handles for balance only — they are not a lat pulldown.',
    'Sit between the legs to a depth you would count on a barbell squat. Whole foot stays down.',
    'Drive up without yanking the handles. Re-hook the load with control.',
  ],
  mistakes: [
    { title: 'Belt riding up onto the belly', body: 'If it sits on the waist, every rep is a gut punch and the hips never load. Pull it down onto the hip bones and retighten.' },
    { title: 'Turning it into an arm-assisted squat', body: 'Pulling the handles unloads the legs. Fingertips for balance. If you cannot let go, the load is too high.' },
    { title: 'Tiny range because the platform is in the way', body: 'Widen the stance, stand on blocks if the machine allows, or accept that this unit needs a different foot position. Do not quarter-squat a huge stack.' },
    { title: 'Logging belt squats as back squats', body: 'No axial bar. Different PR. Scan the belt-squat machine so this slug opens, not hack squat.' },
  ],
  variations: [
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'The free-weight version when the spine can take a bar again.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Sled squat with a back pad if the gym has no belt machine.' },
    { slug: 'pendulum-squat', name: 'Pendulum squat', note: 'Guided upright squat, still a machine, still not a belt.' },
    { slug: 'belt-squat-good-morning', name: 'Belt squat good morning', note: 'Same belt, hinge instead of squat, when the posterior chain is the target.' },
  ],
  progressions: [
    'Bodyweight squat to a depth you would count in a rack.',
    'Light belt squat until the belt placement is boring and the hands stay quiet.',
    'Working sets of 6–12. Add load when depth repeats.',
    'Pauses in the hole, or belt-squat good mornings, if the bottom is the weak point.',
  ],
  programming: 'Primary squat when the back is cooked, or the second squat of the week: 3–4 sets of 6–12. You can often push these harder than a bar squat on the same day — that is the point — but they still need rest. Do not paste the load onto barbell back squat in LIFTAG.',
  equipmentAlternatives: [
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Closest machine squat in gyms without a belt unit.' },
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Keep quad volume with no belt and no bar on the back.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'Return here when the spine is ready for axial load.' },
  ],
  faqs: [
    {
      question: 'Belt squat or hack squat?',
      answer: 'Belt squat hangs the load from the hips, so the spine is mostly a brace. Hack squat still loads you through the shoulders and a back pad. Use belt squat when the back is the limiter; log whichever machine you actually sat in.',
    },
  ],
  relatedSlugs: [
    'barbell-back-squat',
    'machine-hack-squat',
    'pendulum-squat',
    'belt-squat-good-morning',
  ],
} satisfies ExerciseOverlay
