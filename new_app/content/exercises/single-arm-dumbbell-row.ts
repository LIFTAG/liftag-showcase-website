import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'single-arm-dumbbell-row',
  metaDescription: 'Single-arm dumbbell row: bench setup, elbow-to-hip path, and a row that does not turn into a twist.',
  steps: [
    'One hand and the same-side knee on a bench, or a split stance with the free hand on a rack. Let the dumbbell hang under the working shoulder.',
    'Square the hips and ribs. Neck long. The support is there so you can row, not so you can corkscrew.',
    'Pull the elbow toward the hip or lower ribs. Stop when the upper arm is in line with the torso — extra height is usually a shrug.',
    'Lower slowly and let the shoulder blade reach forward. That stretch is the next rep’s start.',
    'Match reps both sides. If one side is two reps short, that side sets the load.',
  ],
  mistakes: [
    { title: 'Twisting the torso open', body: 'A little rotation is a different variation. On this slug, keep the belt buckle facing the bench.' },
    { title: 'Shrugging the dumbbell to the armpit', body: 'Elbow to hip, not ear. If the trap takes over, pause at the top with the shoulder down.' },
    { title: 'Starting with the bell already at the ribs', body: 'If you skip the hang, you skipped the lat. Use a bench high enough that the bell can hang clear of the floor.' },
    { title: 'Logging only the strong side', body: 'Both arms are the set. If you do 10 and 7, log 7 or log them as separate sets with a side note.' },
  ],
  variations: [
    { slug: 'incline-dumbbell-row', name: 'Incline dumbbell row', note: 'Chest on an incline bench, both arms, no twist available.' },
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'Bilateral, more load, more low-back demand.' },
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'Machine tension when you want even sides without a bench.' },
    { slug: 'renegade-row', name: 'Renegade row', note: 'Plank version. Much less load, much more anti-rotation.' },
  ],
  progressions: [
    'Inverted row or machine row until a one-arm hinge feels obvious.',
    'Light dumbbell, full hang, no twist, three-second lower.',
    'Working sets of 8–12. The weaker side chooses the dumbbell.',
    'Chest-supported incline rows if the low back is the limiter, not the lat.',
  ],
  programming: 'Accessory row that still loads: 3–4 sets of 8–12 after a main pull. Do not pair it with a heavy barbell row and a heavy pulldown on the same day unless recovery is actually there. Log the dumbbell weight — “heavy DB” is not a progression.',
  relatedSlugs: [
    'incline-dumbbell-row',
    'barbell-bent-over-row',
    'machine-seated-row',
    'seated-cable-row',
  ],
} satisfies ExerciseOverlay
