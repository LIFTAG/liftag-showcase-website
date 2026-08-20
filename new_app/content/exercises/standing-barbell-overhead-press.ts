import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-barbell-overhead-press',
  metaDescription: 'Standing barbell overhead press: brace, bar path, and how to log strict presses separately from push press in LIFTAG.',
  steps: [
    'Set the bar at upper-chest height. Grip just outside the shoulders, thumbs around the bar, wrists stacked. The bar sits on the front delts — not floating out in the hands.',
    'Walk it out one step. Feet under the hips or a modest stagger, glutes squeezed, ribs down. You should look like a standing front rack, not a curl.',
    'Press up and slightly back. Once the bar passes the hairline, get the head through so the finish is over the midfoot, not in front of the face.',
    'Lock out with the biceps by the ears. Lower to the delts under control. Re-brace before the next rep — this is not a bounce off the chest.',
    'If the knees dip, the set became a push press. Rack it, or switch lifts and log that instead.',
  ],
  mistakes: [
    { title: 'Knee dip on a strict-press log', body: 'A dip is a different lift and a different PR. If the bar only leaves the shoulders because the legs pushed, that set belongs on barbell push press.' },
    { title: 'Pressing around a frozen head', body: 'If lockout is still in front of your face, you never moved the head through. The bar path is a shallow S, not a rainbow out front.' },
    { title: 'Layback that turns it into a standing incline', body: 'A little lean is normal at heavy loads. A banana back with the ribs flared is bench press on your feet. Squeeze the glutes and pick a load you can stay tall with.' },
    { title: 'Index-finger-on-the-rings for no reason', body: 'That grip is a bench leftover. Most lifters press better a thumb-width outside the shoulders, wrists stacked over the elbow, not flared to 90°.' },
  ],
  variations: [
    { slug: 'barbell-push-press', name: 'Barbell push press', note: 'Leg drive to overload the same lockout. Keep it off this PR chart.' },
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Independent arms, no walk-out, easier to bail.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Fixed path when you want overhead volume without a bar on the delts.' },
    { slug: 'landmine-press', name: 'Landmine press', note: '45° path when a vertical lockout bothers the shoulder.' },
  ],
  progressions: [
    'Seated dumbbell press until the overhead position is comfortable and you can lock out without a huge arch.',
    'Empty-bar strict press with a pause at the forehead, then at lockout.',
    'Working sets of 3–6 that all finish over the midfoot. Add load when the knees stay quiet.',
    'Push press or landmine when the strict press stalls and the shoulders still feel good.',
  ],
  programming: 'This is the vertical press of record for most barbell lifters. Three to five work sets of 3–6, long rests — use the LIFTAG timer; rushing a strict press just turns it into a push press you pretend not to notice. Estimated 1RM is only useful if the logged sets were actually strict. Chase a clean rep PR before you jump 5 kg and start dipping.',
  equipmentAlternatives: [
    { slug: 'seated-dumbbell-shoulder-press', name: 'Seated dumbbell shoulder press', note: 'Default swap when there is no squat rack, or the bar bothers one shoulder.' },
    { slug: 'machine-shoulder-press', name: 'Machine shoulder press', note: 'Overhead volume without a spotter or a dumped bar.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'Keep pressing when a vertical lockout is a no-go.' },
  ],
  faqs: [
    {
      question: 'Should I press behind the neck?',
      answer: 'Not as the default. Behind-the-neck demands more external rotation than most gym shoulders have, especially cold. Press from the front delts. If a coach programs behind-the-neck, keep this slug and note it so the next session is not a surprise.',
    },
    {
      question: 'How do I log a set that started strict and turned into a push press?',
      answer: 'If the last reps needed a dip, note “push press finish” on that set or move the whole set to barbell push press. Mixing them in one LIFTAG progression is how a fake overhead PR shows up in week four.',
    },
  ],
  relatedSlugs: [
    'barbell-push-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'landmine-press',
    'seated-arnold-press',
  ],
} satisfies ExerciseOverlay
