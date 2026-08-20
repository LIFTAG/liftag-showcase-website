import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-good-morning',
  metaDescription: 'Barbell good morning: bar placement, hinge depth, and how to log it separately from RDLs and back squats in LIFTAG.',
  steps: [
    'Set a light bar on the upper traps as for a high-bar squat. Walk out, brace, and soften the knees.',
    'Push the hips back. Shin angle stays almost still. The bar stays over mid-foot.',
    'Stop when the hamstrings or the back position run out — often near parallel, sooner if the lumbar starts to round.',
    'Drive the hips forward to stand. Re-brace before the next rep. Rack it like a squat, with pins set.',
  ],
  mistakes: [
    { title: 'Loading it like a back squat', body: 'The bar is farther from the hips than an RDL. Many lifters live around 30–50% of squat. If you squat the bar down, it is too heavy.' },
    { title: 'Knees traveling forward', body: 'That is a squat with a terrible bar position. Unlock the knees once, then hinge.' },
    { title: 'Rounding the lumbar to chase depth', body: 'Range is the last honest back angle, not a target torso number. Cut it short and keep the brace.' },
    { title: 'Logging good mornings as RDLs', body: 'Bar on the back is a different lever. Keep this slug so the RDL chart is still a hinge from the hands.' },
  ],
  variations: [
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hands on the bar, easier to dose, the default hinge for most lifters.' },
    { slug: 'belt-squat-good-morning', name: 'Belt squat good morning', note: 'Same hinge with the load on the hips when the spine is cooked.' },
    { slug: 'dumbbell-romanian-deadlift', name: 'Dumbbell Romanian deadlift', note: 'Teaching hinge and a travel substitute.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'Knee flexion if the hinge is not the weak point.' },
  ],
  progressions: [
    'Dowel good morning until the hinge is automatic.',
    'Empty bar in the rack with pins set just below the planned torso angle.',
    'Working sets well below squat load. Add kilos when the back angle never changes.',
    'Pause at the bottom once you stop diving for depth.',
  ],
  programming: 'Accessory hinge: 3–4 sets of 5–10 after the squat or on a second posterior day. Do them in a rack. If last week’s LIFTAG note says the back rounded at parallel, that is the range — not a cue to add 10 kg.',
  equipmentAlternatives: [
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell RDL', note: 'Default swap when you do not want a bar on the back.' },
    { slug: 'belt-squat-good-morning', name: 'Belt squat good morning', note: 'Keep the pattern when axial loading is the problem.' },
  ],
  faqs: [
    {
      question: 'Are good mornings dangerous?',
      answer: 'They are unforgiving of ego. Light bar, hard brace, pins in the rack, range you can own. Loaded like a squat, they are a bad idea. Loaded like a hinge, they are a useful accessory.',
    },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'belt-squat-good-morning',
    'barbell-back-squat',
    'nordic-hamstring-curl',
  ],
} satisfies ExerciseOverlay
