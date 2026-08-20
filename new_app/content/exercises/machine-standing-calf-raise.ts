import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-standing-calf-raise',
  metaDescription: 'Machine standing calf raise: pad height, ankle range, and how to log straight-knee calf work separately from seated raises in LIFTAG.',
  steps: [
    'Shoulder pads snug enough to load the calves, not crush the neck. Balls of the feet on the platform, heels hanging.',
    'Knees straight but not forcefully locked. Unrack and drop into a stretch you control.',
    'Rise onto the big-toe mound until the ankle is fully plantarflexed. Pause. Do not bounce the knees.',
    'Lower under control. Re-rack with the hands on the safety, not a hope.',
  ],
  mistakes: [
    { title: 'Bending the knees into a squat-calf hybrid', body: 'Once the knees flex, you stole the set from the gastrocnemius. Soften them a hair, then keep that angle.' },
    { title: 'Using the quads to bounce', body: 'A dip-and-drive is a quarter squat. The calves should move the load, not a rebound off the platform.' },
    { title: 'Rushing the stretch', body: 'The hard part is the bottom. If the heels never drop, you are training the top inch of a calf raise.' },
    { title: 'Logging standing and seated as one lift', body: 'Straight-knee and bent-knee are different charts. Keep this slug.' },
  ],
  variations: [
    { slug: 'seated-calf-raise', name: 'Seated calf raise', note: 'Bent-knee soleus work. Pair it; do not replace this with it and call it the same thing.' },
    { slug: 'standing-dumbbell-calf-raise', name: 'Standing dumbbell calf raise', note: 'No standing machine. Hold dumbbells and use a step.' },
    { slug: 'bodyweight-calf-raise', name: 'Bodyweight calf raise', note: 'Unload it. Keep the stretch.' },
    { slug: 'leg-press-calf-raises', name: 'Leg press calf raises', note: 'Sled version when the standing unit is a queue.' },
  ],
  progressions: [
    'Bodyweight calf raise to a full stretch on a step.',
    'Machine standing with pauses at both ends.',
    'Add load when the stretch never shortens across the set.',
    'Single-leg standing if one side always cheats the lockout.',
  ],
  programming: '3–4 sets of 8–15. Straight-knee work hits more gastrocnemius than the seated raise. Rest is short compared with squats — 60–90 seconds is plenty if the last rep still has a pause. Do not let a standing PR leak onto the seated-calf chart.',
  equipmentAlternatives: [
    { slug: 'standing-dumbbell-calf-raise', name: 'Standing dumbbell calf raise', note: 'Home gym or a floor that only has dumbbells.' },
    { slug: 'seated-calf-raise', name: 'Seated calf raise', note: 'Keep calf volume when the standing machine is down.' },
  ],
  relatedSlugs: [
    'seated-calf-raise',
    'standing-dumbbell-calf-raise',
    'bodyweight-calf-raise',
    'leg-press-calf-raises',
  ],
} satisfies ExerciseOverlay
