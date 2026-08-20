import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-incline-chest-press',
  metaDescription: 'Machine incline chest press: seat height, handle path, and how to log upper-chest machine work separately from the flat press in LIFTAG.',
  steps: [
    'Set the seat so the handles start at the upper chest / clavicle line. Too low and you are on the flat-press machine in a different posture.',
    'Plant the feet, glue the pelvis and upper back to the pad, and take a grip that keeps the wrists stacked over the forearms.',
    'Press to a soft lockout without the shoulders shrugging into the ears. The pad contact is the shelf — do not lose it.',
    'Return until you feel an upper-chest stretch, not until the stack slams or the elbows dump behind the torso.',
    'If the arms are independent, finish both sides together. Note a lagging side instead of turning one handle into its own lift.',
  ],
  mistakes: [
    { title: 'Seat set like a flat machine press', body: 'Handles at nipple height on an incline frame is just a worse flat press. Raise the seat until the path matches the clavicles.' },
    { title: 'Elbows traveling so far back the shoulders dump', body: 'A machine will let you do this. Stop the eccentric when the upper arms are in line with the torso, not behind it.' },
    { title: 'Logging this as machine chest press', body: 'Different angle, different load, different chart. Scan the tag on this frame — LIFTAG should open the incline slug.' },
    { title: 'Bouncing the stack off the pins', body: 'The stretch is the work. If you need the bounce, drop a plate.' },
  ],
  variations: [
    { slug: 'barbell-incline-bench-press', name: 'Barbell incline bench press', note: 'More load, more setup, needs a spotter at the top end.' },
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'Independent bells, longer range, same angle story.' },
    { slug: 'machine-chest-press', name: 'Machine chest press', note: 'The flat version of this frame. Keep the slugs apart.' },
    { slug: 'smith-machine-incline-press', name: 'Smith machine incline press', note: 'Fixed bar path when the gym has no incline machine.' },
  ],
  progressions: [
    'Light stack, full range, two-second lower, no bounce.',
    'Working sets of 8–12 with the same seat hole every week.',
    'Add a pause an inch off the chest before you add load.',
    'Swap to incline dumbbells or barbell once the machine groove is boring.',
  ],
  programming: 'Use this as the main press on an upper-chest day or as the second press after flat work. 3–4 sets of 8–12. At a partner gym the QR or NFC tag on this frame should open this slug — if it opens machine chest press, the log is already lying. Note the seat hole if the gym’s incline machines are not labeled.',
  equipmentAlternatives: [
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'Default swap when the machine line does not match your shoulders.' },
    { slug: 'low-to-high-cable-fly', name: 'Low-to-high cable fly', note: 'Isolation volume for the same line of pull.' },
  ],
  faqs: [
    {
      question: 'Is machine incline chest press as good as incline barbell?',
      answer: 'It is the version you can load without a spotter and without a walkout. Loads will not match the barbell, which is why this is its own LIFTAG slug. If the machine path feels like a front-delt press, drop the seat or switch to dumbbells.',
    },
  ],
  relatedSlugs: [
    'barbell-incline-bench-press',
    'incline-dumbbell-press',
    'machine-chest-press',
    'pec-deck-flys',
  ],
} satisfies ExerciseOverlay
