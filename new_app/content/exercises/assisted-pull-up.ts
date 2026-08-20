import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'assisted-pull-up',
  metaDescription: 'Assisted pull-up: counterweight, strict range, and how to log assistance so LIFTAG PRs do not invert.',
  steps: [
    'Set the counterweight, then step or kneel onto the pad using the machine handles. More selected weight is more help — you are lifting less of yourself.',
    'Take a pull-up or chin-up grip you will keep. Brace, and lower into a controlled hang with the pad still under you.',
    'Pull the elbows down until the chin is clearly over the handles. Chest toward the bar, not a craned neck.',
    'Descend smoothly. Do not bounce the platform at the bottom. Change the pin only when you are off the pad.',
  ],
  mistakes: [
    { title: 'Logging assisted reps as pull-ups', body: 'Strict pull-up is a different slug. Assistance belongs here until you own sets of 5 unassisted.' },
    { title: 'Adding pin weight and calling it progress', body: 'On most machines a higher pin is more help. Progress is less assistance, or the same pin for more clean reps. Log the pin the same way every session and put “assist” in the note so the chart is readable.' },
    { title: 'Kicking the pad through the bottom', body: 'If you have to jump the platform, you need more assistance or a shorter set. Strict or it is a kip.' },
    { title: 'Half hangs because the stack is rushing you', body: 'Take the hang. A short-range assisted pull-up does not turn into a full pull-up later.' },
  ],
  variations: [
    { slug: 'pull-up', name: 'Pull-up', note: 'The unassisted target. Move here when sets of 5 are clean.' },
    { slug: 'chin-up', name: 'Chin-up', note: 'Underhand assisted work if that is the goal grip.' },
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Smaller load jumps when the assist machine is in 10 kg bites.' },
    { slug: 'inverted-row', name: 'Inverted row', note: 'Horizontal pull while vertical strength is still catching up.' },
  ],
  progressions: [
    'Dead hangs and scapular pulls on a free bar.',
    'Assisted sets of 5–8 with a full hang. Reduce the pin when all sets stay clean.',
    'Mix in negatives or a single unassisted rep at the start of the set.',
    'Graduate to pull-up or chin-up and leave this slug. Do not keep logging unassisted work here.',
  ],
  programming: 'Main vertical pull until unassisted work exists: 3–5 sets. Pair with lat pulldown if you need more volume. Log the machine pin consistently — a “PR” that is actually more assistance is how people stall for months.',
  faqs: [
    {
      question: 'Band or machine?',
      answer: 'Both can live here if assistance is doing the work. Note “band” and the color/size, because a band is not a pin stack and LIFTAG will not know unless you say so. When the band comes off, switch to pull-up.',
    },
  ],
  relatedSlugs: [
    'pull-up',
    'chin-up',
    'lat-pulldown',
    'wide-grip-pull-up',
  ],
} satisfies ExerciseOverlay
