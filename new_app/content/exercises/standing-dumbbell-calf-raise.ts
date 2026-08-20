import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-calf-raise',
  metaDescription: 'Standing dumbbell calf raise: step, straight knee, full stretch, and how to log free-weight calves in LIFTAG separately from seated and machine standing raises.',
  steps: [
    'Hold dumbbells at the sides. Balls of the feet on a step, heels hanging. Knees straight but not jammed into a hyperextension.',
    'Drop the heels into a stretch you can pause. If the step is too high to own, find a plate with an edge or a lower block.',
    'Press through the big-toe side of the foot to a hard lockout. Pause. Do not bounce the knees.',
    'Lower slowly. If the bells are swinging, the set is a hitch, not a calf raise.',
    'Single-leg with one dumbbell if the double-leg version is just a shuffle.',
  ],
  mistakes: [
    { title: 'Bending the knees into a squat-calf hybrid', body: 'Once the knees flex, you stole the set from the gastrocnemius. Soften them a hair, then keep that angle.' },
    { title: 'Logging seated or machine standing here', body: 'Bent-knee soleus work is seated-calf-raise. A shoulder-pad machine is machine-standing-calf-raise. Dumbbells on a step stay on this slug.' },
    { title: 'Partial pumps with no stretch', body: 'A two-inch tick on the floor is not a calf raise. Hang the heel, lock the ankle out, or you are logging noise.' },
    { title: 'Rolling onto the outside of the foot', body: 'Drive the big-toe mound. A rolled ankle at lockout is a fake squeeze and a real sprain waiting.' },
  ],
  variations: [
    { slug: 'machine-standing-calf-raise', name: 'Machine standing calf raise', note: 'Same straight-knee bias, easier to load, different PR.' },
    { slug: 'seated-calf-raise', name: 'Seated calf raise', note: 'Bent-knee soleus work. Pair it. Do not replace this and call it the same thing.' },
    { slug: 'bodyweight-calf-raise', name: 'Bodyweight calf raise', note: 'Unload it. Keep the stretch on a step.' },
    { slug: 'barbell-calf-raise', name: 'Barbell calf raise', note: 'Bar on the back when the dumbbells are not the limiter.' },
  ],
  progressions: [
    'Bodyweight on a step with a pause at both ends.',
    'Light dumbbells, double-leg, full stretch every rep.',
    'Add load when the stretch never shortens across the set.',
    'Single-leg standing if one side always cheats the lockout. Log that side.',
  ],
  programming: '3–4 sets of 8–15 after the squat or hinge. Straight-knee work hits more gastrocnemius than the seated raise. Log the pair of dumbbells, not “calves.” If you jump on the standing machine next week, that is a second lift. Do not let a dumbbell PR leak onto the seated or machine chart.',
  equipmentAlternatives: [
    { slug: 'machine-standing-calf-raise', name: 'Machine standing calf raise', note: 'When you want a pad instead of bells and a step.' },
    { slug: 'seated-calf-raise', name: 'Seated calf raise', note: 'Keep calf volume when you need bent knees.' },
    { slug: 'bodyweight-calf-raise', name: 'Bodyweight calf raise', note: 'Travel. Same stretch, no load.' },
  ],
  faqs: [
    {
      question: 'Do I need a step, or can I raise from the floor?',
      answer: 'A step is the lift. From the floor you have almost no stretch, which is most of the point. If you only have a gym floor, log fewer honest reps on a plate edge rather than a huge stack of bounced floor ticks. Note “floor” if you must, and do not compare it to a step week.',
    },
  ],
  relatedSlugs: [
    'seated-calf-raise',
    'machine-standing-calf-raise',
    'bodyweight-calf-raise',
    'barbell-calf-raise',
  ],
} satisfies ExerciseOverlay
