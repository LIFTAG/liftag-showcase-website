import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'overhead-cable-triceps-extension',
  metaDescription: 'Overhead cable triceps extension: rope setup, elbow position, and how to log long-head cable work in LIFTAG without mixing it into pushdowns.',
  steps: [
    'Clip a rope to a low or mid pulley, face away from the stack, and step into a split stance until the cable is taut.',
    'Bring the rope behind the head with the elbows bent and pointed forward, not flared to the sides. Ribs stay down.',
    'Straighten the elbows until the rope ends separate slightly at lockout. The upper arms barely move.',
    'Return until you feel a long-head stretch, not until the stack slams or the elbows drift into a pushdown.',
  ],
  mistakes: [
    { title: 'Turning it into a pushdown halfway through the set', body: 'If the elbows creep down toward the ribs, you are no longer overhead. Reset the upper arms by the ears or drop the pin.' },
    { title: 'Flaring the ribs to fake the stretch', body: 'Lumbar extension is not triceps length. Brace, keep the ribs over the pelvis, and take the range the shoulders allow.' },
    { title: 'Logging this as a cable pushdown', body: 'Overhead vs pushdown is a different long-head demand and a different load. Keep this slug. Single-arm overhead work has its own slug too.' },
    { title: 'Slamming the lockout with a shrug', body: 'The triceps finish the elbow. If the shoulders jump, the stack is too heavy.' },
  ],
  variations: [
    { slug: 'seated-overhead-dumbbell-triceps-extension', name: 'Seated overhead dumbbell triceps extension', note: 'Free-weight overhead pattern, less constant tension.' },
    { slug: 'single-arm-overhead-cable-triceps-extension', name: 'Single-arm overhead cable triceps extension', note: 'Fixes a side-to-side gap; log it separately.' },
    { slug: 'cable-triceps-pushdown', name: 'Rope triceps pushdown', note: 'Elbows by the ribs instead of by the ears.' },
    { slug: 'ez-bar-skullcrusher', name: 'EZ-bar skullcrusher', note: 'Lying isolation when the cable station is taken.' },
  ],
  progressions: [
    'Light rope, full stretch, quiet ribs.',
    'Add load when every lockout stays overhead instead of drifting into a pushdown.',
    'Pause in the stretch before you chase a heavier pin.',
    'Single-arm version only after the two-arm groove is automatic.',
  ],
  programming: 'Long-head accessory: 3–4 sets of 10–15 after a press or pushdown, not both heavy overheads on the same day. Scan the high/low pulley tag if the gym has one — it should open this slug, not the pushdown. Rest just long enough that the stretch does not turn into a heave.',
  faqs: [
    {
      question: 'Rope or bar for overhead cable extensions?',
      answer: 'A rope usually lets the wrists and elbows find a friendlier line and gives you a split at lockout. A bar is fine if that is what is on the cable. Note the attachment if you switch; the load will not match.',
    },
  ],
  relatedSlugs: [
    'cable-triceps-pushdown',
    'seated-overhead-dumbbell-triceps-extension',
    'ez-bar-skullcrusher',
    'close-grip-bench-press',
  ],
} satisfies ExerciseOverlay
