import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-bicep-curl',
  metaDescription: 'Standing dumbbell bicep curl: elbow pin, full hang, and how to log strict dumbbell curls in LIFTAG without mixing hammers or barbell numbers onto this slug.',
  steps: [
    'Stand tall with a dumbbell in each hand, palms forward, arms long. Ribs down, glutes lightly on. The moment you sit, you booked a different slug.',
    'Pin the elbows next to the torso. They can travel a few centimeters; they cannot start a swing.',
    'Curl until the biceps fully shorten. Wrists stay stacked. The bells stay in line with the forearms, not rolled onto them.',
    'Lower to a full hang and pause a beat. Alternate or both at once is your call; pick one and keep it for the block.',
  ],
  mistakes: [
    { title: 'Turning the last reps into a hip clean', body: 'A little body English on a true last rep is one thing. If the bells need a hike to leave the thighs, the load already won. Drop it.' },
    { title: 'Logging hammers as standing dumbbell curls', body: 'Thumbs-up is hammer-curls. Palms-up is this slug. LIFTAG charts one grip. Mixing them makes a fake PR out of a different muscle.' },
    { title: 'Sitting down the second it gets hard', body: 'Then it is a seated curl with extra furniture. Stay on your feet or log seated-dumbbell-bicep-curl.' },
    { title: 'Logging the pair as one number', body: 'One bell, not both added together. Double the load and the chart is fiction from week one.' },
  ],
  variations: [
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Bilateral, small jumps, same standing idea.' },
    { slug: 'incline-dumbbell-curl', name: 'Incline dumbbell curl', note: 'Lengthened biceps, back on a bench.' },
    { slug: 'hammer-curls', name: 'Hammer curls', note: 'Neutral grip, more brachialis and forearm.' },
    { slug: 'seated-dumbbell-bicep-curl', name: 'Seated dumbbell bicep curl', note: 'Same bells, no standing cheat, less stretch.' },
  ],
  progressions: [
    'Light bells, full hang, torso that does not start the curl.',
    'Working sets of 8–12 with the same stance and the same alternate-or-both choice.',
    'Add a one-second pause at the bottom before you chase heavier bells.',
    'Incline or preacher as a second pass, not as the same log.',
  ],
  programming: 'Main dumbbell biceps lift: 3–4 sets of 8–12. Log one bell, not the pair. Alternate and simultaneous both stay on this slug; write which one in the set note. Hammers, seated curls, and incline curls each have their own chart. If the rack has a tag, it should open standing-dumbbell-bicep-curl, not barbell-curl.',
  equipmentAlternatives: [
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'When you want one load and smaller jumps than the dumbbell tree.' },
    { slug: 'standing-cable-bicep-curl', name: 'Standing cable bicep curl', note: 'Constant tension if the bells feel empty at the bottom.' },
  ],
  faqs: [
    {
      question: 'Alternate arms or both at once?',
      answer: 'Both are this lift. Alternating lets you watch each arm; simultaneous is closer to a barbell curl. Pick one as the default for the block and note the other if you rotate. Do not treat a switch as a PR.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'incline-dumbbell-curl',
    'hammer-curls',
    'seated-dumbbell-bicep-curl',
  ],
} satisfies ExerciseOverlay
