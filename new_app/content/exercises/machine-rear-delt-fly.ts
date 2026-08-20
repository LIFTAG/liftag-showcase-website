import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-rear-delt-fly',
  metaDescription: 'Machine rear delt fly: face the pad, not the pec deck, and log reverse-fly volume on this LIFTAG slug so a scan does not steal your pec-deck chest chart.',
  steps: [
    'Face the pad. This is not pec-deck flys. Set the seat so the handles start around shoulder height, chest on the pad, elbows slightly bent.',
    'Sweep the arms out and back until they are roughly in line with the torso. Lead with the elbows. Shoulders stay away from the ears.',
    'Return slowly without letting the plates kiss. A slammed stack at the stretch is a rest, not a rep.',
    'Keep the same elbow angle. If the handles travel toward the ribs, you started rowing.',
    'Handle vs pad, high vs low hole: pick the setting that lets the rear delts work without the shoulder dumping. Note the hole if the gym has more than one.',
  ],
  mistakes: [
    { title: 'Sitting the pec-deck way', body: 'Back on the pad and bringing the arms together is pec-deck flys. Rear delt is face the pad and open. Scan the tag so LIFTAG opens this slug, not the chest one.' },
    { title: 'Bending the elbows into a machine row', body: 'Soft, nearly fixed elbow. If the finish looks like a seated row, drop the pin and fly. Rows have their own charts.' },
    { title: 'Heaving a stack you cannot open without a hitch', body: 'Rear-delt machines will let you load a row. If the chest comes off the pad, it is too heavy. This is not a 1RM lift.' },
    { title: 'Logging this as pec-deck flys', body: 'Same footprint, opposite direction, opposite chart. Mixing them is how a chest PR appears on a rear-delt day.' },
  ],
  variations: [
    { slug: 'bent-over-dumbbell-reverse-fly', name: 'Bent-over dumbbell reverse fly', note: 'Free-weight version. Harder to stabilize, same idea.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'Rear delt plus external rotation. Pair, do not swap blindly.' },
    { slug: 'pec-deck-flys', name: 'Pec deck flys', note: 'The other direction on many of these frames. Do not confuse them.' },
    { slug: 'cable-reverse-fly', name: 'Cable reverse fly', note: 'Cables when this machine is a wrist-handle design you cannot set up honestly.' },
  ],
  progressions: [
    'Light stack, two-second open, chest glued to the pad, plates not touching.',
    'Add a pin when the torso stays quiet for all the reps.',
    'Slow eccentrics if you run out of honest load before you run out of form.',
    'Dumbbell reverse fly or face pulls when the machine line does not match your shoulders.',
  ],
  programming: 'Rear-delt machine work is the volume you can do after a press without thinking about a hinge. Three to four sets of 12–20. At a partner gym the QR or NFC tag on this frame should open this slug. If it opens pec-deck flys, the log is already lying. Note the seat hole. Do not chase a machine 1RM. LIFTAG will still store the load, but the chart is for weekly volume, not a meet. Face pulls stay on their own slug.',
  equipmentAlternatives: [
    { slug: 'bent-over-dumbbell-reverse-fly', name: 'Bent-over dumbbell reverse fly', note: 'Default swap when this machine is taken, or the handles sit at the wrong height.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'Cable rear-delt work with a rope. Still not this lift.' },
  ],
  faqs: [
    {
      question: 'The pec-deck also faces this way. Same lift?',
      answer: 'No. If your chest is on the pad and you open the arms, it is machine rear delt fly. If your back is on the pad and you close the arms, it is pec-deck flys. Same frame, two slugs. Scan the tag that matches the direction you actually trained.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'shoulder-facepulls',
    'bent-over-dumbbell-reverse-fly',
    'cable-reverse-fly',
  ],
} satisfies ExerciseOverlay
