import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-curl',
  metaDescription: 'EZ-bar curl: camber, elbow pin, and how to log this wrist-friendlier standing curl in LIFTAG without mixing EZ-bar numbers onto the barbell-curl chart.',
  steps: [
    'Take the angled sections of the EZ bar with a palms-up grip your wrists actually like. Stand tall, bar hanging at long arms. Ribs down.',
    'Pin the elbows next to the torso. A few centimeters of travel is fine; a hip hitch is not.',
    'Curl toward the shoulders until the biceps fully shorten. Wrists stay stacked on the camber, not broken back.',
    'Lower to a full hang under control. The bottom is a stretch, not a bounce off the thighs.',
  ],
  mistakes: [
    { title: 'Logging EZ-bar curls as barbell curls', body: 'The camber is easier on most wrists and usually lets you load more. That extra plate is not a straight-bar PR. ez-bar-curl is this slug. barbell-curl is the other one. LIFTAG charts one bar.' },
    { title: 'Switching inner and outer camber every week', body: 'Closer grip is more biceps; wider is often friendlier on the wrists. Pick a default. If you rotate, put inner or outer in the set note or next week is a different lift with the same name.' },
    { title: 'Turning every set into a cheat curl', body: 'A little body English on a true last rep is one thing. If the hips start every rep, you are not curling. Drop the load or write “cheat” so the number is honest.' },
    { title: 'Logging preacher work on this slug', body: 'The pad takes your hips out and changes the load. ez-bar-preacher-curl is the other chart. Same bar, different lift.' },
  ],
  variations: [
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Straight bar, usually less load, harder on many wrists.' },
    { slug: 'ez-bar-preacher-curl', name: 'EZ-bar preacher curl', note: 'Same bar, pad, no standing cheat.' },
    { slug: 'standing-dumbbell-bicep-curl', name: 'Standing dumbbell bicep curl', note: 'Independent arms when the camber still bothers a wrist.' },
    { slug: 'standing-cable-bicep-curl', name: 'Standing cable bicep curl', note: 'Constant tension, easy to micro-load.' },
  ],
  progressions: [
    'Light EZ bar, strict tempo, full hang, same camber every set.',
    'Working sets of 6–10 where the torso never starts the bar.',
    'Add load when every work set stays on the same inner or outer grip.',
    'Preacher as a second pass, logged on its own slug.',
  ],
  programming: 'Main standing biceps lift: 3–4 sets of 6–10. The camber usually lets you load more than a straight bar, which is exactly why this is not barbell-curl. Scan the EZ-bar tag if the gym has one. Inner vs outer grip belongs in the set note, not in a second exercise. Rest 90–120 seconds if the bar is actually heavy.',
  equipmentAlternatives: [
    { slug: 'barbell-curl', name: 'Barbell curl', note: 'Use when there is no EZ bar, and keep that work on the straight-bar slug.' },
    { slug: 'standing-dumbbell-bicep-curl', name: 'Standing dumbbell bicep curl', note: 'When the camber is taken or one wrist hates even the angle.' },
  ],
  faqs: [
    {
      question: 'Should I log EZ-bar curls as barbell curls?',
      answer: 'No. The camber changes what the wrists and elbows will take, and the load follows. Keep ez-bar-curl. Mixing them onto barbell-curl looks like you got stronger when you just bent the bar.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'ez-bar-preacher-curl',
    'standing-dumbbell-bicep-curl',
    'incline-dumbbell-curl',
  ],
} satisfies ExerciseOverlay
