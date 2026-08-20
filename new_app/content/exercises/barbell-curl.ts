import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-curl',
  metaDescription: 'Barbell curl: stance, elbow position, and how to log strict curls in LIFTAG without mixing EZ-bar or cheat-curl numbers onto the same chart.',
  steps: [
    'Stand tall with a shoulder-width palms-up grip and the bar hanging at long arms. Ribs down, glutes lightly on.',
    'Pin the elbows next to the torso. They can travel a few centimeters; they cannot start a swing.',
    'Curl the bar toward the shoulders until the biceps are fully shortened. Wrists stay stacked, not broken back.',
    'Lower to a full hang under control. The bottom is a stretch, not a bounce off the thighs.',
  ],
  mistakes: [
    { title: 'Turning every rep into a hip cheat', body: 'A little body English on a true last rep is one thing. A set of kips is a reverse-grip clean. Drop the load or note “cheat” so the PR is honest.' },
    { title: 'Logging EZ-bar curls as barbell curls', body: 'The camber is easier on most wrists and usually lets you load more. ez-bar-curl is the other slug. Use it.' },
    { title: 'Cutting the bottom in half', body: 'If the bar never reaches long arms, you are only training the squeeze. Take the hang.' },
    { title: 'Leaning back until it looks like a row', body: 'The moment the torso angle changes, the front delts and lower back joined the set. Stand up or go lighter.' },
  ],
  variations: [
    { slug: 'ez-bar-curl', name: 'EZ-bar curl', note: 'Friendlier wrists, same standing curl.' },
    { slug: 'incline-dumbbell-curl', name: 'Incline dumbbell curl', note: 'Lengthened biceps, no bar.' },
    { slug: 'standing-cable-bicep-curl', name: 'Standing cable bicep curl', note: 'Constant tension, easy to micro-load.' },
    { slug: 'hammer-curls', name: 'Hammer curls', note: 'Neutral grip, more brachialis and forearm.' },
  ],
  progressions: [
    'Empty or light bar, strict tempo, full hang.',
    'Working sets of 6–10 where the torso never starts the bar.',
    'Add load when every work set stays strict.',
    'Cheat or stretch-pause intensifiers only as a programmed last set — put it in the note.',
  ],
  programming: 'Main biceps lift: 3–4 sets of 6–10, not a clean-and-jerk. Rest 90–120 seconds if the bar is actually heavy. Chin-ups already tax the biceps; if you curl heavy the same day, make one of them a pump. LIFTAG’s frequency view will tell you if you keep stacking both.',
  faqs: [
    {
      question: 'Should I use a cheat curl?',
      answer: 'Not as the default. Strict curls belong on this slug. If you program a cheat-curl top set, keep using barbell curl and write “cheat” in the set note so you do not chase that number with a strict week.',
    },
  ],
  relatedSlugs: [
    'ez-bar-curl',
    'incline-dumbbell-curl',
    'chin-up',
    'standing-dumbbell-bicep-curl',
    'hammer-curls',
  ],
} satisfies ExerciseOverlay
