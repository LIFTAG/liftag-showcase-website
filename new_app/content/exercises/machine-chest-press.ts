import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-chest-press',
  metaDescription: 'Machine chest press: seat height, handle choice, and how to log gym machine presses in LIFTAG so a scan opens the right lift.',
  steps: [
    'Set the seat so the handles meet the mid-chest. Too high and you shrug; too low and you press into the shoulders.',
    'Plant the feet, glue the upper back to the pad, and take a grip that lets the elbows stay under the wrists.',
    'Press to a soft lockout without losing contact with the pad. Return until you feel a stretch, not until the stack slams.',
  ],
  mistakes: [
    { title: 'Letting the head and ribs come off the pad', body: 'You just turned a machine press into a messy floor press. Stay on the pad.' },
    { title: 'Logging every chest machine as this lift', body: 'Incline, decline, and pec-deck are different slugs. Scan the tag — LIFTAG opens the one on that frame.' },
  ],
  variations: [
    { slug: 'machine-incline-chest-press', name: 'Machine incline chest press', note: 'Upper-chest machine counterpart.' },
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Isolation on a similar footprint.' },
    { slug: 'barbell-bench-press', name: 'Barbell bench press', note: 'Free-weight version of the pattern.' },
  ],
  progressions: [
    'Light stack, full range, no bounce.',
    'Add plates or pins when the last two reps are still clean.',
  ],
  programming: 'Machine press is weekly chest volume you can do without a spotter. 3–4 sets of 8–15. At a partner gym, the QR or NFC tag on this frame should open this slug — if it opens a different press, tell the gym so the log stays honest.',
  relatedSlugs: ['barbell-bench-press', 'pec-deck-flys', 'machine-incline-chest-press'],
} satisfies ExerciseOverlay
