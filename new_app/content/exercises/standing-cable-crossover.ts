import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-cable-crossover',
  metaDescription: 'Standing cable crossover: high pulleys, constant elbow, and logging cable chest work without dumping high-to-low or pec-deck sets onto one LIFTAG chart.',
  steps: [
    'Set both pulleys above shoulder height, take a handle in each hand, and step forward into a split stance with the cables behind you. Soft knees, ribs down.',
    'Keep a nearly constant elbow bend. Sweep the arms down and in until the hands meet or slightly cross in front of the lower chest.',
    'A small forward lean is fine. Twisting the torso to finish is not. The stack should still be floating at the stretch.',
    'Return until you feel a chest stretch, not until the weight yanks the shoulders back. Control the last third.',
    'If the elbows start to press, you picked a press. Drop the pins and keep the fly.',
  ],
  mistakes: [
    { title: 'Pulleys at the hips', body: 'Then you are doing a low-to-high fly, which is a different slug and a different line. High pulleys for this lift. Note the hole if you ever run them mid-height.' },
    { title: 'Turning it into a standing press', body: 'Elbows bending and straightening is a press with cables. Soft, fixed bend. Presses belong on a press log.' },
    { title: 'Getting yanked backward at the stretch', body: 'That dump is why people hate crossovers. Step in, drop the pin, and own the eccentric. The stretch is the work.' },
    { title: 'Logging high-to-low or pec-deck here', body: 'High-to-low is a stricter descending finish. Pec-deck is a machine. Keep this slug. Mixing them is how a cable PR appears on a pec-deck day.' },
  ],
  variations: [
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Machine version, less stance to think about.' },
    { slug: 'high-to-low-cable-fly', name: 'High-to-low cable fly', note: 'Same high pulleys, more downward finish. Own slug, own chart.' },
    { slug: 'low-to-high-cable-fly', name: 'Low-to-high cable fly', note: 'Opposite line, more upper chest. Do not dump it here.' },
    { slug: 'flat-bench-dumbbell-fly', name: 'Flat bench dumbbell fly', note: 'Free-weight fly when both cables are taken.' },
  ],
  progressions: [
    'Light pins, two-second sweep, two-second return, plates not touching.',
    'Add load when the torso stays quiet and the elbows stay bent.',
    'A slight hand cross at the finish if the meet feels empty. Note “cross” vs “meet.”',
    'Pec-deck if you want the same isolation without a stance to manage.',
  ],
  programming: 'Isolation after a press. Two to four sets of 10–15. Log the pin on one stack, not both added, and stay consistent so the chart means something. High-to-low and low-to-high stay on their own slugs even if the station looks the same. Put the pulley hole in a note if the gym’s “high” is not actually high. You do not need a LIFTAG estimated 1RM here. Let the rest timer run. Rushing crossovers just turns them into a standing crunch.',
  equipmentAlternatives: [
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'When both cable columns are taken, or you want a pad on the back.' },
    { slug: 'flat-bench-dumbbell-fly', name: 'Flat bench dumbbell fly', note: 'Free weights when there is no cable station.' },
  ],
  faqs: [
    {
      question: 'Should the hands cross or just meet?',
      answer: 'Meet is enough. A slight cross can add a squeeze at the finish if the shoulder stays quiet. A big crossover with a torso twist is theater. Pick one, put it in a set note, and keep this slug. Do not start a second lift because you crossed your wrists.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'high-to-low-cable-fly',
    'flat-bench-dumbbell-fly',
    'low-to-high-cable-fly',
  ],
} satisfies ExerciseOverlay
