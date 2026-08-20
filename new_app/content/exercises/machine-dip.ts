import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-dip',
  metaDescription: 'Machine dip: seat height, lockout, and how to log plate-loaded or stack dips separately from parallel-bar dips in LIFTAG.',
  steps: [
    'Set the seat so the handles start near the lower chest and the feet are planted. Too high and you shrug; too low and you press from a dump.',
    'Grip with wrists stacked over the forearms, brace against the back pad, and keep the torso fairly upright — this is a triceps machine.',
    'Press to a full lockout without shooting the shoulders into the ears. Pause a beat at the top if the stack wants to bounce.',
    'Return until the upper arms are about parallel to the floor, or as deep as the shoulders stay quiet. Do not slam the pins.',
  ],
  mistakes: [
    { title: 'Logging machine dips as parallel-bar or chest dips', body: 'Fixed path, different load, different PR. Keep this slug. Scan the tag on the frame so it does not open the bar-dip lift.' },
    { title: 'Riding a seat so high the shoulders shrug every rep', body: 'If the first move is a trap shrug, drop the seat until the elbows can travel under the wrists.' },
    { title: 'Cutting the lockout to keep the stack moving', body: 'The last third is the triceps. Soften the elbows at the top and you turned it into a partial press.' },
    { title: 'Inconsistent plate vs stack logging', body: 'Some machines are selectorized, some take plates. Log the number on that machine and stay consistent, or the chart jumps every time you change gyms.' },
  ],
  variations: [
    { slug: 'parallel-bar-triceps-dip', name: 'Parallel bar triceps dip', note: 'Free support, more stability tax, same upright idea.' },
    { slug: 'chest-dips', name: 'Chest dips', note: 'Forward lean on bars when you want pec, not a machine path.' },
    { slug: 'assisted-dip', name: 'Assisted dip', note: 'Counterweight platform until bodyweight bars are clean.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'Loadable press if the dip machine bothers the shoulders.' },
  ],
  progressions: [
    'Light stack or empty horns, full lockout, no bounce.',
    'Working sets of 8–12 with the same seat hole.',
    'Add a pause at the bottom before you add load.',
    'Move to parallel-bar dips when the machine is easy and the shoulders stay quiet.',
  ],
  programming: 'Triceps volume you can do without balancing on bars: 3–4 sets of 8–12. Partner-gym tags on this frame should open machine dip, not chest dips. If you rotate a plate-loaded and a selectorized unit, put the machine in the set note so a 40 kg “PR” is not just a different stack.',
  faqs: [
    {
      question: 'Is a machine dip the same as an assisted dip?',
      answer: 'No. Assisted dip is a platform that unloads bodyweight on parallel bars. Machine dip is a seated or kneeling press on handles. Different pattern, different slug — log the one you sat on.',
    },
  ],
  relatedSlugs: [
    'parallel-bar-triceps-dip',
    'chest-dips',
    'close-grip-bench-press',
    'machine-triceps-extension',
  ],
} satisfies ExerciseOverlay
