import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'straight-arm-pulldown',
  metaDescription: 'Straight-arm pulldown: fixed elbows, lat sweep to the thighs, and why this is not a lat pulldown.',
  steps: [
    'Clip a bar or rope to the high pulley. Step back, hinge slightly, and reach overhead with the elbows softly bent — that bend stays.',
    'Sweep the attachment to the thighs by moving at the shoulder, not by bending the elbows. Ribs down, cable clear of the face.',
    'Squeeze at the bottom without leaning back into a standing crunch. Return slowly to a comfortable overhead reach.',
    'Pick bar or rope and keep it. A rope can separate at the bottom; a bar keeps both hands honest.',
  ],
  mistakes: [
    { title: 'Turning it into a pulldown', body: 'If the elbows keep bending, you are doing a standing lat pulldown. Lock the elbow angle and drop the stack.' },
    { title: 'Finishing with spinal extension', body: 'The lats take the bar to the legs. A laid-back finish is ego, not range.' },
    { title: 'Logging this as lat pulldown', body: 'Different joint action, different PR. Isolation stays on this slug.' },
    { title: 'Standing so close the cable hits your face', body: 'Step back until the line of pull is a long arc. Crowding the stack shortens the lat and crowds the shoulders.' },
  ],
  variations: [
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'The compound version: elbows bend, you sit, you can load more.' },
    { slug: 'dumbbell-pullover', name: 'Dumbbell pullover', note: 'Same long-arm shoulder sweep, now on a bench.' },
    { slug: 'pull-up', name: 'Pull-up', note: 'Vertical compound pull this isolation is supporting.' },
  ],
  progressions: [
    'Light rope, slow sweep, elbows locked in a soft bend.',
    'Working sets of 10–15 where the bar still reaches the thighs without a lean.',
    'Add load when the last three reps still look like the first three.',
    'Pause at the thighs or a longer overhead reach when you stall.',
  ],
  programming: 'Lat isolation after pull-ups or pulldowns: 2–4 sets of 10–15. It will be light compared with a pulldown. That is correct. Do not chase pulldown numbers here or the elbows will start helping.',
  relatedSlugs: [
    'lat-pulldown',
    'dumbbell-pullover',
    'pull-up',
    'wide-grip-lat-pulldown',
  ],
} satisfies ExerciseOverlay
