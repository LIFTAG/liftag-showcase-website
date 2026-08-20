import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-seated-leg-curl',
  metaDescription: 'Machine seated leg curl: hip-flexed stretch, knee-to-cam setup, and how to log seated curls in LIFTAG without dumping the numbers onto the lying-curl chart.',
  steps: [
    'Sit so the knees line up with the cam. Lock the thigh pad. The ankle pad sits on the lower Achilles, not the mid-calf.',
    'Hips stay back in the seat. Grab the handles. If you have slid forward, you already lost the stretch.',
    'Curl the heels under until the knees are well flexed. Do not kick the stack off the pins.',
    'Lower under control into the stretch with the hips still flexed. Stop before the plates crash or the knees get yanked straight.',
    'Keep the back on the pad. A shrug off the seat is a cheat, not extra hamstring.',
  ],
  mistakes: [
    { title: 'Scooting the hips forward', body: 'You shortened the hamstring on purpose. The seated curl exists for the long-length stretch. Sit back or pick another lift.' },
    { title: 'Pivot not at the knee', body: 'If the cam is behind or in front of the joint, every rep shears. Move the seat until the axes match.' },
    { title: 'Swinging the weight up', body: 'A kick hides the hard part of the range. Slow the last 30° or drop the pin.' },
    { title: 'Logging lying curls on this slug', body: 'Prone and seated are different hip angles and different PRs. Scan the seated unit so LIFTAG does not open the lying chart.' },
  ],
  variations: [
    { slug: 'machine-lying-leg-curl', name: 'Machine lying leg curl', note: 'Hips extended on a bench. Same joint, shorter hamstring length.' },
    { slug: 'machine-leg-extension', name: 'Machine leg extension', note: 'Antagonist quad isolation if you are pairing on the same stack.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'Hard eccentric when the seat is not the limiter.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Loaded hinge if you need hamstrings without a curl machine.' },
  ],
  progressions: [
    'Light full-range seated curls with the hips locked back.',
    'Pause a beat at peak flexion without lifting off the seat.',
    'Single-leg when one side always leaves the pad first.',
    'Heavier 8–12 once the seat and cam stay put session to session.',
  ],
  programming: 'Finisher or second hamstring day: 2–4 sets of 8–15. Pair with leg extensions if you want, but log them as two lifts. Scan the seated machine. If you switched to lying mid-block because of a queue, change slug or the estimated 1RM is two hip angles pretending to be one curl.',
  equipmentAlternatives: [
    { slug: 'machine-lying-leg-curl', name: 'Machine lying leg curl', note: 'Keep knee flexion when the seated unit is taken.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'No curl station. Anchor and lower with intent.' },
  ],
  faqs: [
    {
      question: 'Why does the seated curl feel harder at the same pin?',
      answer: 'Hips flexed stretch the hamstrings before the knee even moves. A lying stack number will not carry over. That is the point of this slug. If a given seat always hurts the back of the knee, check the cam, shorten the stretch slightly, and do not chase the lying-curl load.',
    },
  ],
  relatedSlugs: [
    'machine-lying-leg-curl',
    'machine-leg-extension',
    'nordic-hamstring-curl',
    'barbell-romanian-deadlift-rdl',
  ],
} satisfies ExerciseOverlay
