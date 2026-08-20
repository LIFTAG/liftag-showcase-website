import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-overhead-dumbbell-triceps-extension',
  metaDescription: 'Seated overhead dumbbell triceps extension: elbow path, stretch, and how to log long-head work in LIFTAG without mixing skullcrushers or rope pushdowns.',
  steps: [
    'Sit on a bench with a back if you have one. One dumbbell, both hands on the inner plate or handle, start locked out over the crown.',
    'Lower behind the head by bending the elbows. Upper arms stay by the ears, not flared to a T and not drifting into a pushdown.',
    'Stop in a stretch you can control. Do not dump the bell onto the traps. Ribs stay down; lumbar extension is not triceps length.',
    'Extend to a full lockout. The last third is the triceps. The shoulders do not shrug the bell back to the start.',
  ],
  mistakes: [
    { title: 'Logging these as skullcrushers', body: 'Lying EZ-bar work is ez-bar-skullcrusher. This is a seated overhead dumbbell. Different stretch, different load. Keep this slug. LIFTAG charts one pattern.' },
    { title: 'Flaring the elbows out to spare the stretch', body: 'Then the shoulders took over and the long head left. Keep the upper arms in a corridor beside the head, or drop the bell.' },
    { title: 'Flaring the ribs to fake range', body: 'A big arch is not a deeper triceps stretch. Brace, keep the ribs over the pelvis, and take the range the shoulders allow.' },
    { title: 'Logging two bells as one without a note', body: 'One bell held by both hands is the default. Two dumbbells is a different session and usually a different load. Put it in the set note or next week will not match.' },
  ],
  variations: [
    { slug: 'overhead-cable-triceps-extension', name: 'Overhead cable triceps extension', note: 'Constant tension, kinder to many elbows, still overhead.' },
    { slug: 'ez-bar-skullcrusher', name: 'EZ-bar skullcrusher', note: 'Lying isolation. Do not park overhead reps on that slug.' },
    { slug: 'lying-dumbbell-triceps-extension', name: 'Lying dumbbell triceps extension', note: 'Same bells, on your back, less overhead demand.' },
    { slug: 'cable-triceps-pushdown', name: 'Rope triceps pushdown', note: 'Elbows by the ribs instead of by the ears.' },
  ],
  progressions: [
    'Light bell, quiet ribs, stretch you can sit through.',
    'Working sets of 10–15 with the same one-bell or two-bell choice.',
    'Pause in the stretch before you chase a heavier bell.',
    'Overhead cable when the dumbbell bothers the elbows. Log that slug.',
  ],
  programming: 'Long-head accessory: 3–4 sets of 10–15 after a press or a pushdown, not both heavy overheads on the same day. Log the dumbbell in your hands. One bell held by both hands is still one load. Do not park these reps on ez-bar-skullcrusher or cable-triceps-pushdown. Rest just long enough that the lockouts stay overhead instead of turning into a heave.',
  equipmentAlternatives: [
    { slug: 'overhead-cable-triceps-extension', name: 'Overhead cable triceps extension', note: 'When you want a stack and constant tension instead of a free bell.' },
    { slug: 'lying-dumbbell-triceps-extension', name: 'Lying dumbbell triceps extension', note: 'If overhead bothers the shoulder but you still have the bells.' },
  ],
  faqs: [
    {
      question: 'One dumbbell or two?',
      answer: 'One bell held by both hands is the default on this slug. Two bells let each arm find its own path and usually mean less load. Pick one as the default for the block and write “two bells” if you rotate. Do not chase a two-bell number with a single bell next week.',
    },
  ],
  relatedSlugs: [
    'overhead-cable-triceps-extension',
    'ez-bar-skullcrusher',
    'lying-dumbbell-triceps-extension',
    'cable-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
