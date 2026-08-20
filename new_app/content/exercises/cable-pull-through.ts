import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-pull-through',
  metaDescription: 'Cable pull-through: rope between the legs, hip snap, and how to log this standing hinge in LIFTAG without mixing kettlebell swings or hip thrusts on this slug.',
  steps: [
    'Low pulley, rope attachment. Straddle the cable, walk out until the stack is live, and hinge so the rope runs between the thighs.',
    'Soft knees, hips back, spine long. Let the cable pull you into a hamstring stretch. This is not a squat start.',
    'Drive the hips forward until you stand tall. The rope finishes near the hips. The arms are ropes, not a row.',
    'Hinge to return. Guide the cable. Do not squat down to catch it, and do not round over a dead stack.',
    'Stay far enough from the tower that the plates never rest mid-set. If they kiss, take another step out or add a pin.',
  ],
  mistakes: [
    { title: 'Squatting the pull-through', body: 'Knees shooting forward and the rope hanging low means you turned a hinge into a bad cable goblet squat. Push the hips back, not down.' },
    { title: 'Rowing the rope with the arms', body: 'If the elbows bend and the rear delts do the lift, the hips never closed. Lighter stack, quieter arms, louder hips.' },
    { title: 'Hyperextending the low back at the top', body: 'Stand tall. The glutes finish the hip. Leaning back is a fake lockout and a lumbar problem.' },
    { title: 'Logging swings or hip thrusts here', body: 'A kettlebell swing is speed. A hip thrust is a bench or machine lockout. This is a standing cable hinge. Keep the slug.' },
  ],
  variations: [
    { slug: 'kettlebell-swing', name: 'Kettlebell swing', note: 'Same hinge family, faster. Power, not a grind.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Slow hinge you can load when the cable is not the point.' },
    { slug: 'barbell-hip-thrust', name: 'Barbell hip thrust', note: 'Horizontal lockout on a bench when you want more range through the hip.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Floor version if you want a squeeze without a cable.' },
  ],
  progressions: [
    'Light stack, long hinge, plates never resting.',
    'Pause at lockout with ribs down before you add pins.',
    'Working sets of 8–15 with the same walk-out every session.',
    'Heavier only after the squat pattern is gone. Note the walk-out if the gym’s cable travel changes the feel.',
  ],
  programming: 'Glute-hinge accessory: 3–4 sets of 8–15 after the main squat or pull. Log the stack. If you swap to kettlebell swings because the cable is taken, change slug. A swing PR is speed. A pull-through PR is a grind. Mixing them is how week four lies.',
  equipmentAlternatives: [
    { slug: 'kettlebell-swing', name: 'Kettlebell swing', note: 'No low cable. Keep the hip snap, accept the speed.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Default slow hinge when the tower is a queue.' },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Floor squeeze if you cannot stand in a cable lane.' },
  ],
  faqs: [
    {
      question: 'Pull-through or kettlebell swing?',
      answer: 'Same hinge idea, different intent. The pull-through is a slow cable grind you can dose. The swing is a hike and a snap. Chest-height swings do not belong on this slug, and a heavy stack does not belong on kettlebell-swing. Pick the one you did.',
    },
  ],
  relatedSlugs: [
    'kettlebell-swing',
    'barbell-hip-thrust',
    'barbell-romanian-deadlift-rdl',
    'glute-bridge',
  ],
} satisfies ExerciseOverlay
