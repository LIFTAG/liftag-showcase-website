import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 't-bar-row',
  metaDescription: 'T-bar row: landmine setup, plate clearance, and how to log it separately from chest-supported T-bar in LIFTAG.',
  steps: [
    'Anchor one end of the bar in a landmine or a stable corner. Load the free end. Straddle it and attach a close-row handle around the sleeve.',
    'Hinge with a braced trunk until the arms are long. The plates should clear your chest at the top — small plates or a raised stance if 20 kg bumpers block the path.',
    'Pull the handle to the lower chest or upper abdomen. Elbows follow the handle; the torso angle does not change.',
    'Lower until the arms are long. Do not dump the plates into the floor and bounce the next rep.',
  ],
  mistakes: [
    { title: 'Standing up as the load climbs', body: 'Same cheat as a barbell row. If the hinge rises, drop a plate.' },
    { title: 'A sliding corner instead of a landmine', body: 'If the anchor walks, the bar path walks. Use a sleeve or a true landmine.' },
    { title: 'Logging chest-supported T-bar here', body: 'Pad support is a different lift and a different PR. Chest-supported T-bar row has its own slug.' },
    { title: 'Oversized plates killing the range', body: 'The bar travels in an arc. If 20s hit your chest early, use 10s or stand on blocks so the elbows can finish.' },
  ],
  variations: [
    { slug: 'chest-supported-t-bar-row', name: 'Chest-supported T-bar row', note: 'Same station family, pad takes the hinge.' },
    { slug: 'landmine-row', name: 'Landmine row', note: 'Same bar, often a different handle and a slightly more upright option.' },
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'Straight bar, more freedom, more low-back tax.' },
    { slug: 'machine-seated-row', name: 'Machine seated row', note: 'When you want the pull without holding a hinge.' },
  ],
  progressions: [
    'Chest-supported T-bar or machine row until the elbow path is automatic.',
    'Light T-bar with small plates and a still hinge.',
    'Working sets of 6–10. Add a plate when the last rep still touches the same spot.',
    'Neutral vs wide handles as a variation, not a new max — note the handle.',
  ],
  programming: 'A meat-and-potatoes back builder: 3–4 sets of 6–12. It loads heavier than a dumbbell row for most lifters. Log the plate load, not “plus the bar,” the same way every week so the chart is comparable.',
  relatedSlugs: [
    'chest-supported-t-bar-row',
    'landmine-row',
    'barbell-bent-over-row',
    'machine-seated-row',
  ],
} satisfies ExerciseOverlay
