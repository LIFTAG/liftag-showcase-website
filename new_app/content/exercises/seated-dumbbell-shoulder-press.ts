import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-dumbbell-shoulder-press',
  metaDescription: 'Seated dumbbell shoulder press: bench angle, kick-up, and logging dumbbell overhead work as its own lift in LIFTAG.',
  steps: [
    'Set the bench one notch shy of vertical. A locked 90° pad plus a hard arch is just a standing press you sat down for.',
    'Sit, bells on the thighs, then kick them to the shoulders — or have them handed up once they are heavy. Start with the ends near the ears, knuckles to the ceiling.',
    'Elbows slightly in front of the torso, not flared out to a T. Press until the bells finish over the crown, close but not clacking.',
    'Lower to about ear height. A deeper stretch is fine if the shoulder allows it; dropping the bells onto the delts every rep is not.',
  ],
  mistakes: [
    { title: 'Banging the bells together at the top', body: 'That clap is a metronome, not a lockout. Finish over the head with a quiet gap. If they only meet because you shrugged, the load is too heavy.' },
    { title: 'Letting the bells drift into a front raise', body: 'Last reps like to wander forward. Keep the path close to the ears. If you cannot, drop the weight before you invent a new lift.' },
    { title: 'Logging this as standing barbell overhead press', body: 'Different tool, different PR. Keep this slug. Note the bench hole if your gym’s “upright” benches are not actually upright.' },
    { title: 'Kicking 40s up with a bent wrist', body: 'Get a handoff or start from the knees on the first rep. A collapsed wrist on the kick-up is how this lift ends early.' },
  ],
  variations: [
    { slug: 'seated-arnold-press', name: 'Seated Arnold press', note: 'Add the rotation for a longer range. Same seat, different log.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'More load, more trunk, one bar.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'When you want the pattern without dumping a dumbbell on the floor.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'Single-arm, 45° path, kinder end range for many shoulders.' },
  ],
  progressions: [
    'Light bells you can get to the shoulders without a hitch or a spotter.',
    'Paused reps at ear height until both arms finish together.',
    'Build 6–10 clean reps before you chase heavy triples with bells you cannot kick up.',
    'Arnold press or landmine if one position irritates the shoulder but you still want overhead work.',
  ],
  programming: 'Dumbbell overhead work is usually a hypertrophy press, not a 1RM test. Three to four sets of 6–10. Log the actual dumbbell weight, not the pair total, and stay consistent so the chart means something. Rest long enough that the second arm does not die three reps early — the timer exists for that.',
  equipmentAlternatives: [
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Use when the dumbbells are too heavy to kick up, or you are training alone.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Swap here when you want a single load and a stricter PR.' },
  ],
  faqs: [
    {
      question: 'Should the bench be perfectly upright?',
      answer: 'Usually not. A slight recline keeps the low back on the pad and the bells from drifting forward. If the bench is so far back that you are doing incline dumbbell press, sit up a hole or log that lift instead.',
    },
  ],
  relatedSlugs: [
    'seated-arnold-press',
    'standing-barbell-overhead-press',
    'machine-shoulder-press',
    'cable-lateral-raise',
    'incline-dumbbell-press',
  ],
} satisfies ExerciseOverlay
