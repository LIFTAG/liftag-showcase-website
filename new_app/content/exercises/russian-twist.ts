import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'russian-twist',
  metaDescription: 'Russian twist: seated rotation, a quiet pelvis, and how to log left-right twists in LIFTAG without dumping them onto crunch or hanging-leg-raise charts.',
  steps: [
    'Sit, lean back until the abs turn on, and keep a long spine. Heels down to start. A hollow flop with a rounded low back is not a setup.',
    'Hands together at the chest, or hug a light plate there. Long arms with a plate at the end of the lever make the arms do the twist.',
    'Rotate the rib cage. The pelvis stays roughly square. Touch the floor beside the hip only if the torso actually turned.',
    'Come through the middle under control and rotate the other way. Do not bounce from side to side on a collapsed lumbar.',
    'Breathe. Pick a rep rule before the set: each touch, or a left-right pair as one. Log it the same way next week.',
  ],
  mistakes: [
    { title: 'Swinging the plate while the torso sits still', body: 'If the arms draw a windshield wiper and the ribs never turn, it is not a twist. Shorten the lever. Hands at the chest. Slow down.' },
    { title: 'Rounding into a sit-up and flopping', body: 'A tucked, bouncing crunch with a side tap is still a crunch with extra steps. Lean back, stay long, rotate. If you cannot, sit taller and lose the plate.' },
    { title: 'Counting left and right like two different lifts', body: 'Pick touches or pairs and write it in the first set note. Switching the count mid-block is a fake volume PR in LIFTAG.' },
    { title: 'Feet flying, using the legs as a pendulum', body: 'Heels down until the pelvis stays quiet. Heels-up is a harder brace, not a way to cheat the rotation with a kick.' },
  ],
  variations: [
    { slug: 'plank', name: 'Plank', note: 'Anti-rotation brace when the twist turns into a flop.' },
    { slug: 'crunch', name: 'Crunch', note: 'Sagittal curl. Do not log twists as crunches because both “feel like abs.”' },
    { slug: 'hanging-leg-raise', name: 'Hanging leg raise', note: 'Hanging flexion if you want legs moving instead of a seated turn.' },
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Loaded curl, no rotation, when the twist is not the goal.' },
  ],
  progressions: [
    'Bodyweight, heels down, slow turns, pause each side.',
    'Light plate hugged at the chest once the pelvis stays put.',
    'Heels up only after the brace holds for the whole set.',
    'Add load slowly. Rotation does not need a 20 kg plate to count.',
  ],
  programming: 'Accessory rotation: 3 sets of 10–16 total touches, or 8–12 per side. Note which count you used. Log the plate if you hold one. Do not dump this onto crunch, plank, or hanging-leg-raise because the abs burned. Rest enough that the next set still rotates the ribs, not the arms.',
  faqs: [
    {
      question: 'Do I count each side as a rep?',
      answer: 'Either rule is fine if you keep it. Each floor touch, or a left-right pair as one rep. Put the rule in the first LIFTAG set note and do not switch it mid-block just to make the number bigger.',
    },
  ],
  relatedSlugs: [
    'plank',
    'hanging-leg-raise',
    'machine-ab-crunch',
    'crunch',
  ],
} satisfies ExerciseOverlay
