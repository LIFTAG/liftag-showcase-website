import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'nordic-hamstring-curl',
  metaDescription: 'Nordic hamstring curl: hip position, eccentric control, and how to log assisted versus unassisted reps in LIFTAG.',
  steps: [
    'Anchor the heels — Nordic pad, loaded bar, or a partner who will not let go. Kneel tall on a pad.',
    'Squeeze the glutes so the hips stay open. Arms ready to catch.',
    'Lower toward the floor by lengthening the hamstrings. If the hips fold, the set is a hinge, not a Nordic.',
    'Catch with the hands, then push off just enough to reverse — or curl back up if you own the concentric.',
    'Stop the set when the lowering turns into a fall.',
  ],
  mistakes: [
    { title: 'Breaking at the hips', body: 'Sitting toward the heels turns this into a poor good morning. Hips stay extended; the knees do the work.' },
    { title: 'Only owning the top quarter', body: 'A two-inch nod is not a Nordic. Lengthen the eccentric, even if you push off the floor to come back up.' },
    { title: 'No catch plan', body: 'Hands go to the floor before your face does. Pride is not a progression.' },
    { title: 'Logging band-assisted reps as unassisted', body: 'Put “band” or “push-off” in the LIFTAG set note. A fake unassisted PR is how next week starts too heavy.' },
  ],
  variations: [
    { slug: 'glute-ham-raise', name: 'Glute ham raise', note: 'GHD version with a concentric you can actually train.' },
    { slug: 'machine-lying-leg-curl', name: 'Machine lying leg curl', note: 'Loadable knee flexion when you are not ready to fall toward the floor.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hip-hinge hamstring work you can load on day one.' },
    { slug: 'machine-seated-leg-curl', name: 'Machine seated leg curl', note: 'Seated knee flexion, easier to dose than Nordics.' },
  ],
  progressions: [
    'Long eccentrics with a push-up assist off the floor.',
    'Band around the chest, or a slight decline, until you can lower past 45°.',
    'Unassisted eccentrics to a catch.',
    'Full concentric Nordics. That is the long game, not week two.',
  ],
  programming: 'Treat this as a high-cost accessory: 2–4 sets of 3–6 hard reps, not 12 sloppy ones. Program it after the main hinge or on a second hamstring day. Soreness can linger — if last week’s notes say “couldn’t walk,” do not add a set.',
  equipmentAlternatives: [
    { slug: 'glute-ham-raise', name: 'Glute ham raise', note: 'Use the GHD if the gym has one and you want a real concentric.' },
    { slug: 'machine-lying-leg-curl', name: 'Machine lying leg curl', note: 'Default swap when there is no anchor and no partner.' },
  ],
  faqs: [
    {
      question: 'Do Nordics replace leg curls?',
      answer: 'No. Nordics are a hard eccentric at long hamstring length. Leg curls let you dose knee flexion without a fall. Many programs use both; log them as different lifts.',
    },
    {
      question: 'How do I log a push-off Nordic?',
      answer: 'Same slug. Note “push-off” or “band.” When you can curl back up without the hands, that is the PR — not the first time you survived the eccentric with a bounce.',
    },
  ],
  relatedSlugs: [
    'glute-ham-raise',
    'barbell-romanian-deadlift-rdl',
    'machine-lying-leg-curl',
    'machine-seated-leg-curl',
    'barbell-good-morning',
  ],
} satisfies ExerciseOverlay
