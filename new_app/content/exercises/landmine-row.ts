import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'landmine-row',
  metaDescription: 'Landmine row: hinge, handle, and how it differs from T-bar and a one-arm Meadows pull on the same bar.',
  steps: [
    'Sleeve the bar in a landmine. Straddle it facing away from the anchor and attach a handle under the loaded end — V-handle, strap, or both hands on the sleeve.',
    'Hinge, knees soft, brace, and lift the load just clear of the floor. The torso stays in that hinge; a more upright start shortens the row.',
    'Pull the handle to the lower chest or upper abdomen. Elbows back, shoulders away from the ears.',
    'Lower until the arms are long without losing the hinge. No hip jerk to start the next rep.',
  ],
  mistakes: [
    { title: 'Hip-jerking the first inch', body: 'If the plates jump before the elbows move, it is a poorly braced RDL. Pause at the hang, then row.' },
    { title: 'Logging T-bar and landmine as one lift', body: 'T-bar-row is the close-handle straddle on this family. Keep this slug when the handle or stance is the landmine setup you actually use.' },
    { title: 'Meadows (one-arm, perpendicular) mixed in with no note', body: 'One-arm landmine rows are a different lever. If that is the programmed version, stay on this slug and put “Meadows” or “1-arm” in the set note so the load is not a surprise next week.' },
    { title: 'Anchor walking mid-set', body: 'A loose corner is not a landmine. If the sleeve slips, the path changes under you. Fix the anchor first.' },
  ],
  variations: [
    { slug: 't-bar-row', name: 'T-bar row', note: 'Same family, typically a dedicated close handle and a deeper hinge.' },
    { slug: 'chest-supported-t-bar-row', name: 'Chest-supported T-bar row', note: 'Pad takes the spinal-erector tax.' },
    { slug: 'single-arm-dumbbell-row', name: 'Single-arm dumbbell row', note: 'The dumbbell version of a one-arm landmine row.' },
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'Straight bar, two hands, more low-back demand.' },
  ],
  progressions: [
    'Chest-supported or dumbbell rows until the hinge stays still.',
    'Two-hand landmine rows with small plates so the arc has room.',
    'Working sets of 6–10. Add a plate when the torso angle does not rise.',
    'One-arm Meadows-style only after the two-hand version is boring. Note it.',
  ],
  programming: 'Useful when the gym has a landmine and no T-bar station: 3–4 sets of 6–12. The arc lets some shoulders row heavier than a straight bar. Log plates plus whether you counted the bar — pick a method and keep it.',
  relatedSlugs: [
    't-bar-row',
    'chest-supported-t-bar-row',
    'single-arm-dumbbell-row',
    'barbell-bent-over-row',
  ],
} satisfies ExerciseOverlay
