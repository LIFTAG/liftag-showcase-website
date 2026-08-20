import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pendulum-squat',
  metaDescription: 'Pendulum squat: platform setup, arc path, and how to log lever-arm squats separately from hack squats in LIFTAG.',
  steps: [
    'Shoulders under the pads, feet on the platform where the arc lets you keep pressure through the whole foot.',
    'Unrack, brace, and sit into the machine’s path. The pendulum wants a more upright torso than a back squat.',
    'Descend until the hips are as deep as a squat you would count, without the low back peeling off the pad.',
    'Drive up through the mid-foot. Re-rack with the hands on the stop, not a dumped lockout.',
  ],
  mistakes: [
    { title: 'Feet so high it becomes a glute press', body: 'Fine if that is the point. If you wanted a squat, bring the feet down so the knees can travel.' },
    { title: 'Logging it as a hack squat', body: 'Different machine, different arc, different PR. The tag on the pendulum should open this slug.' },
    { title: 'Bouncing the lever at the bottom', body: 'The pendulum stores energy. A crash-and-rebound is not a quad set. Pause or control the last third.' },
    { title: 'Riding the toes', body: 'If the heels lift, the foot placement does not match the arc. Move the stance, do not shrug and keep loading.' },
  ],
  variations: [
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Linear sled if the gym has no pendulum.' },
    { slug: 'smith-machine-squat', name: 'Smith machine squat', note: 'Guided bar squat when you want a rail, not a lever.' },
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Seated sled, still machine quad volume.' },
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'Free-weight version of the pattern.' },
  ],
  progressions: [
    'Light pendulum to a full, quiet bottom.',
    'Add load when the back stays on the pad for every rep.',
    'Pause reps if you are using the lever’s bounce.',
    'Narrow stance or a slower eccentric once the groove is automatic.',
  ],
  programming: 'Quad-biased primary or second squat: 3–4 sets of 6–12. These often feel easier on the back than a bar squat at the same effort — log them here anyway. If you rotate pendulum and hack squat in the same mesocycle, that is two lifts, not one “machine squat” row.',
  equipmentAlternatives: [
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Default swap in gyms that never bought a pendulum.' },
    { slug: 'belt-squat', name: 'Belt squat', note: 'Unload the shoulders entirely if the pads are the problem.' },
  ],
  relatedSlugs: [
    'machine-hack-squat',
    'standard-leg-press',
    'barbell-back-squat',
    'smith-machine-squat',
  ],
} satisfies ExerciseOverlay
