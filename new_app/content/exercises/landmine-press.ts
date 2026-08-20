import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'landmine-press',
  metaDescription: 'Landmine press: stance, 45° path, and logging landmine work in LIFTAG when a strict overhead press bothers the shoulder.',
  steps: [
    'Wedge the sleeve in a landmine or a corner with a towel. Load the other end. Stand in a staggered stance with the inside foot back, bar at the working shoulder.',
    'Brace like an anti-rotation plank. The free hand can rest on the hip or the rack. Ribs down — this lift loves to become a standing crunch.',
    'Press along the 45° arc until the arm is long in front of the face, not a vertical lockout by the ear. Do not shrug the finish into the neck.',
    'Lower to the shoulder under control. Reset the stance if the back foot drifted. Switch sides and match the reps.',
  ],
  mistakes: [
    { title: 'Standing so far away it becomes a front raise', body: 'Too much distance and you are lifting the sleeve with a straight arm. Step in until the start is at the shoulder and the path is a press.' },
    { title: 'Standing so close you stall at the chest', body: 'Crowding the landmine leaves no arc. Give the bar a little room so it can travel up and in.' },
    { title: 'Letting the torso rotate with every rep', body: 'Half the point is not rotating. If the opposite shoulder yanks back, drop the load or drop to half-kneeling and own the trunk.' },
    { title: 'Logging this as standing overhead press', body: 'Different path, different PR. Keep this slug, and note half-kneeling vs standing if you switch.' },
  ],
  variations: [
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Vertical bar, more load, stricter PR.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Independent arms on a bench when you do not have a landmine.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Fixed overhead path for volume.' },
    { slug: 'landmine-row', name: 'Landmine row', note: 'Same station, opposite direction. Do not log a row as a press.' },
  ],
  progressions: [
    'Half-kneeling landmine press with a light plate until the ribcage stays down.',
    'Standing staggered-stance presses, matching both arms.',
    'Add load when the finish is still a press, not a shrug or a crunch.',
    'Use it as the main press when a vertical lockout is off the table.',
  ],
  programming: 'Landmine press earns its keep on beat-up-shoulder days and as a single-arm main press. Three to four sets of 6–10 per arm. Log one lift, not two, and note if a side failed first. Rest between arms if the first side is still gasping — the LIFTAG timer still applies.',
  equipmentAlternatives: [
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'No landmine, no corner — use a dumbbell and a bench.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Machine path when you want both arms working together.' },
  ],
  faqs: [
    {
      question: 'Half-kneeling or standing?',
      answer: 'Half-kneeling is the teaching stance and a core drill. Standing lets you load more. Put the stance in a set note if you use both; otherwise next week’s you will wonder why the weight jumped.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'landmine-row',
  ],
} satisfies ExerciseOverlay
