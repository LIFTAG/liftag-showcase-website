import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'incline-dumbbell-curl',
  metaDescription: 'Incline dumbbell curl: bench angle, stretch, and how to log lengthened biceps curls separately from seated curls in LIFTAG.',
  steps: [
    'Set a bench around 45–60° and sit all the way back. If you are perched upright, you just booked a seated curl.',
    'Let the dumbbells hang beside you with the arms slightly behind the torso. Palms start forward or neutral.',
    'Curl toward the shoulders without the elbows drifting forward to kill the stretch. Supinate if you started neutral.',
    'Lower to a full hang and pause a beat before the next rep. That hang is the reason this lift exists.',
  ],
  mistakes: [
    { title: 'Sitting up as soon as the set gets hard', body: 'The moment the back leaves the pad, the stretch is gone. Drop the bells, not the bench angle.' },
    { title: 'Letting the elbows crawl forward', body: 'Then it is a seated curl with extra furniture. Keep the upper arm behind the torso for the whole rep.' },
    { title: 'Logging these as seated or standing dumbbell curls', body: 'You will curl less here. Keep this slug or the lengthened-position work disappears into a stronger lift’s chart.' },
    { title: 'Swinging the bells from the bottom', body: 'A hike pass is for kettlebells. If you need a swing to start the curl, the stretch already beat you — go lighter.' },
  ],
  variations: [
    { slug: 'seated-dumbbell-bicep-curl', name: 'Seated dumbbell bicep curl', note: 'Upright, less stretch, easier to load.' },
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Standing bilateral curl you can load in small jumps.' },
    { slug: 'concentration-curl', name: 'Concentration curl', note: 'Shortened-position isolation if the incline stretch bothers the shoulder.' },
    { slug: 'hammer-curls', name: 'Hammer curls', note: 'Neutral grip when the supinated stretch is the limiter.' },
  ],
  progressions: [
    'Light bells, 60° or lower, full hang you can sit through.',
    'Working sets of 8–12 with the back glued to the pad.',
    'Add a one-second pause at the bottom before you add load.',
    'Drop the incline a notch only after the current angle is clean — note the hole number.',
  ],
  programming: 'Use as the lengthened biceps lift of the day: 2–4 sets of 8–12. Pair with a preacher or cable curl if you want a shortened-position second pass, not with another heavy incline curl. Note the bench hole if the gym’s “incline” is four different angles.',
  faqs: [
    {
      question: 'How steep should the incline be?',
      answer: 'Steep enough that the arms hang behind the torso, not so steep you are almost upright. Most lifters land between 45° and 60°. Higher than that starts to look like a seated curl — which is a different LIFTAG slug.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'seated-dumbbell-bicep-curl',
    'standing-dumbbell-bicep-curl',
    'machine-preacher-curl',
    'concentration-curl',
  ],
} satisfies ExerciseOverlay
