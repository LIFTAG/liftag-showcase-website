import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'flat-bench-dumbbell-fly',
  metaDescription: 'Flat bench dumbbell fly: fixed elbow, honest stretch, and logging chest isolation on this slug instead of mixing pec-deck or dumbbell bench in LIFTAG.',
  steps: [
    'Lie on a flat bench, feet planted, bells over the chest with palms facing each other. Kick them up the same way as a dumbbell press.',
    'Keep a soft, nearly fixed elbow bend. Open the arms in a wide arc until you feel a chest stretch, not a shoulder dump.',
    'Stop when the upper arms are about in line with the torso. Elbows far below the bench is how this lift irritates the front of the shoulder.',
    'Bring the bells back together over the chest without a clap. Soft lock of the arc, not a press with a curve.',
    'If the last reps turn into a close-grip press, the pair is too heavy. Drop the bells and keep the fly.',
  ],
  mistakes: [
    { title: 'Turning it into a press', body: 'If the elbows bend and straighten like a bench, you picked the wrong pattern. Soft, fixed elbow. Presses belong on flat dumbbell bench press.' },
    { title: 'Dumping the elbows below the bench', body: 'The extra range is not free. Control the stretch or you will feel it in the shoulder, not the pec. Lighter bells beat a deeper dump.' },
    { title: 'Banging the bells together at the top', body: 'That clap is a metronome, not a squeeze. Finish over the chest with a quiet gap.' },
    { title: 'Logging these as dumbbell bench', body: 'Different pattern, different PR. Keep this slug. Pec-deck and cable crossovers have their own charts too. Do not mix isolation onto a press log.' },
  ],
  variations: [
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Machine version, less stabilizer demand, easier to load honestly.' },
    { slug: 'standing-cable-crossover', name: 'Standing cable crossover', note: 'Cables, tension at the stretch, more freedom to pick the line.' },
    { slug: 'incline-dumbbell-fly', name: 'Incline dumbbell fly', note: 'Same isolation at an incline. Own slug, own chart.' },
    { slug: 'flat-dumbbell-bench-press', name: 'Flat dumbbell bench press', note: 'The press these flies sit behind. Do not swap them for a main press.' },
  ],
  progressions: [
    'Light bells you can kick up and open without the elbows diving.',
    'Two-second lower, pause at the stretch, then close.',
    'Add load when the fly still looks like a fly at rep twelve.',
    'Pec-deck or cables if the shoulder hates the free-weight stretch.',
  ],
  programming: 'Isolation after a press, not instead of one. Two to four sets of 10–15. Log the actual dumbbell weight, not the pair total, and stay consistent so the chart means something. Incline flys, pec-deck, and crossovers stay on their own slugs. Put “pause at the stretch” in a note if that is the point of the set. You do not need a LIFTAG estimated 1RM here. Let the rest timer run. Rushing flies just turns them into a messy press.',
  equipmentAlternatives: [
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'Default swap when the dumbbell stretch bothers the shoulder, or you are training alone with heavy bells.' },
    { slug: 'standing-cable-crossover', name: 'Standing cable crossover', note: 'When you want tension at the bottom and a line you can pick.' },
  ],
  faqs: [
    {
      question: 'How low should the dumbbells go?',
      answer: 'Until you feel a chest stretch with the upper arms about level with the torso. Elbows hanging toward the floor is not more chest, it is more shoulder. If a depth only works with a tiny pair, that pair is the load. Log it. Do not invent range you cannot control.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'flat-dumbbell-bench-press',
    'standing-cable-crossover',
    'incline-dumbbell-fly',
  ],
} satisfies ExerciseOverlay
