import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'plank',
  metaDescription: 'Plank: setup, bracing, and how to log timed holds in LIFTAG so core work does not disappear next to crunches.',
  steps: [
    'Place the forearms on the floor with elbows under the shoulders and the hands roughly in line. Legs long, toes down.',
    'Press the floor away so the shoulder blades are not dumped between the arms. Glutes and quads on — the hips should not sag or pike.',
    'Build a long line from head to heels. Look at the floor, not the wall in front of you.',
    'Breathe. Hold until the line breaks, then drop. A silent, shaking hold with no air is panic, not bracing.',
  ],
  mistakes: [
    { title: 'Sagging the low back to buy more seconds', body: 'The hold only counts while the line holds. Hips dropping is the end of the set, not extra credit.' },
    { title: 'Piking the hips to make it easier', body: 'Then it is a sad downward dog. If you cannot keep the hips in line, shorten the lever or drop to knees and note it.' },
    { title: 'Logging “1 set” with no time', body: 'A 20-second plank and a 90-second plank are not the same session. Put the seconds in the log or the history is a row of ones.' },
    { title: 'Holding the breath for the whole attempt', body: 'You are training a brace you can breathe behind, not a countdown until you turn purple.' },
  ],
  variations: [
    { slug: 'side-plank', name: 'Side plank', note: 'Lateral brace; log left and right instead of pretending they are one hold.' },
    { slug: 'hollow-body-hold', name: 'Hollow body hold', note: 'Supine brace with a posterior pelvic tilt — different skill, still timed.' },
    { slug: 'dead-bug', name: 'Dead bug', note: 'Moving limbs while the low back stays quiet.' },
    { slug: 'cable-pallof-press', name: 'Cable Pallof press', note: 'Anti-rotation when you want load instead of a longer hold.' },
  ],
  progressions: [
    'Knee plank or a shortened lever until 30 clean seconds exist.',
    'Full forearm plank, timed, line unbroken.',
    'Add time in 10-second jumps, or add a plate on the back — not both in the same week.',
    'Long-lever (forearms slightly forward) or side plank once 60–90 seconds is easy.',
  ],
  programming: 'Three holds, not a 10-minute stare at the floor. Stop the set when the hips sag; that is the real duration. If you load it, log the plate. Side plank and hollow holds are different slugs — do not dump every brace onto this one because they all “feel like core.”',
  faqs: [
    {
      question: 'How long should a plank be?',
      answer: 'Long enough that the brace is hard, short enough that the line never breaks. For most lifters that is 20–60 seconds per set, not a five-minute PR attempt. Progress the quality first, then the clock.',
    },
  ],
  relatedSlugs: [
    'side-plank',
    'hanging-leg-raise',
    'cable-pallof-press',
    'hollow-body-hold',
    'crunch',
    'kneeling-ab-rollout',
  ],
} satisfies ExerciseOverlay
