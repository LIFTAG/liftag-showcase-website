import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-upright-row',
  metaDescription: 'Barbell upright row: grip width, elbow height, and when to log this lift versus laterals or shrugs in LIFTAG.',
  steps: [
    'Stand tall with the bar at the thighs, grip at or slightly outside the shoulders — not a close curl grip. Wrists stay stacked; thumbs around the bar.',
    'Elbows lead. Pull the bar up the front of the body until the upper arms are roughly parallel to the floor. For most lifters that puts the bar around the lower chest, not under the chin.',
    'Pause without rolling the shoulders. Lower to a hang with the traps stretched, then reset before the next pull.',
    'If the front of the shoulder pinches, stop the set. Laterals and face pulls live in the same neighborhood without that jam.',
  ],
  mistakes: [
    { title: 'Narrow grip pulled to the chin', body: 'Hands together plus a high pull is the version that irritates a lot of AC joints. Widen the grip and stop when the elbows are at shoulder height.' },
    { title: 'Turning it into a hang high pull', body: 'No hip dip unless you are actually doing an Olympic high pull — and that is not this slug. Upright row is an upper-body pull, not a snatch pull.' },
    { title: 'Rolling the shoulders at the top', body: 'That roll is theater. It does not add trap work; it adds irritation. Pull, pause, lower.' },
    { title: 'Logging these as dumbbell shrugs', body: 'Different pattern, different PR. Shrugs go straight up. If the elbows bent and the bar traveled up the chest, it belongs here.' },
  ],
  variations: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'The usual swap when upright rows pinch. Side delt without the internal-rotation jam.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'High-elbow pulling with external rotation instead of a bar under the chin.' },
    { slug: 'dumbbell-shrug', name: 'Dumbbell shrug', note: 'Straight elevation when the target is traps, not delts.' },
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'Isolation volume if you still want the lateral pattern.' },
  ],
  progressions: [
    'Empty bar, wide-enough grip, stop at elbow-parallel, film a front view once.',
    'Add load only while the shoulder stays quiet at that height.',
    'Swap to cable laterals the first session it pinches. That is a change of lift, not a failure.',
  ],
  programming: 'Upright rows are an accessory, not a main pull. Three to four sets of 8–12 after a press or a row. Do not force a PR on a lift a lot of shoulders hate — if you keep it, log the grip width in a note so you are not reinventing it next week. Estimated 1RM is almost never useful here.',
  equipmentAlternatives: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'First swap when the bar path bothers the shoulder.' },
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'Fixed path, no bar against the chest.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'High-elbow work with a friendlier finish.' },
  ],
  faqs: [
    {
      question: 'Are upright rows bad for the shoulders?',
      answer: 'They are a bad default for a lot of lifters, not a forbidden lift. Narrow + to-the-chin is the usual problem. Widen, stop at elbow-parallel, and dump the lift if it still pinches. Nothing in LIFTAG requires you to keep a lift that hurts.',
    },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'dumbbell-shrug',
    'shoulder-facepulls',
    'machine-lateral-raise',
  ],
} satisfies ExerciseOverlay
