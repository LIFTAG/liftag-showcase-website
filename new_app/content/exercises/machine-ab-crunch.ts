import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-ab-crunch',
  metaDescription: 'Machine ab crunch: seat setup, rib-to-pelvis curl, and how to log the crunch machine without mixing it into floor crunches in LIFTAG.',
  steps: [
    'Set the seat, chest or shoulder pad, and foot supports so the machine’s axis sits around the mid-ribs, not on the hips.',
    'Brace, grab the handles or take the pad, and start tall. This is a curl, not a sit-up you bought a stack for.',
    'Exhale and curl the rib cage toward the pelvis. The hips stay relatively quiet; the spine flexes.',
    'Return until you are tall again without the stack slamming. Stretch is fine; a bounce is not a rep.',
  ],
  mistakes: [
    { title: 'Hip-flexor yanking the pad down', body: 'If you feel it mostly in the front of the hips, you are folding at the hip, not curling the trunk. Shorten the range and slow the eccentric.' },
    { title: 'Seat so high you shrug the pad', body: 'The machine should load the abs, not the traps. Drop the seat until the pad sits on the chest or shoulders and the axis matches the ribs.' },
    { title: 'Logging this as a floor crunch', body: 'Loaded machine vs bodyweight floor is a different chart. Scan the tag on this frame so LIFTAG opens machine-ab-crunch.' },
    { title: 'Bouncing the stack off the top pins', body: 'The curl is the work. If you need the bounce, drop a plate and pause at the bottom of the curl.' },
  ],
  variations: [
    { slug: 'crunch', name: 'Crunch', note: 'Floor version, no stack, same rib-to-pelvis idea.' },
    { slug: 'kneeling-cable-crunch', name: 'Kneeling cable crunch', note: 'Cable line of pull when the machine is taken or the pad does not fit you.' },
    { slug: 'hanging-leg-raise', name: 'Hanging leg raise', note: 'Hanging flexion if you want legs moving instead of a pad.' },
    { slug: 'reverse-crunch', name: 'Reverse crunch', note: 'Pelvis toward ribs when the hip flexors dominate the machine.' },
  ],
  progressions: [
    'Light pin, two-second curl, two-second return.',
    'Add load when the hips stay quiet for all reps.',
    'Pause in the contracted position before you chase a heavier stack.',
    'Move to kneeling cable crunches if the machine’s axis never matches your torso.',
  ],
  programming: 'Isolation after the main lifts: 3 sets of 10–15. It is not a deadlift. At a partner gym the QR or NFC tag on this frame should open this slug — if it opens crunch or sit-up, tell the gym so the log stays honest. Pair with a hanging raise or a Pallof press, not with another crunch machine.',
  relatedSlugs: [
    'crunch',
    'kneeling-cable-crunch',
    'hanging-leg-raise',
    'russian-twist',
  ],
} satisfies ExerciseOverlay
