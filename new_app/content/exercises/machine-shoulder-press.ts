import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-shoulder-press',
  metaDescription: 'Machine shoulder press: seat height, handle path, and scanning the right tag so stacked overhead work lands in LIFTAG.',
  steps: [
    'Set the seat so the handles start around ear to chin height. If they start above your head, you are already at lockout.',
    'Upper back on the pad, feet planted. Take a grip that lets the elbows stay under the wrists, not behind the machine.',
    'Press to a soft lockout without shrugging into the neck. Keep the ribs on the pad — peeling off to finish is a standing press in a seat.',
    'Lower until you feel a shoulder stretch, not until the stack slams. Reset the shoulder blades before the next rep.',
  ],
  mistakes: [
    { title: 'Seat so high the first inch is a shrug', body: 'Drop the seat. Overhead machines hide a bad setup better than a barbell does, and then the neck does the work.' },
    { title: 'Logging every press machine as this lift', body: 'Chest press, incline press, and shoulder press are different slugs. Scan the tag on this frame. If it opens a chest press, tell the gym — the log should match the machine.' },
    { title: 'Bouncing the stack off the bottom', body: 'The stretch is the work. If you need the plates to rebound, the pin is too heavy or the seat is wrong.' },
    { title: 'Switching plate-loaded and selectorized without a note', body: 'They are not the same lever. Put the machine name in a set note if you bounce between them, or LIFTAG’s estimated 1RM is noise.' },
  ],
  variations: [
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Free-weight version of the same pattern.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Independent handles, longer range.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'When the machine’s path does not match your shoulders.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'Horizontal machine press — do not log it here just because it is a stack.' },
  ],
  progressions: [
    'Light stack, full range, no bounce, head against the pad.',
    'Add a pin when the last two reps still finish without the ribs coming off.',
    'Harder handle or a converging machine once the straight path is easy.',
  ],
  programming: 'Machine overhead press is weekly shoulder volume you can do without a spotter. Three to four sets of 8–12. At a partner gym the QR or NFC tag on this frame should open this slug. Pair it with laterals, not with a heavy standing press on the same day unless recovery is actually there.',
  equipmentAlternatives: [
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Default free-weight swap when the machine line is long.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Use when you want a walk-out and a stricter PR.' },
  ],
  relatedSlugs: [
    'seated-dumbbell-shoulder-press',
    'standing-barbell-overhead-press',
    'landmine-press',
    'machine-chest-press',
    'cable-lateral-raise',
  ],
} satisfies ExerciseOverlay
