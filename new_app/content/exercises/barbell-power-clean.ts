import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-power-clean',
  metaDescription: 'Barbell power clean: floor to a quarter-squat catch on the shoulders, and how to log it in LIFTAG without treating the lift as a conventional deadlift.',
  steps: [
    'Bar over mid-foot, shins close, hook grip, shoulders over the bar. It looks like a conventional start. It is not a conventional deadlift.',
    'Push the floor. Bar stays close. Hips and shoulders rise together until the bar passes the knees.',
    'Then jump. Extend the hips, shrug, and let the arms stay long until the bar is high enough to receive. This is not a reverse curl.',
    'Punch the elbows around and catch the bar on the front delts. You drop under just enough: a quarter squat, not a full squat clean unless that is what you programmed.',
    'Stand to finish. That is the clean. Do not press it out. If the session wants the press, that is barbell-clean-and-press.',
    'Lower to the floor or to the hang under control and reset. Bouncing the bar off the thighs as a loop is not this lift.',
  ],
  mistakes: [
    { title: 'Reverse-curling the bar', body: 'Early arm bend kills the second pull. The hips throw it. The arms finish the catch. If the bar loops out front, it is too heavy or you pulled with the biceps.' },
    { title: 'Logging it as conventional-deadlift', body: 'The catch is the lift. Floor-to-hips is not a power-clean PR, and a clean is not a deadlift PR. Keep this slug even if the first pull looks identical on film.' },
    { title: 'Catching in a full squat on a power-clean day', body: 'Power means you received it high. A squat clean is a different skill. If you sat that low, note “squat clean” or you will chase the wrong number next week.' },
    { title: 'Pressing out the catch, then calling it a clean', body: 'The bar lands on the delts. A press-out is a miss, or it is barbell-clean-and-press if you meant to press. Do not mix those into a power-clean chart.' },
  ],
  variations: [
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'The first pull, not the lift. Keep deadlift numbers off this chart.' },
    { slug: 'barbell-push-press', name: 'Barbell push press', note: 'Leg drive from the front rack into an overhead lockout. Different job after the catch.' },
    { slug: 'standing-barbell-overhead-press', name: 'Standing barbell overhead press', note: 'Strict press from the same rack position, no dip.' },
    { slug: 'barbell-clean-and-press', name: 'Barbell clean and press', note: 'Clean, then press. Use that slug once the bar leaves the shoulders on purpose.' },
  ],
  progressions: [
    'Own a hinge and a front-rack position. Romanian deadlift and a front squat rack help. They are not this lift in the log.',
    'Hang power clean with a light bar until the elbows punch through.',
    'Power clean from the floor, singles and doubles, catch still high.',
    'Add load when the catch stays on the delts. Push press after if the program wants overhead, on its own slug.',
  ],
  programming: 'This is a power lift: 3–6 sets of 1–3, full rest. Three minutes is normal. Do not feed these numbers into a conventional-deadlift estimated 1RM. Do not log them as barbell-push-press or standing-barbell-overhead-press because you stood up with a bar on the shoulders. If you squat-clean, note it. If you press it, move that work to barbell-clean-and-press or barbell-thruster.',
  equipmentAlternatives: [
    { slug: 'kettlebell-swing', name: 'Kettlebell swing', note: 'Hip snap without a catch when the clean is not the skill you are training today.' },
    { slug: 'barbell-clean-and-press', name: 'Barbell clean and press', note: 'Use it when the session wants the bar overhead after the catch.' },
    { slug: 'barbell-push-press', name: 'Barbell push press', note: 'Train the rack-to-overhead drive if the clean is already solid and the press is the gap.' },
  ],
  faqs: [
    {
      question: 'Can I log this as a deadlift? It starts on the floor.',
      answer: 'No. A power clean is an Olympic lift with a catch at the shoulders, not conventional-deadlift. Do not park it on the deadlift chart, and do not treat a full squat clean as this PR unless you noted it. If you press the bar after the catch, that set belongs on barbell-clean-and-press.',
    },
  ],
  relatedSlugs: [
    'conventional-deadlift',
    'barbell-push-press',
    'standing-barbell-overhead-press',
    'barbell-clean-and-press',
  ],
} satisfies ExerciseOverlay
