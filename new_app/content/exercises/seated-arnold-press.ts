import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-arnold-press',
  metaDescription: 'Seated Arnold press: rotation, range, and how to log it separately from seated dumbbell shoulder press in LIFTAG.',
  steps: [
    'Sit as you would for a seated dumbbell press. Start with the bells in front of the shoulders, palms facing you — a curl position, not a press position.',
    'Press and rotate together: palms finish forward at the top, bells over the crown. The turn is not a separate twist you do at the bottom under load.',
    'Lower on the reverse path. Palms face you again at the shoulders. Control the last third; that is the extra range you came for.',
    'Keep the elbows in front of the torso through the rotation. If they flare out wide at the bottom, you just invented a messy fly-press.',
  ],
  mistakes: [
    { title: 'Skipping the rotation and logging it here anyway', body: 'No turn is a seated dumbbell shoulder press. Keep this slug for the full Arnold. Mixing them hides that you dropped the hard part.' },
    { title: 'Twisting 40s at the bottom with straight arms', body: 'The rotation happens as you press. A stalled, loaded twist at the bottom is an internal-rotation experiment, not a press.' },
    { title: 'Bouncing out of the curl position', body: 'The bottom of an Arnold is the longest position. Pause or at least stay quiet. Rebounding off the delts wastes the extra range.' },
    { title: 'Chasing a 3RM', body: 'This is a hypertrophy press. When the bells are so heavy you cannot rotate, you are doing a sloppy seated press. Drop the load or switch slugs.' },
  ],
  variations: [
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Same seat, no rotation, more load.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'The strength press this is not trying to be.' },
    { slug: 'cable-lateral-raise', name: 'Cable lateral raise', note: 'Direct side-delt work if the rotation is the limiter, not the press.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Fixed path when you want overhead volume without the turn.' },
  ],
  progressions: [
    'Seated dumbbell press until the overhead finish is clean.',
    'Light Arnolds, slow rotation, pause at the bottom.',
    'Build 8–12 reps before you jump bells. If the turn disappears, the load jumped too soon.',
  ],
  programming: 'Run Arnold press as the main seated press on a shoulder day or as the second lift after a barbell overhead press. Three to four sets of 8–12. Do not share a progression with seated dumbbell shoulder press — LIFTAG will treat them as the same PR if you log them on one slug, and they are not.',
  equipmentAlternatives: [
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Use when the rotation bothers the shoulder or the bells are too heavy to turn cleanly.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'Single-arm overhead work with a friendlier path.' },
  ],
  faqs: [
    {
      question: 'Is Arnold press better than seated dumbbell press?',
      answer: 'It is longer, not better. You get more range at the bottom and a little extra rotation. You lose load. Pick one as the main seated press for a block so the chart is readable.',
    },
  ],
  relatedSlugs: [
    'seated-dumbbell-shoulder-press',
    'standing-barbell-overhead-press',
    'machine-shoulder-press',
    'cable-lateral-raise',
  ],
} satisfies ExerciseOverlay
