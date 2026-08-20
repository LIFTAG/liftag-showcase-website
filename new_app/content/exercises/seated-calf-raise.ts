import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-calf-raise',
  metaDescription: 'Seated calf raise: pad position, full stretch, and how to log bent-knee soleus work separately from standing raises in LIFTAG.',
  steps: [
    'Pad on the lower quads, just above the knee — not on the kneecap. Balls of the feet on the platform, heels free.',
    'Unrack and drop the heels into a stretch you can hold. Knees stay bent.',
    'Press through the big-toe side of the foot to a hard lockout. Pause.',
    'Lower slowly. If the stack is bouncing, the load is theater.',
  ],
  mistakes: [
    { title: 'Pad on the kneecap', body: 'That is a joint, not a loading point. Slide the pad onto the lower quads so the force goes through muscle.' },
    { title: 'Bouncing out of the stretch', body: 'The seated raise is slow on purpose. Pause in the hole or drop the pin.' },
    { title: 'Partial pumps with a huge stack', body: 'A two-inch tick is not a calf raise. Stretch and lockout, or you are logging noise.' },
    { title: 'Logging it as a standing calf raise', body: 'Bent knees bias the soleus. Straight-knee work is a different slug. Keep them split in LIFTAG.' },
  ],
  variations: [
    { slug: 'machine-standing-calf-raise', name: 'Machine standing calf raise', note: 'Straight-knee, more gastrocnemius, the other half of calf day.' },
    { slug: 'standing-dumbbell-calf-raise', name: 'Standing dumbbell calf raise', note: 'No seated machine. Still a calf raise — log it on its own slug.' },
    { slug: 'leg-press-calf-raises', name: 'Leg press calf raises', note: 'Same ankle action on a sled when the seated unit is taken.' },
    { slug: 'bodyweight-calf-raise', name: 'Bodyweight calf raise', note: 'Travel and high-rep work with a full stretch on a step.' },
  ],
  progressions: [
    'Full-range light seated raises with a pause at the bottom.',
    'Pause at the top without rolling onto the outside of the foot.',
    'Single-leg seated when one side always cheats the stretch.',
    'Add load only when every work rep still has a stretch and a lockout.',
  ],
  programming: '3–4 sets of 8–15 after the squat or hinge. Calves recover faster than your ego thinks, but bounced half-reps still do not count. If you also do standing raises, that is a second lift — not a note on this one.',
  relatedSlugs: [
    'machine-standing-calf-raise',
    'standing-dumbbell-calf-raise',
    'leg-press-calf-raises',
    'bodyweight-calf-raise',
  ],
} satisfies ExerciseOverlay
