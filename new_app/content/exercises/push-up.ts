import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'push-up',
  metaDescription: 'Push-up: setup, regressions, and how to log bodyweight pressing in LIFTAG so it does not disappear next to bench press.',
  steps: [
    'Hands under the shoulders or slightly wider, body in a straight line from head to heels.',
    'Lower until the chest is close to the floor and the elbows are about 45° from the torso.',
    'Press the floor away without piking the hips or sagging the low back.',
  ],
  mistakes: [
    { title: 'Half reps at the top', body: 'Chest to floor, or as close as you can own. Partial push-ups belong on a regression, not as fake volume.' },
    { title: 'Not logging them because they are “just push-ups”', body: 'If they are in the session, they are in LIFTAG. Bodyweight still accumulates.' },
  ],
  variations: [
    { slug: 'knee-push-up', name: 'Knee push-up', note: 'Regression that keeps a full-range chest.' },
    { slug: 'diamond-push-up', name: 'Diamond push-up', note: 'Closer grip, more triceps.' },
    { slug: 'decline-push-up', name: 'Decline push-up', note: 'Feet elevated, harder.' },
  ],
  progressions: [
    'Wall or knee push-ups.',
    'Full push-ups in sets of 8–15.',
    'Deficit, pause, or weighted vest. Log added load.',
  ],
  programming: 'Use push-ups as a main press on travel days or as a finisher after bench. Log them. LIFTAG will show whether your “easy” push-up volume is actually trending down.',
  relatedSlugs: ['knee-push-up', 'barbell-bench-press', 'chest-dips'],
} satisfies ExerciseOverlay
