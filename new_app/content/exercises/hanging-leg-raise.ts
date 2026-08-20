import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'hanging-leg-raise',
  metaDescription: 'Hanging leg raise: active hang, pelvic curl, and how to log straight-leg raises separately from knee raises in LIFTAG.',
  steps: [
    'Hang from a bar with an overhand grip and the shoulders active — packed down, not a dead-hang shrug. Legs long, knees soft, not locked.',
    'Brace, then raise the legs by flexing the hips and curling the pelvis toward the ribs. Thighs to the torso is the target, not a kick to head height.',
    'Pause a beat at the top without using a swing to stay there.',
    'Lower under control to a still hang. Kill the pendulum before the next rep; a moving hang is not the start position.',
  ],
  mistakes: [
    { title: 'Kicking into a swing and counting the arc', body: 'If the hips have to throw the legs up, it is kipping. Reset to a still hang or regress to hanging-knee-raise.' },
    { title: 'Raising straight legs with no pelvic curl', body: 'That is mostly hip flexors and a hanging L-sit attempt. Curl the tailbone toward the bar at the top or you missed the abs.' },
    { title: 'Logging knee raises as hanging leg raises', body: 'Bent knees are the regression and a different slug. Keep them apart or the “PR” is just shorter levers.' },
    { title: 'Dead-hanging with shrugged ears', body: 'Unpacked shoulders turn this into a neck and grip test. Set the scaps first; if grip dies first, use straps or a captain’s chair and note it.' },
  ],
  variations: [
    { slug: 'hanging-knee-raise', name: 'Hanging knee raise', note: 'Bent knees, usually on a captain’s chair — the honest regression.' },
    { slug: 'toes-to-bar', name: 'Toes-to-bar', note: 'Bigger range. Keep that slug if you kip or actually touch the bar.' },
    { slug: 'lying-leg-raise', name: 'Lying leg raise', note: 'Floor version when the bar hang is the limiter.' },
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Loaded curl without a hang.' },
  ],
  progressions: [
    'Hanging knee raises with a still hang and a pelvic curl.',
    'Straight-leg raises to about parallel, controlled lower.',
    'Full raises with a pause at the top and no swing.',
    'Toes-to-bar or a light dumbbell between the feet only after the swing is gone. Log added load.',
  ],
  programming: '3–4 sets of 6–12 strict reps, not an unbroken CrossFit string. If grip or the swing is the limiter, do the work on hanging-knee-raise or lying-leg-raise so the abs still get a set. Rest long enough that the next set starts from a still hang.',
  faqs: [
    {
      question: 'Are captain’s-chair raises the same lift?',
      answer: 'The chair unloads the grip and often uses bent knees — that is hanging-knee-raise in this catalog. Use hanging-leg-raise for a bar hang with long legs. If you only have the chair, log the chair slug so the chart matches the equipment.',
    },
  ],
  relatedSlugs: [
    'hanging-knee-raise',
    'toes-to-bar',
    'machine-ab-crunch',
    'plank',
  ],
} satisfies ExerciseOverlay
