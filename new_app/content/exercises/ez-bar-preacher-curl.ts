import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-preacher-curl',
  metaDescription: 'EZ-bar preacher curl: pad height, bottom stretch, and how to log supported EZ-bar curls in LIFTAG separately from standing EZ-bar and concentration curls.',
  steps: [
    'Set the pad so the armpits sit on the top edge, not so the biceps rest in the middle of the pad. Sit all the way down.',
    'Take the EZ bar on the angled sections with the arms long. Wrists stacked on the camber you actually like.',
    'Curl until the biceps fully shorten without the butt leaving the seat. The upper arms stay on the pad the whole way.',
    'Lower to a stretch you can control. The last third of the eccentric is the work. Stop before the elbows dump into a hyperextension.',
  ],
  mistakes: [
    { title: 'Logging these as standing EZ-bar curls', body: 'Same bar, different lift. The pad kills the cheat and usually kills some of the load. Keep ez-bar-preacher-curl. Parking it on ez-bar-curl inflates the standing chart.' },
    { title: 'Riding so high the shoulders shrug every rep', body: 'If the armpits are off the pad and you are curling from the middle of the biceps, you shortened the range. Drop the seat or the pad until the upper arm has a home.' },
    { title: 'Bouncing out of the bottom', body: 'A dumped elbow at the stretch is how this lift becomes a tendon story. Own a slightly shorter bottom rather than a noisy one.' },
    { title: 'Butt off the seat to finish the last reps', body: 'Then it is a standing curl that happens to have furniture in the way. Stay seated or the pad did nothing.' },
  ],
  variations: [
    { slug: 'ez-bar-curl', name: 'EZ-bar curl', note: 'Standing, more load, hips can cheat if you let them.' },
    { slug: 'concentration-curl', name: 'Concentration curl', note: 'Single-arm isolation when the preacher is taken.' },
    { slug: 'machine-preacher-curl', name: 'Machine preacher curl', note: 'Fixed path, stack, same supported idea.' },
    { slug: 'incline-dumbbell-curl', name: 'Incline dumbbell curl', note: 'Lengthened biceps without a pad in the way.' },
  ],
  progressions: [
    'Light EZ bar, armpits on the top edge, no bounce at the stretch.',
    'Working sets of 8–12 with the same seat hole and the same camber.',
    'Add a one-second pause just above the bottom before you add load.',
    'Machine preacher only if the free bar bothers the elbows. Log that slug.',
  ],
  programming: 'Isolation after a standing curl, not a second standing curl: 3–4 sets of 8–12. Log ez-bar-preacher-curl even if the bar is the one you just used standing. The pad changes the load. Note the seat hole and which camber you grabbed so next week is the same lift. Rest just long enough that the bottom stretch does not turn into a bounce.',
  equipmentAlternatives: [
    { slug: 'machine-preacher-curl', name: 'Machine preacher curl', note: 'When the EZ preacher is taken or you want a stack instead of plates.' },
    { slug: 'concentration-curl', name: 'Concentration curl', note: 'No preacher bench. Elbow on the thigh, one arm at a time.' },
  ],
  faqs: [
    {
      question: 'How high should the pad sit?',
      answer: 'High enough that the armpits rest on the top edge and the upper arms lie on the pad. Too low and you shrug; too high and you curl from the middle of the biceps. Note the hole. A different hole is a different stretch.',
    },
  ],
  relatedSlugs: [
    'ez-bar-curl',
    'concentration-curl',
    'machine-preacher-curl',
    'incline-dumbbell-curl',
  ],
} satisfies ExerciseOverlay
