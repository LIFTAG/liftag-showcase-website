import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'wide-grip-lat-pulldown',
  metaDescription: 'Wide-grip lat pulldown: hand placement, shorter range, and a LIFTAG log that does not share PRs with a standard pulldown.',
  steps: [
    'Same seat and thigh pad as a standard pulldown. Hands go out toward the bends of the lat bar — not hanging off the very ends if that wrecks the wrists.',
    'Start long. A wide grip already shortens the range; do not shorten it more by keeping the elbows bent at the top.',
    'Pull the bar to the upper chest with the elbows out and down. You will not get the same tuck as a close-grip. That is expected.',
    'If you cannot get the bar to the chest without a 45° lean, the grip is too wide or the stack is too heavy. Fix one of those, not the log.',
  ],
  mistakes: [
    { title: 'Hands on the sleeves plus a yank', body: 'The extra-wide, extra-heavy version is a shoulder jam, not a lat exercise. Come in off the ends and own the path.' },
    { title: 'Logging this as a standard lat pulldown', body: 'You will look stronger on the wide-grip chart and weaker on the one you actually care about. Keep this slug.' },
    { title: 'Turning it into a behind-the-neck wide pull', body: 'Wide plus behind-the-neck is two stressors at once. Pull to the chest unless you have a specific reason and the mobility to match.' },
    { title: 'Half-reps at the top because the stretch feels weak', body: 'Wide grip already cuts range. Take the stretch you still have. Resting at 90° elbows is just a paused cheat.' },
  ],
  variations: [
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Shoulder-width-ish grip, more range, the default pulldown.' },
    { slug: 'close-grip-lat-pulldown', name: 'Close-grip lat pulldown', note: 'The other grip extreme. Do not bounce between them on one chart.' },
    { slug: 'wide-grip-pull-up', name: 'Wide-grip pull-up', note: 'The bar version. Harder, same idea.' },
    { slug: 'pull-up', name: 'Pull-up', note: 'Standard overhand pull-up if wide-grip on a bar is too much.' },
  ],
  progressions: [
    'Standard lat pulldown until the chest-touch is automatic.',
    'Wide-grip with a lighter pin than your normal pulldown. Full stretch, bar to the chest.',
    'Add load when you no longer need a lean to finish.',
    'Wide-grip pull-ups if the goal is actually that bar, not a stack PR.',
  ],
  programming: 'Use wide-grip as a second vertical pull, not as a surprise swap on the main pulldown day. Three to four sets of 8–12 at a load below your standard-grip work. If LIFTAG shows a PR that came from a narrower hand placement, you logged the wrong slug.',
  equipmentAlternatives: [
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Default when the wide grip bothers the shoulders or wrists.' },
    { slug: 'wide-grip-pull-up', name: 'Wide-grip pull-up', note: 'Take it to the bar once the pulldown is easy.' },
  ],
  relatedSlugs: [
    'lat-pulldown',
    'close-grip-lat-pulldown',
    'wide-grip-pull-up',
    'pull-up',
  ],
} satisfies ExerciseOverlay
