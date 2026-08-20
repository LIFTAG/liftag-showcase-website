import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-skullcrusher',
  metaDescription: 'EZ-bar skullcrusher: elbow path, bar path, and how to log it separately from straight-bar skullcrushers and close-grip bench in LIFTAG.',
  steps: [
    'Lie on a flat bench and take the EZ bar on the angled sections with an overhand grip your wrists actually like.',
    'Start with the bar over the shoulders, not over the forehead. Upper arms stay mostly still; this is an elbow exercise.',
    'Bend the elbows and lower the bar to the hairline, or slightly behind the head if that keeps the elbows happier. Touch without bouncing.',
    'Extend to a full lockout. The last third is the triceps work you came for — do not cut it to spare the elbows you just loaded.',
    'If the shoulders want to turn this into a pullover, pin the upper arms and drop the load.',
  ],
  mistakes: [
    { title: 'Letting the elbows flare and wander toward the hips', body: 'Then it is a messy close-grip press. Keep the upper arms in a corridor beside the head.' },
    { title: 'Bouncing the bar off the forehead', body: 'The name is a warning, not a target. Control the bottom or you will earn the nickname.' },
    { title: 'Logging EZ-bar and straight-bar skullcrushers as one lift', body: 'The camber changes what the wrists and elbows will take, and the load follows. barbell-skullcrusher is the other slug.' },
    { title: 'Turning the eccentric into a pullover', body: 'If the upper arms sweep back every rep, the lats are helping and the triceps are not. Shorten the range or lighten the bar.' },
  ],
  variations: [
    { slug: 'barbell-skullcrusher', name: 'Barbell skullcrusher', note: 'Straight bar, usually harder on the wrists.' },
    { slug: 'lying-dumbbell-triceps-extension', name: 'Lying dumbbell triceps extension', note: 'Independent arms, easier to find a pain-free elbow angle.' },
    { slug: 'overhead-cable-triceps-extension', name: 'Overhead cable triceps extension', note: 'Constant tension, kinder to many elbows.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'Press pattern when isolation is not the limiter.' },
  ],
  progressions: [
    'Light EZ bar with a one-second pause just above the hairline.',
    'Working sets of 8–12 with the same bar path every week.',
    'Add load when the elbows stay quiet for all work sets.',
    'Move it to a slight incline if the flat version irritates the joints — note the angle.',
  ],
  programming: 'Isolation after a press, not a max-effort lift. 3–4 sets of 8–12. If you switch between forehead and behind-the-head lowering, put that in the set note so next week’s you knows which skullcrusher last week actually was. Rest long enough that the lockouts stay honest.',
  faqs: [
    {
      question: 'Should I lower to the forehead or behind the head?',
      answer: 'Both are legitimate. Hairline keeps the upper arms vertical; behind the head adds a bit of shoulder flexion and often feels better on the elbows. Pick one as the default and note the other if you rotate.',
    },
  ],
  relatedSlugs: [
    'barbell-skullcrusher',
    'close-grip-bench-press',
    'overhead-cable-triceps-extension',
    'cable-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
