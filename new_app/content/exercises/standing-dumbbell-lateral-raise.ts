import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-lateral-raise',
  metaDescription: 'Standing dumbbell lateral raise: elbow lead, no hitch, and logging side-delt volume on this slug instead of mixing cable or machine laterals in LIFTAG.',
  steps: [
    'Stand with the bells at the thighs, knees soft, same slight elbow bend you will keep the whole way. Wrists stay in line with the forearms, not poured thumbs-down.',
    'Raise out and a little forward of a strict T. Lead with the elbow. If the bells travel in front of the chest, you are front-raising.',
    'Stop when the upper arm is about parallel to the floor. Past that is mostly upper trap. A short pause beats a swing through the top.',
    'Lower until the delt still has something to do. A dead hang at the thigh is a rest, not a stretch. Reset before the next rep.',
    'If you need a torso hitch or a knee dip to finish, the pair is too heavy. Drop a set and own the raise.',
  ],
  mistakes: [
    { title: 'Swinging the bells off the hips', body: 'A hip pop is not a lateral. If the first third of the raise is empty, the load is a pendulum. Lighter bells, slower start.' },
    { title: 'Raising to the ear', body: 'Past about shoulder height, most lifters are all upper trap. Stop around parallel unless you actually want that shrug. If you want traps, log dumbbell shrug.' },
    { title: 'Pouring the thumbs down', body: 'That empty-can twist dumps the work into the AC joint. Knuckles up, pinkies no higher than the thumbs. The elbow still leads.' },
    { title: 'Logging cable or machine laterals here', body: 'Different resistance curve, different PR. Keep this slug. Cable lateral raise and machine lateral raise have their own charts. Do not mix them onto one.' },
  ],
  variations: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'Tension at the bottom, the dumbbell version cannot fake. Own slug.' },
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'Pad on the elbow, both arms at once, less setup.' },
    { slug: 'standing-dumbbell-front-raise', name: 'Standing dumbbell front raise', note: 'Front delt, not side. Pair after a press; do not swap blindly.' },
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'More load, more trap, same neighborhood if the shoulder allows it.' },
  ],
  progressions: [
    'Light bells, two-second raise, two-second lower, no lean.',
    'Add load when you can still stop at parallel without a hitch.',
    'Single-arm with the free hand on a rack if the last reps start swinging.',
    'Use laterals after a press, not as a fake main lift with a huge lean.',
  ],
  programming: 'Side-delt work is volume work. Three to four sets of 10–15 after a press, not instead of one. Log the actual dumbbell weight, not the pair total, and stay consistent so the chart means something. Cable and machine laterals stay on their own slugs. You do not need a LIFTAG estimated 1RM here. Chase clean reps, put “seated” in a note if you sit down, and let the rest timer run. Rushing laterals just turns them into shrugs.',
  equipmentAlternatives: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'Default swap when you want tension at the bottom, or the dumbbells start swinging.' },
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'When you want both arms at once without thinking about a pendulum.' },
  ],
  faqs: [
    {
      question: 'Should I raise to the ear or stop at the shoulder?',
      answer: 'Shoulder height is enough for most lifters. Going higher is usually a trap shrug. If you want traps, log dumbbell shrug. If you want side delts, stop around parallel and keep this slug.',
    },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'machine-lateral-raise',
    'seated-dumbbell-shoulder-press',
    'standing-dumbbell-front-raise',
  ],
} satisfies ExerciseOverlay
