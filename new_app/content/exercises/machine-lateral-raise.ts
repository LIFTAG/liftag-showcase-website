import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-lateral-raise',
  metaDescription: 'Machine lateral raise: pad on the elbow, no hitch, and logging stacked side-delt work without mixing cable laterals.',
  steps: [
    'Set the seat so the pads sit on the outside of the elbows or distal upper arms, not on the wrists. Wrists on the pad is a different, worse lever.',
    'Sit tall, ribs down, a light hold on the handles if there are any. Start with the arms slightly abducted so the stack is already floating.',
    'Raise until the upper arms are about parallel to the floor. Pause. Do not hitch the torso or hike the opposite shoulder to finish.',
    'Lower under control until the pads still have pressure. A slammed stack at the bottom is a rest, not a rep.',
  ],
  mistakes: [
    { title: 'Pads on the forearms or wrists', body: 'Then you are loading the elbow joint and the AC joint, not the side delt. Drop the seat or pick the machine whose pads actually hit the humerus.' },
    { title: 'Torso hitch every third rep', body: 'If you have to lean and jerk to move the pin, it is too heavy. This is not a lift you 1RM. Drop a plate and own the raise.' },
    { title: 'Logging the cable version here', body: 'Cable lateral raise is its own slug and a different resistance curve. Scan the machine tag so this lands on the right lift.' },
    { title: 'Raising past the point the pads leave the arm', body: 'When the pad slides up toward the shoulder, you lost the lever. Stop at parallel and keep contact.' },
  ],
  variations: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'More freedom to pick the line; more ways to cheat.' },
    { slug: 'barbell-upright-row', name: 'Barbell upright row', note: 'Barbell version of an upright-lateral pattern if the shoulders allow it.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Compound press these laterals should follow.' },
  ],
  progressions: [
    'Empty or light stack, pause at parallel, pads glued to the elbows.',
    'Add a pin when the torso stays quiet for all the reps.',
    'Slow eccentrics if you run out of plates before you run out of form.',
  ],
  programming: 'Machine laterals are the side-delt volume you can do between presses without thinking about cable height. Three to four sets of 10–15. Do not chase a machine 1RM — LIFTAG will still store the load, but the chart is for weekly volume, not a meet. Pair with face pulls if the pressing day fried the front of the shoulder.',
  equipmentAlternatives: [
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'Default swap when this machine is a wrist-pad design you cannot set up honestly.' },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'shoulder-facepulls',
    'barbell-upright-row',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
