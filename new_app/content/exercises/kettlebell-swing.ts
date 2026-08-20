import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'kettlebell-swing',
  metaDescription: 'Kettlebell swing: hike, hip snap, and how to log Russian swings in LIFTAG without turning them into squats or overhead lifts.',
  steps: [
    'Park the bell a foot in front of you. Hinge, grip, and hike it back between the thighs like a center snap — this is not a squat start.',
    'Keep the shins fairly vertical, heels down, and the arms long. The bell brushes high on the inner thighs, not the knees.',
    'Stand up hard. The hips throw the bell; the arms are ropes. Russian height is about the chest or just below the shoulders.',
    'Let the bell float, then hinge to receive it back between the thighs. Guide it; do not squat down to catch it.',
    'Park the bell the same way you picked it up. Do not round over a dead bell at the end of a hard set.',
  ],
  mistakes: [
    { title: 'Squatting the swing', body: 'Knees shooting forward and the bell hanging low means you turned a hinge into a bad goblet squat. Push the hips back, not down.' },
    { title: 'Front-raising the bell with the arms', body: 'If the delts are doing the lift, the hips never snapped. Lighter bell, louder hip, quieter arms.' },
    { title: 'Hyperextending the low back at the top', body: 'Stand tall. The glutes finish the hip. Leaning back is a fake lockout and a lumbar problem.' },
    { title: 'Logging American (overhead) swings on this slug without a note', body: 'Overhead swings are a different skill and a different load. Default this slug to Russian (chest height). If you go overhead, write it in the set note or you will chase the wrong number.' },
  ],
  variations: [
    { slug: 'dumbbell-swing', name: 'Dumbbell swing', note: 'Same hike when there is no kettlebell — hold one end of the dumbbell.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Slow hinge you can load when power is not the point.' },
    { slug: 'cable-pull-through', name: 'Cable pull-through', note: 'Hinge with a cable when bells are scarce.' },
    { slug: 'kettlebell-deadlift', name: 'Kettlebell deadlift', note: 'Teach the pick-up and the hinge before you add speed.' },
  ],
  progressions: [
    'Kettlebell deadlift until the hinge is automatic.',
    'Hike drills and short-range swings to chest height.',
    'Working sets of 10–20 with a float at the top and a quiet back.',
    'Heavier bell, or EMOM, only after the squat pattern is gone.',
  ],
  programming: 'This is power, not a grind. 3–5 sets of 10–20, or short EMOMs, with the hinge still sharp on the last rep. Stop the set when it turns into a squat or a front raise. Log the bell weight; if you switch from Russian to overhead, the chart needs a note or it will lie in week four.',
  equipmentAlternatives: [
    { slug: 'dumbbell-swing', name: 'Dumbbell swing', note: 'Travel or hotel-gym stand-in. Same hip snap.' },
    { slug: 'cable-pull-through', name: 'Cable pull-through', note: 'Keep the hinge if you are deloading speed work.' },
  ],
  faqs: [
    {
      question: 'Chest height or overhead?',
      answer: 'Russian (about chest height) is the default on this slug. Overhead “American” swings ask more of the shoulders and change the load you can use. They can live here with an “OH” note; do not mix them silently with Russian numbers.',
    },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'dumbbell-swing',
    'barbell-hip-thrust',
    'cable-pull-through',
    'conventional-deadlift',
  ],
} satisfies ExerciseOverlay
