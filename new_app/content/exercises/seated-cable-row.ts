import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-cable-row',
  metaDescription: 'Seated cable row: torso angle, pull to the sternum, and horizontal-pull logging that stays off the machine-row chart in LIFTAG.',
  steps: [
    'Sit tall on the pad, feet on the plate, knees softly bent. Start with the arms long and the shoulders reached toward the stack — that stretch is the start, not a good-morning.',
    'Pull the handle to the lower chest / upper abs. Elbows drive back, chest up, scaps together. Do not shrug the finish into the ears.',
    'Pause on the torso. Then let the shoulders reach forward on the return until the lats stretch. A small hip hinge on the stretch is fine; a 45° rock is not.',
    'Match the handle to the intent: close V to the sternum, wider bar a little higher. Note the attachment if you switch.',
  ],
  mistakes: [
    { title: 'Rowing with the low back', body: 'If every rep is a hip hinge that yanks the pin, the stack is too heavy. The torso can nod a little on the stretch. The work is still the pull, not a seated good-morning.' },
    { title: 'Shrugging the last two inches', body: 'Elbows back, shoulders down. A shrugged finish is a trap set you did not log. If the handle only moves because the shoulders went up, drop the pin.' },
    { title: 'Logging machine seated row here', body: 'Chest-pad machines are a different slug and a different PR. Scan the tag. This one is the free-sitting cable.' },
    { title: 'Never reaching at the stretch', body: 'Starting every rep from a squeezed upper back is a half-rep. Let the shoulders go forward, then pull. That is the lat, not sloppy rounding.' },
  ],
  variations: [
    { slug: 'machine-seated-row', name: 'Machine seated row', note: 'Chest pad, less low-back tax. Use it when the back is cooked.' },
    { slug: 'barbell-bent-over-row', name: 'Barbell bent-over row', note: 'More load, more hip hinge, the free-weight cousin.' },
    { slug: 'single-arm-dumbbell-row', name: 'Single-arm dumbbell row', note: 'Independent sides, a bench for support.' },
    { slug: 'chest-supported-t-bar-row', name: 'Chest-supported T-bar row', note: 'Horizontal pull with the torso glued down.' },
  ],
  progressions: [
    'Light stack, pause on the torso, full reach on the return, no rock.',
    'Add load when the last reps still hit the same point on the shirt.',
    'Chest-supported or machine rows if the low back always gives out first.',
    'Barbell or T-bar rows once you want a heavier horizontal pull.',
  ],
  programming: 'This is weekly horizontal-pull volume for most gyms. Three to four sets of 8–12 after a deadlift or as the main row on an upper day. Log the handle in a note if you bounce between V-bar and a wide bar. Rest long enough that you are not heaving — the LIFTAG timer is the difference between a row and a hip-hinge contest.',
  equipmentAlternatives: [
    { slug: 'machine-seated-row', name: 'Machine seated row', note: 'Default when you want the pad against the chest.' },
    { slug: 'inverted-row', name: 'Inverted row', note: 'No cable? Use a bar in a rack. Log it as inverted row, not this lift.' },
    { slug: 't-bar-row', name: 'T-bar row', note: 'Landmine or chest-supported T-bar when you want more load.' },
  ],
  faqs: [
    {
      question: 'How much torso swing is allowed?',
      answer: 'A small hinge on the stretch, then a tall pull. If you need a big rock to finish, the pin is too heavy. Chest-supported or machine seated row exist for the days the low back should not help.',
    },
  ],
  relatedSlugs: [
    'barbell-bent-over-row',
    'machine-seated-row',
    'pendlay-row',
    't-bar-row',
    'single-arm-dumbbell-row',
  ],
} satisfies ExerciseOverlay
