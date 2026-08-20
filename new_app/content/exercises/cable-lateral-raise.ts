import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-lateral-raise',
  metaDescription: 'Cable lateral raise: pulley height, elbow lead, and side-delt volume that actually stays on the cable in LIFTAG.',
  steps: [
    'Set a D-handle on a low pulley — ankle to mid-shin. Stand side-on so the cable runs across the body, working hand starting near the opposite hip.',
    'Soft bend in the elbow, and keep that same bend. Raise until the upper arm is about parallel to the floor. Lead with the elbow, not a straight-arm swing.',
    'Keep the cable slightly behind the hip so the line of pull stays on the side delt. If the handle drifts in front, you are front-raising.',
    'Lower until the delt still has tension. The whole point of a cable is that the bottom is not a dead hang like a dumbbell.',
  ],
  mistakes: [
    { title: 'Leaning so far away it becomes a shrug', body: 'A slight lean is a trick to keep tension. A big lean plus a hike of the shoulder is a trap exercise. Stand taller and drop the pin.' },
    { title: 'Raising the handle to the ear', body: 'Past about shoulder height, most lifters are all upper trap. Stop when the humerus is roughly parallel unless you actually want that shrug.' },
    { title: 'Pulley at chest height', body: 'Then the first half of the raise is empty and the top is a crunch. Low pulley. If the first 30° feels like nothing, you are standing over the stack.' },
    { title: 'Logging both arms as two exercises', body: 'One lift. Alternate or do them together. If one side is weaker, note it — do not split the progression.' },
  ],
  variations: [
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'Pad on the elbow, less setup, both arms at once.' },
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'More load, more trap, same neighborhood if the shoulder allows it.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'Rear delt and external rotation, not side delt — pair, do not swap blindly.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'The compound that laterals sit behind.' },
  ],
  progressions: [
    'Light cable, two-second raise, two-second lower, no lean.',
    'Add load when you can still stop at parallel without a hitch.',
    'Cuff around the upper arm if the handle bothers the wrist or elbow.',
    'Use laterals after a press, not as a fake main lift with a huge lean.',
  ],
  programming: 'Side-delt work is volume work. Three to four sets of 10–15 after a press, not instead of one. Cables beat swinging dumbbells at the bottom because the stack is still pulling. You do not need a LIFTAG estimated 1RM here — chase clean reps and a note if you switched from a cuff to a handle.',
  equipmentAlternatives: [
    { slug: 'machine-lateral-raise', name: 'Machine lateral raise', note: 'When every low pulley is taken, or you want both arms at once.' },
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'Only if the shoulders like the pattern. Stop if it pinches.' },
  ],
  faqs: [
    {
      question: 'Should I raise to the ear or to the shoulder?',
      answer: 'Shoulder height is enough for most lifters. Going higher is usually a trap shrug. If you want traps, log dumbbell shrug. If you want side delts, stop around parallel.',
    },
  ],
  relatedSlugs: [
    'standing-dumbbell-lateral-raise',
    'machine-lateral-raise',
    'shoulder-facepulls',
    'barbell-upright-row',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
