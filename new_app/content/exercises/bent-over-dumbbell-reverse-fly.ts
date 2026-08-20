import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'bent-over-dumbbell-reverse-fly',
  metaDescription: 'Bent-over dumbbell reverse fly: stay hinged, lead with the elbow, and log rear-delt volume off face pulls, rows, and the pec-deck slug in LIFTAG each week.',
  steps: [
    'Hold light bells, hinge at the hips with a long spine, and let the arms hang under the shoulders. Soft elbow bend, and keep that same bend.',
    'Open the arms out and slightly back until they approach torso level. Lead with the upper arms, not a wrist flick.',
    'Shoulders stay away from the ears. Squeeze the rear delts, then lower slowly until the bells hang without a bounce.',
    'The torso does not stand up as the bells rise. If the chest lifts, you just turned a fly into a shrug-row.',
    'Chest-supported on an incline bench is fine if the hinge is the limiter. Same lift. Put “chest-supported” in a note.',
  ],
  mistakes: [
    { title: 'Standing up as the bells rise', body: 'That is hip drive, not rear delt. Stay hinged. If you cannot, the pair is too heavy or the hinge is not strong enough yet.' },
    { title: 'Bending the elbows into a row', body: 'If the bells travel to the hip, you logged the wrong pattern. Soft, nearly fixed elbow. A row belongs on single-arm dumbbell row.' },
    { title: 'Using a pair you would lateral-raise', body: 'Reverse flies are lighter than laterals for most people. If you have to heave, you are not flying. Drop the bells.' },
    { title: 'Logging these as face pulls', body: 'Face pulls are a high-elbow cable with external rotation. This is a horizontal fly from a hinge. Keep the slugs apart or both charts become fiction.' },
  ],
  variations: [
    { slug: 'machine-rear-delt-fly', name: 'Machine rear delt fly', note: 'Chest on a pad, less hinge, same neighborhood. Own slug, own chart.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'Rear delt plus external rotation. Pair, do not swap blindly.' },
    { slug: 'cable-reverse-fly', name: 'Cable reverse fly', note: 'Tension at the stretch. Do not dump it onto this dumbbell log.' },
    { slug: 'standing-dumbbell-lateral-raise', name: 'Standing dumbbell lateral raise', note: 'Side delt, standing. Different head, different lift.' },
  ],
  progressions: [
    'Very light bells, two-second open, two-second lower, hinge that does not move.',
    'Chest-supported on an incline if the low back is the thing that fails first. Note it.',
    'Add load only while the elbows stay soft and the torso stays put.',
    'Face pulls or the rear-delt machine when you want more load without the hinge.',
  ],
  programming: 'Rear-delt work is volume work, not a PR lift. Three to four sets of 12–20 after a press or a row. Log the actual dumbbell weight, not the pair total. Chest-supported and standing hinge stay on this slug; the note is how you tell them apart next week. Face pulls and machine rear delt fly have their own charts. You do not need a LIFTAG estimated 1RM here. Let the rest timer run. Rushing these just turns them into a row you pretend not to notice.',
  equipmentAlternatives: [
    { slug: 'machine-rear-delt-fly', name: 'Machine rear delt fly', note: 'When the hinge is the problem, or you want a pad on the chest.' },
    { slug: 'cable-reverse-fly', name: 'Cable reverse fly', note: 'Cables when the dumbbells feel empty at the bottom.' },
    { slug: 'shoulder-facepulls', name: 'Shoulder face pulls', note: 'High-elbow rear-delt work with a friendlier finish for a lot of shoulders.' },
  ],
  faqs: [
    {
      question: 'Is a reverse fly just a light row?',
      answer: 'No. A row bends the elbow and sends the load to the hip or ribs. A reverse fly keeps a soft, fixed elbow and opens the arm out. If the bells end next to your pockets, log a row. If they end out to the sides, it belongs here.',
    },
  ],
  relatedSlugs: [
    'shoulder-facepulls',
    'machine-rear-delt-fly',
    'cable-reverse-fly',
    'standing-dumbbell-lateral-raise',
  ],
} satisfies ExerciseOverlay
