import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pec-deck-flys',
  metaDescription: 'Pec deck flys: seat height, elbow angle, and how to log chest isolation on the machine in LIFTAG.',
  steps: [
    'Set the seat so the handles or pads sit at mid-chest with the shoulders down.',
    'Keep a soft bend in the elbows and the same bend the whole way. This is not a press.',
    'Bring the pads together without shrugging. Return until you feel a chest stretch, not a shoulder dump.',
  ],
  mistakes: [
    { title: 'Turning it into a press', body: 'If the elbows travel like a chest press, you picked the wrong machine movement. Stay in a fly arc.' },
    { title: 'Bouncing the stack at the stretch', body: 'The stretch is the work. Control it or reduce the pin.' },
  ],
  variations: [
    { slug: 'flat-bench-dumbbell-fly', name: 'Flat bench dumbbell fly', note: 'Free-weight version, harder to stabilize.' },
    { slug: 'standing-cable-crossover', name: 'Standing cable crossover', note: 'Cables, more freedom to pick the line.' },
  ],
  progressions: ['Light stack, two-second squeeze.', 'Add load when the stretch stays quiet in the shoulder.'],
  programming: 'Isolation after a press. 2–4 sets of 10–15. Scan the pec-deck tag so this does not land on machine chest press in the log.',
  relatedSlugs: ['machine-chest-press', 'flat-bench-dumbbell-fly', 'standing-cable-crossover'],
} satisfies ExerciseOverlay
