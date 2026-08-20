import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-lying-leg-curl',
  metaDescription: 'Machine lying leg curl: Achilles pad, hips pinned, full knee flexion, and how to log prone curls in LIFTAG without mixing seated-curl numbers onto this slug.',
  steps: [
    'Lie prone. Line the knees with the cam. The pad sits on the lower Achilles, not halfway up the calf.',
    'Hips on the pad, not hovering. Grab the handles. If the unit has a lap strap, use it.',
    'Curl the heels toward the glutes without yanking the stack or popping the hips off the bench.',
    'Pause a beat at peak flexion. Lower under control into a stretch you own. Stop before the plates crash.',
    'Re-set the hips every rep. If they have crept up, the last curl was a hinge in disguise.',
  ],
  mistakes: [
    { title: 'Hips peeling off the pad', body: 'You turned a knee curl into a poor glute kick. Pin the pelvis. If you cannot, drop the pin.' },
    { title: 'Pad on the mid-calf', body: 'That shortens the lever and chews the Achilles angle. Slide it down until it loads the heel, not the belly of the calf.' },
    { title: 'Tiny range with a huge stack', body: 'A two-inch nod is not a curl. Own the stretch and the squeeze, or you are logging noise.' },
    { title: 'Logging seated curls here', body: 'Hips extended on a bench is not hips flexed in a seat. Lying and seated are two charts. Keep them that way.' },
  ],
  variations: [
    { slug: 'machine-seated-leg-curl', name: 'Machine seated leg curl', note: 'Same knee flexion, hips bent. Longer hamstring length, different PR.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'Hard eccentric at long length when you are done with the stack.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hip-hinge hamstrings you can load on day one.' },
    { slug: 'glute-ham-raise', name: 'Glute ham raise', note: 'GHD version if you want a real concentric past the curl machine.' },
  ],
  progressions: [
    'Light full-range lying curls with the hips glued down.',
    'Pause at peak flexion without lifting the pelvis.',
    'Single-leg when one side always bails first.',
    'Heavier 8–12 once the pad and cam are the same every session.',
  ],
  programming: 'Isolation after the hinge, not a deadlift replacement: 2–4 sets of 8–15. Scan the actual prone unit so this slug opens, not the seated curl. If last week the hips floated, write it in the LIFTAG note and keep the load honest until they stay down.',
  equipmentAlternatives: [
    { slug: 'machine-seated-leg-curl', name: 'Machine seated leg curl', note: 'Keep knee-flexion volume when the lying unit is a queue.' },
    { slug: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', note: 'No curl machine. Anchor the heels and own the eccentric.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Default hinge swap if both curl stations are taken.' },
  ],
  faqs: [
    {
      question: 'Lying curl or seated curl?',
      answer: 'Lying keeps the hips extended. Seated parks them at about 90° and puts the hamstrings on a longer stretch. Both are real knee-flexion work. They are not the same lift. Log the one you actually lay or sat on.',
    },
  ],
  relatedSlugs: [
    'nordic-hamstring-curl',
    'barbell-romanian-deadlift-rdl',
    'machine-seated-leg-curl',
    'glute-ham-raise',
  ],
} satisfies ExerciseOverlay
