import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-push-press',
  metaDescription: 'Barbell push press: short dip, hard drive, and keeping these numbers off the strict overhead-press chart in LIFTAG.',
  steps: [
    'Set up like a standing overhead press: bar on the front delts, grip just outside the shoulders, glutes on, ribs down.',
    'Dip two to four inches. Knees go forward, torso stays vertical. If the hips shoot back, you just good-morninged a bar on your delts.',
    'Drive through the floor so the bar floats off the shoulders, then punch to lockout. Do not press while you are still dipping.',
    'Finish with the head through and the bar over the midfoot. Lower to the delts, or recatch the dip, then reset the breath before the next rep.',
    'Feet stay planted. This is not a jerk, a split, or a squat. The legs start the bar; the arms finish it.',
  ],
  mistakes: [
    { title: 'Pressing during the dip', body: 'The dip loads the legs. If the arms are already pushing, you stole the drive and the bar stalls at the forehead. Dip, drive, then press.' },
    { title: 'Logging push press as strict overhead press', body: 'You will invent a fake strict PR in a week. Keep this slug. Note “strict” only if you actually switched lifts.' },
    { title: 'A squat-depth dip', body: 'Long dips dump the torso forward and waste the stretch-shortening. Short and vertical. Think quarter-dip, not a front squat.' },
    { title: 'Cutting the lockout because the legs already did the work', body: 'The point is still an overhead lockout. Stand tall at the top. A half-press with a bounce is just a dip shrug.' },
  ],
  variations: [
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'No dip. The strict version this overloads.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'Single-arm drive when a barbell lockout is not the goal.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Take the legs out when you want strict shoulder work.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Volume without a dip or a dumped bar.' },
  ],
  progressions: [
    'Own a strict standing press with the same grip and setup.',
    'Light push press focusing on a vertical dip and a floating bar, not on load.',
    'Build triples and fives that still lock out over the midfoot.',
    'Use it to overload the strict press, not to replace it forever.',
  ],
  programming: 'Push press is a power lift and an overhead-overload tool. Three to five sets of 2–5, full rest — three minutes is normal, and the LIFTAG timer is there so you do not turn the last set into a grind. Do not feed these numbers into a strict estimated 1RM. If you use it as conditioning, log the rest you actually took so next week is not a surprise.',
  equipmentAlternatives: [
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'When the goal is strict strength, not drive.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'A drive you can do one arm at a time if the bar bothers a shoulder.' },
  ],
  faqs: [
    {
      question: 'Can I use a push-press PR to pick a strict overhead attempt?',
      answer: 'No. The legs contribute a lot. A push-press estimated 1RM in LIFTAG will overshoot a strict attempt. Use the strict slug to pick strict loads, and keep this one for the dip-drive work.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'landmine-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'barbell-power-clean',
  ],
} satisfies ExerciseOverlay
