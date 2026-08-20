import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chest-supported-t-bar-row',
  metaDescription: 'Chest-supported T-bar row: pad height, elbow path, and a heavy row when the low back is already cooked.',
  steps: [
    'Set the chest pad so the sternum is on it, not the throat, and the handles are reachable with straight arms. Feet planted on the platform.',
    'Grip, brace, keep the chest glued to the pad, and pull toward the lower chest or upper abdomen by driving the elbows back.',
    'Let the shoulder blades retract without shrugging into the neck. Pause a beat at the top if the stack is drifting.',
    'Lower to a full comfortable reach. The arms go long; the chest does not leave the pad.',
  ],
  mistakes: [
    { title: 'Coming off the pad to finish', body: 'You just turned it into an unsupported row with worse leverage. Drop the pin.' },
    { title: 'Bouncing the stack', body: 'If the plates crash and rebound, the bottom of the row never happened. Control the last two inches.' },
    { title: 'Pad so high the neck is the contact point', body: 'Sternum on the pad. A throat rest makes every rep a fight and a shrug.' },
    { title: 'Logging this as a T-bar or machine seated row', body: 'Different support, different PR. Keep this slug when the gym has the chest pad station.' },
  ],
  variations: [
    { slug: 't-bar-row', name: 'T-bar row', note: 'No pad. Hinge required. Usually less load you can honestly own.' },
    { slug: 'machine-seated-row', name: 'Machine seated row', note: 'Same idea on a selectorized stack, often a different handle.' },
    { slug: 'incline-dumbbell-row', name: 'Incline dumbbell row', note: 'Chest-supported with independent arms.' },
    { slug: 'wide-grip-machine-seated-row', name: 'Wide-grip machine seated row', note: 'Wider elbows, more upper back.' },
  ],
  progressions: [
    'Machine seated row or incline dumbbell row to learn a quiet torso.',
    'Chest-supported T-bar with a handle you can keep the wrists happy on.',
    'Add load when the chest stays down for all work sets.',
    'Pause reps or a wider handle when the top of the row disappears.',
  ],
  programming: 'Use it as the main row on a day the deadlift already taxed the spinal erectors: 3–4 sets of 8–12. It will often out-load your barbell row. That is expected — the pad is doing the hinge. Do not chase that number on t-bar-row.',
  faqs: [
    {
      question: 'Close or wide handles?',
      answer: 'Close/neutral usually hits more lat. Wide/elbows-out hits more rhomboid and rear delt. Pick one as the default and note the other so LIFTAG is not averaging two lifts.',
    },
  ],
  relatedSlugs: [
    't-bar-row',
    'machine-seated-row',
    'incline-dumbbell-row',
    'seated-cable-row',
  ],
} satisfies ExerciseOverlay
