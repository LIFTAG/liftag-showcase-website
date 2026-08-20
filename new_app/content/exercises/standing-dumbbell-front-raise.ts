import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-front-raise',
  metaDescription: 'Standing dumbbell front raise: stop at shoulder height, skip the swing, and log front-delt isolation off the overhead press chart in LIFTAG so PRs stay honest.',
  steps: [
    'Stand tall with a bell in each hand at the thighs, palms down or in. Same soft elbow bend the whole way. Ribs stacked, not a standing crunch.',
    'Raise one or both bells forward to about shoulder height. Wrists stay in line with the forearms. The path is in front of the shoulder, not out toward a lateral.',
    'Lower slowly. The bottom is where people start swinging to fake the next rep. Let the bells settle, then raise again.',
    'Alternating is fine. It is still one lift. Match the reps and note a lagging side instead of splitting the progression.',
    'If you have to lean back or dip the knees to get the bells up, drop the pair. This is not a press with straight arms.',
  ],
  mistakes: [
    { title: 'Leaning back so it becomes a standing crunch', body: 'A little brace is normal. A banana back with the bells floating up on momentum is not a front raise. Stand taller and drop the load.' },
    { title: 'Raising overhead', body: 'Past about shoulder height you are leftover-pressing with a terrible lever. Stop around eye to shoulder level unless a coach actually programmed a full swing-through.' },
    { title: 'Logging this as the overhead press', body: 'Different tool, different PR. Strict press, landmine, and this isolation stay on their own slugs. Mixing them is how a fake front-delt PR shows up in week four.' },
    { title: 'Using your lateral-raise load here', body: 'Front raises are usually lighter. If you copied last week’s side-delt pair, you will swing. Log the actual bells, not the pair you wish you used.' },
  ],
  variations: [
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'The compound these raises sit behind. Do not swap them for a main press.' },
    { slug: 'landmine-press', name: 'Landmine press', note: '45° press when a vertical lockout bothers the shoulder. Still a press, still its own log.' },
    { slug: 'standing-dumbbell-lateral-raise', name: 'Standing dumbbell lateral raise', note: 'Side delt. Pair on a shoulder day; do not treat them as the same lift.' },
    { slug: 'cable-front-raise', name: 'Cable front raise', note: 'Tension at the bottom. Keep it off this dumbbell chart.' },
  ],
  progressions: [
    'Light bells, two-second raise, two-second lower, no lean.',
    'Alternating reps if the trunk starts to rock.',
    'Add load when both arms still stop at shoulder height without a hitch.',
    'Drop the raise and press if the front delts are already cooked from overhead work.',
  ],
  programming: 'Front raises are extra front-delt volume, not a replacement for a press. Two to four sets of 10–15 after overhead or incline work. Log the actual dumbbell weight, not the pair total. Alternating and simultaneous stay on this slug; put the style in a set note so next week is not a surprise. Cable front raise is a different chart. You do not need a LIFTAG estimated 1RM here. Let the rest timer run. Rushing these just turns them into a swing.',
  equipmentAlternatives: [
    { slug: 'cable-front-raise', name: 'Cable front raise', note: 'When you want the stack pulling at the bottom, or the dumbbells start swinging.' },
    { slug: 'landmine-press', name: 'Landmine press', note: 'If the goal is still a press, not a raise. Log the press.' },
  ],
  faqs: [
    {
      question: 'Do I still need front raises if I already overhead press?',
      answer: 'Usually no. Presses already hammer the front delt. Add these when you want extra isolation after the press, not instead of one. If the press already fries the front of the shoulder, skip the raise and keep the LIFTAG chart on the press you actually did.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'landmine-press',
    'standing-dumbbell-lateral-raise',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
