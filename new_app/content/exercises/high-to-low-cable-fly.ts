import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'high-to-low-cable-fly',
  metaDescription: 'High-to-low cable fly: descending arc, finish at the lower chest, and logging this line of pull separately from crossovers and low-to-high flys in LIFTAG.',
  steps: [
    'Set both pulleys above shoulder height, take the handles, and step forward into a split stance. Soft knees, same forward lean the whole set.',
    'Soft, nearly fixed elbow. Sweep the arms down and in until the handles meet in front of the lower chest or upper abdomen. Not at the hips.',
    'The line is a hug that finishes low. If the hands drift up to the throat, you are not doing this lift.',
    'Return under control only as far as the shoulders stay comfortable. Do not let the stacks yank you into a reverse fly.',
    'Torso angle stays put. If you have to crunch to finish, drop the pins.',
  ],
  mistakes: [
    { title: 'Finishing at the hips', body: 'That is a chop, not a fly. Stop at the lower chest. Past that you rolled the shoulders forward and lost the pec.' },
    { title: 'Logging this as standing cable crossover', body: 'Same station, stricter descending finish. Keep this slug. If you actually met the hands at mid-chest with a cross, that set belongs on standing cable crossover.' },
    { title: 'Mixing low-to-high onto this chart', body: 'Low-to-high is the upper-chest line, pulleys at the bottom. High-to-low is this one. Two slugs. Do not average them in LIFTAG.' },
    { title: 'Pressing the handles down', body: 'Elbows that bend and straighten turned this into a cable press. Soft, fixed bend, or pick a press and log that.' },
  ],
  variations: [
    { slug: 'standing-cable-crossover', name: 'Standing cable crossover', note: 'Same high pulleys, more freedom at the finish. Own slug.' },
    { slug: 'low-to-high-cable-fly', name: 'Low-to-high cable fly', note: 'Opposite line, more upper chest. Pair with incline work, not with this log.' },
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Machine isolation when both cables are taken.' },
    { slug: 'incline-dumbbell-press', name: 'Incline dumbbell press', note: 'A press you might pair on the same day. Not a swap of this line.' },
  ],
  progressions: [
    'Light pins, two-second sweep to the lower chest, two-second return.',
    'Add load when the finish is still a fly, not a crunch or a press.',
    'Note the pulley hole if “high” at this gym is barely above the shoulder.',
    'Pec-deck or a dumbbell fly if the cable line bothers the shoulder.',
  ],
  programming: 'Isolation after a press, often on a lower-chest or general fly day. Two to four sets of 10–15. Log the pin on one stack, not both added. Standing cable crossover and low-to-high cable fly stay off this chart even if you used the same columns. Put the finish height in a note if you ever meet higher than the lower chest. You do not need a LIFTAG estimated 1RM here. Let the rest timer run. Rushing the eccentric just yanks the shoulder into the stretch.',
  equipmentAlternatives: [
    { slug: 'standing-cable-crossover', name: 'Standing cable crossover', note: 'When you want the same station with a less strict finish.' },
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Machine fly when the cables are busy.' },
  ],
  faqs: [
    {
      question: 'Is high-to-low the same as a standing cable crossover?',
      answer: 'Close station, different log. Crossover lets you meet or cross around the chest. High-to-low is the descending hug that finishes at the lower chest, not the hips. If you keep switching finishes, pick one slug and note the other. Mixing both onto one LIFTAG chart is how a fake cable PR shows up.',
    },
  ],
  relatedSlugs: [
    'incline-dumbbell-press',
    'standing-cable-crossover',
    'pec-deck-flys',
    'low-to-high-cable-fly',
  ],
} satisfies ExerciseOverlay
