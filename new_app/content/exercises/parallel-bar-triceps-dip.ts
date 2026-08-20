import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'parallel-bar-triceps-dip',
  metaDescription: 'Parallel bar triceps dip: upright torso, depth, and how to log it separately from chest dips and machine dips in LIFTAG.',
  steps: [
    'Take the bars, lock out, and keep the torso relatively upright. Toes can point down; they should not drift into a chest-dip lean.',
    'Pack the shoulders down and slightly back. This is support, not a shrug hang.',
    'Bend the elbows and lower until the shoulders are at or just below elbow height — only as deep as the front of the shoulder stays quiet.',
    'Press to a full lockout without swinging the legs for the last three reps. Stop shy of a slam at the top.',
  ],
  mistakes: [
    { title: 'Leaning into a chest dip and logging it here', body: 'Forward lean belongs on chest-dips. Upright, elbows tracking back, is the triceps version. Pick a slug and match the torso.' },
    { title: 'Dumping into a deep bottom', body: 'Depth without packed shoulders is how this lift becomes a rehab appointment. Own a shorter range rather than a noisy one.' },
    { title: 'Kipping the last reps with the legs', body: 'If the hips have to throw you out of the hole, the set is over. End it or move to assisted-dip.' },
    { title: 'Not logging the dip belt', body: 'Bodyweight PRs and weighted PRs are different stories. When the belt goes on, log the extra kilograms or the chart never moves.' },
  ],
  variations: [
    { slug: 'chest-dips', name: 'Chest dips', note: 'Same bars, forward lean, more pec.' },
    { slug: 'machine-dip', name: 'Machine dip', note: 'Seated path when bars bother the shoulders or you want a stack.' },
    { slug: 'assisted-dip', name: 'Assisted dip', note: 'Counterweight until full-range bodyweight is clean.' },
    { slug: 'bench-triceps-dip', name: 'Bench triceps dip', note: 'Home-gym fallback with a much friendlier (and easier) range.' },
  ],
  progressions: [
    'Assisted dips or machine dips until a full-range support hold is easy.',
    'Bodyweight sets of 6–10 with an upright torso.',
    'Pause a beat just above the bottom before you add a belt.',
    'Dip-belt loading, logged as extra weight on this slug.',
  ],
  programming: 'Treat weighted triceps dips like a press: 3–4 hard sets. If chest dips are already in the session, this is usually a lighter second pass or a different day — the shoulders do not care that you renamed the lean. Rest as you would for close-grip bench; LIFTAG’s timer exists so you do not rush lockouts.',
  faqs: [
    {
      question: 'How deep should triceps dips go?',
      answer: 'To about upper-arm parallel, or slightly below, as long as the front of the shoulder feels stable. Deeper is not better if the shoulder rolls forward. Chest-dip depth with a lean is a different lift.',
    },
  ],
  relatedSlugs: [
    'chest-dips',
    'close-grip-bench-press',
    'machine-dip',
    'push-up',
  ],
} satisfies ExerciseOverlay
