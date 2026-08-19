import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'close-grip-bench-press',
  metaDescription: 'Close-grip bench press: grip width, elbow path, and how to log it as a triceps press in LIFTAG instead of mixing it with flat bench.',
  steps: [
    'Grip just inside shoulder width. Thumbs still around the bar. A diamond grip is usually too narrow.',
    'Set the same upper-back shelf as a normal bench. Unrack and start above the lower chest.',
    'Keep the elbows closer to the torso on the way down. Touch lower on the chest than a wide-grip bench.',
    'Press to a full lockout. That last third is the triceps work you came for.',
  ],
  mistakes: [
    { title: 'Hands touching', body: 'That is a wrist injury waiting. Shoulder-width minus a hand is plenty close.' },
    { title: 'Logging close-grip as regular bench', body: 'The loads are different. Keep this slug so triceps volume is visible.' },
    { title: 'Flaring at the bottom anyway', body: 'If the elbows look like a wide bench, the grip change did nothing.' },
  ],
  variations: [
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'Wider grip, more pec.' },
    { slug: 'barbell-skullcrusher', name: 'Barbell skullcrusher', note: 'Isolation if the press is not the limiter.' },
    { slug: 'parallel-bar-triceps-dip', name: 'Parallel bar triceps dip', note: 'Bodyweight close-grip pattern.' },
  ],
  progressions: [
    'Close-grip push-ups.',
    'Light close-grip bench with a pause.',
    'Build toward the same working-rep ranges you use on regular bench, at a lower load.',
  ],
  programming: 'Run this as the main press on a triceps-priority day or as the second lift after regular bench. 3–5 sets of 5–8. Rest the same way you would for bench — LIFTAG’s timer exists so you do not rush lockouts.',
  relatedSlugs: ['barbell-bench-press', 'barbell-skullcrusher', 'cable-triceps-pushdown'],
} satisfies ExerciseOverlay
