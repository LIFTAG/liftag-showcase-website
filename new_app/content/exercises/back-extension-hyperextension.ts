import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'back-extension-hyperextension',
  metaDescription: 'Back extension (hyperextension): hip hinge on the hyper bench, finish at neutral, and how to log it in LIFTAG without mixing RDL or good-morning numbers.',
  steps: [
    'Set the pad at the hip crease, not under the belly. Thighs supported, ankles hooked. You should be able to fold at the hips, not at the waist.',
    'Start long: glutes on, ribs down, neck in line. Hands across the chest. Behind the head only after the line is easy.',
    'Hinge until the hamstrings or the brace run out. A rag-doll hang is extra range you will pay for on the way up.',
    'Drive the hips into the pad and come up to a straight line. That is the finish. A cobra past neutral is lumbar compression, not extra glute.',
    'If you load it, hug a plate to the chest. Log the plate. Behind-the-head load comes later, if at all.',
  ],
  mistakes: [
    { title: 'Coming up past a straight line', body: 'The name says hyperextension. The lift does not. Stop at a long body. If you want more work, slow the lower or add a plate, do not backbend.' },
    { title: 'Pad too high, turning it into a sit-up', body: 'If the pad is on the stomach, you are flexing the spine against a block. Drop the pad to the hips and hinge.' },
    { title: 'Logging these as good mornings or RDLs', body: 'Bar on the back or bar in the hands is a different lever. Keep this slug even if the hinge looks similar on film.' },
    { title: 'Yanking up with a rounded back', body: 'Then it is a loaded stretch you jerked out of. Set the brace at the bottom, then stand. Cut the range if you cannot.' },
  ],
  variations: [
    { slug: 'barbell-good-morning', name: 'Barbell good morning', note: 'Same hinge, bar on the back, more axial load. Different slug.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hands on the bar. The default hinge for most lifters.' },
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Floor pull. The hyper is accessory, not a deadlift substitute in the log.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Hip extension on the floor when there is no hyper bench.' },
  ],
  progressions: [
    'Bodyweight, hands on the chest, stop at a long line.',
    'Hands behind the head once the finish stays neutral.',
    'Plate at the chest. Log the plate, not a guess.',
    'Slow lowers if you run out of honest range before you run out of load.',
  ],
  programming: 'Accessory hinge: 3–4 sets of 8–15 after a pull or on a second posterior day. Bodyweight can log as reps with no load. A plate belongs in the weight field. Do not feed these numbers into an RDL or good-morning estimated 1RM. If last week’s note says you backbent at the top, that is the cue for this week, not a reason to add 5 kg.',
  equipmentAlternatives: [
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell RDL', note: 'Default hinge when the gym has no 45° bench and no GHD.' },
    { slug: 'barbell-good-morning', name: 'Barbell good morning', note: 'Keep the hinge with a bar on the back if you want more axial load.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Floor hip extension when the hyper is taken or you are training at home.' },
  ],
  faqs: [
    {
      question: 'Should I come up past parallel into a backbend?',
      answer: 'No. Neutral is the finish. A cobra at the top loads the lumbar, not extra glute. If you want harder work, pause at the top, slow the eccentric, or hug a plate. Log that plate so the chart matches the set you actually did.',
    },
  ],
  relatedSlugs: [
    'barbell-good-morning',
    'barbell-romanian-deadlift-rdl',
    'conventional-deadlift',
    'nordic-hamstring-curl',
  ],
} satisfies ExerciseOverlay
