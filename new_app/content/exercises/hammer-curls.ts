import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'hammer-curls',
  metaDescription: 'Hammer curls: thumbs-up grip, elbow pin, and how to log strict brachialis work in LIFTAG without dumping it onto standing dumbbell or barbell curl charts.',
  steps: [
    'Stand tall with a dumbbell in each hand, thumbs up, arms long. Neutral grip the whole way. If the pinkies rotate, you left this lift.',
    'Pin the elbows next to the torso. The bells travel beside the body, not out in front like a front raise.',
    'Curl toward the shoulders until the biceps and brachialis shorten. Wrists stay stacked, handle stays in line with the forearm.',
    'Lower to a full hang. Alternate or both at once; keep the thumbs pointing up on every rep.',
  ],
  mistakes: [
    { title: 'Supinating at the top and logging it here', body: 'The moment the pinkies turn up, it is a standing dumbbell curl with extra motion. Finish strict hammers or switch slugs. Do not blend them on one chart.' },
    { title: 'Logging these as standing dumbbell bicep curls', body: 'Palms-up and thumbs-up are different loads and a different arm. Keep hammer-curls. LIFTAG will not merge the grips for you.' },
    { title: 'Letting the bells drift into a front raise', body: 'Elbows leaving the ribs turns this into a shoulder exercise. Glue the upper arms and drop the load if they will not stay.' },
    { title: 'Hiking the bells off the thighs', body: 'A kip is not brachialis work. If you need a swing to start the curl, go lighter. Save the heavy grip for dumbbell-farmers-walk.' },
  ],
  variations: [
    { slug: 'standing-dumbbell-bicep-curl', name: 'Standing dumbbell bicep curl', note: 'Palms-up counterpart, more biceps, same stance.' },
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Supinated bar when you want one load and smaller jumps.' },
    { slug: 'incline-dumbbell-curl', name: 'Incline dumbbell curl', note: 'Start neutral on an incline if you want the stretch plus a hammer option.' },
    { slug: 'dumbbell-farmers-walk', name: 'Dumbbell farmers walk', note: 'Same thumbs-up grip, loaded carry instead of a curl.' },
  ],
  progressions: [
    'Light bells, thumbs up the whole rep, no torso start.',
    'Working sets of 8–12 with the elbows quiet.',
    'Pause at the bottom before you add load.',
    'Cross-body only after the standard path is automatic, and write it in the note.',
  ],
  programming: 'Brachialis and forearm work: 3–4 sets of 8–12 after a palms-up curl. Do not log the palms-up work here. Log one bell. Cross-body stays on this slug only if the grip stays thumbs-up; put the path in the set note. Grip that dies here also shows up on dumbbell-farmers-walk, so do not smash both heavy in the same hour unless that is the point.',
  faqs: [
    {
      question: 'Should I curl across the body?',
      answer: 'Straight up is the default. Across the body, toward the opposite pec, is still a hammer if the thumb stays up, but the load will not match. Pick one as the default and note the other. Do not chase a cross-body number with a strict week.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'standing-dumbbell-bicep-curl',
    'dumbbell-farmers-walk',
    'incline-dumbbell-curl',
  ],
} satisfies ExerciseOverlay
