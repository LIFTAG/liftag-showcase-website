import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'smith-machine-squat',
  metaDescription: 'Smith machine squat: foot placement on a fixed rail, depth, and how to log it separately from a free-bar back squat in LIFTAG.',
  steps: [
    'Set the safeties just below your planned depth. Bar on the upper traps, not the neck.',
    'Place the feet slightly in front of the bar so the vertical rail matches a squat, not a good morning.',
    'Unrack with a wrist twist, brace, and sit between the legs to a repeatable depth — hip crease below the knee if the hips allow.',
    'Drive up without the knees caving. Re-rack with a deliberate hook, not a bounce into the catches.',
  ],
  mistakes: [
    { title: 'Feet under the bar like a free squat', body: 'The rail will not travel back with your hips. Start with the feet a few inches forward so the knees and torso can share the work.' },
    { title: 'Logging it as a barbell back squat', body: 'No walk-out, no bar path to manage. Different groove, different PR. Keep this slug.' },
    { title: 'Skipping the safeties', body: 'The hooks are not a bottom-position safety. Set the stops. Spinning out of the bar at the hole is a bad day.' },
    { title: 'Cutting depth because the machine feels stable', body: 'Stability is not a free pass to quarter-squat a huge stack. Film a side set or pick a depth you would count in a rack.' },
  ],
  variations: [
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'Free bar, walk-out, the version that transfers to a meet.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Sled squat with a back pad when you want even less balance tax.' },
    { slug: 'pendulum-squat', name: 'Pendulum squat', note: 'Arcing lever, usually more quad, still a guided squat.' },
    { slug: 'belt-squat', name: 'Belt squat', note: 'Load hangs from the hips when the spine is the limiter.' },
  ],
  progressions: [
    'Bodyweight squat to a consistent depth.',
    'Empty-bar Smith with a three-second descent and safeties set.',
    'Working sets at RPE 7–8. Add load when every rep hits the same depth.',
    'Pause reps if you are bouncing the hole and calling it strength.',
  ],
  programming: 'Useful volume squat when you are training alone: 3–4 sets of 6–12. Log rest — three minutes is still normal on hard sets. LIFTAG estimated 1RM from a Smith PR does not transfer to a walk-out squat; do not chase it on barbell back squat day.',
  equipmentAlternatives: [
    { slug: 'barbell-back-squat', name: 'Barbell back squat', note: 'Default free-weight version when a rack is free.' },
    { slug: 'machine-hack-squat', name: 'Machine hack squat', note: 'Closest machine pattern in most gyms.' },
    { slug: 'standard-leg-press', name: 'Standard leg press', note: 'Keep quad volume if even the Smith bar bothers the back.' },
  ],
  faqs: [
    {
      question: 'Is the Smith machine squat cheating?',
      answer: 'It is a different squat. The rail takes the balance and the bar path. Use it for volume, rehab, or a gym with no free rack — then log it here so the free-squat chart stays clean.',
    },
  ],
  relatedSlugs: [
    'barbell-back-squat',
    'machine-hack-squat',
    'pendulum-squat',
    'belt-squat',
  ],
} satisfies ExerciseOverlay
