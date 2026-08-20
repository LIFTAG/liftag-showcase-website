import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'crunch',
  metaDescription: 'Crunch: floor rib-to-pelvis curl, not a sit-up, and how to log bodyweight crunches in LIFTAG without mixing them into sit-up or machine-ab-crunch charts.',
  steps: [
    'Lie on your back, knees bent, feet on the floor. Hands on the chest or fingertips at the temples. Do not lace the fingers behind the head and yank.',
    'Tip the pelvis so the low back is quiet on the floor. Ribs down. That is the start. A gap under the lumbar is a sit-up waiting to happen.',
    'Exhale and curl the rib cage toward the pelvis. Shoulder blades leave the floor. Hips stay down. Eyes on the ceiling, not the knees.',
    'Lower the shoulders until the blades kiss the floor. Pause. The next rep starts there, not from a bounce.',
    'If the feet fly or the hip flexors take the set, shorten the curl. This is not a sit-up you cut in half.',
  ],
  mistakes: [
    { title: 'Yanking the neck', body: 'Hands behind the head plus a pull is a neck set. Fingertips at the temples, elbows wide, chin slightly tucked. The ribs move. The head rides along.' },
    { title: 'Peeling the lumbar off the floor', body: 'Once the low back leaves, you are on sit-up. Curl the ribs. If you keep coming up to seated, switch slugs instead of pretending the range is extra credit.' },
    { title: 'Logging sit-ups or the crunch machine here', body: 'Floor bodyweight, sit-up, and machine-ab-crunch are three charts. Scan the floor slug for this. The pad with a stack is not this lift.' },
    { title: 'Bouncing off the shoulder blades', body: 'A flop and a snap is momentum. Pause on the floor, then curl. If you need the bounce, you already used the reps that counted.' },
  ],
  variations: [
    { slug: 'sit-up', name: 'Sit-up', note: 'Lumbar leaves the floor. Different slug, different hip-flexor tax.' },
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Loaded pad. Scan that frame, not this floor slug.' },
    { slug: 'reverse-crunch', name: 'Reverse crunch', note: 'Pelvis toward ribs when the hip flexors steal the floor crunch.' },
    { slug: 'kneeling-cable-crunch', name: 'Kneeling cable crunch', note: 'Cable curl when you want load without turning it into a sit-up.' },
  ],
  progressions: [
    'Hands on the chest, slow curl, pause at the top, low back glued down.',
    'Fingertips at the temples once the neck stays quiet.',
    'Add a plate on the chest only after the curl is clean. Log the plate.',
    'Reverse crunch or the machine when you need load the floor cannot give.',
  ],
  programming: 'Isolation after the main lifts: 3 sets of 12–20. Log reps. If you hold a plate, log that weight. Floor crunch stays on this slug. Sit-up and machine-ab-crunch are different PRs. Pair with a plank or a hanging raise, not with another crunch variation in the same slot just to feel busy.',
  equipmentAlternatives: [
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Use the stack when the floor is not enough load and the pad fits you.' },
    { slug: 'kneeling-cable-crunch', name: 'Kneeling cable crunch', note: 'Same rib-to-pelvis idea with a cable when there is no crunch machine.' },
    { slug: 'plank', name: 'Plank', note: 'Brace instead of curl if flexion bothers the back today.' },
  ],
  faqs: [
    {
      question: 'Is a crunch just a short sit-up?',
      answer: 'No. A sit-up peels the lumbar and uses the hip flexors to a seated position. A crunch is rib cage toward pelvis with the low back down. If you sat up, log sit-up. If you used the pad and the stack, log machine-ab-crunch.',
    },
  ],
  relatedSlugs: [
    'machine-ab-crunch',
    'plank',
    'reverse-crunch',
    'sit-up',
  ],
} satisfies ExerciseOverlay
