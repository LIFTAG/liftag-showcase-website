import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-seated-row',
  metaDescription: 'Machine seated row: pad and seat setup, handle path, and why it is not a seated cable row in LIFTAG.',
  steps: [
    'Set the seat so the handles line up with the mid-to-lower chest and the chest pad meets the sternum. Shoulders start forward but not shrugged.',
    'Plant the feet, brace, keep the chest on the pad, and pull the handles to the ribs by driving the elbows back.',
    'Let the shoulder blades retract without pinching them into a forced squeeze. Neck long.',
    'Extend the arms slowly. The stack should not crash. If the machine has a chest pad, leaving it is cheating the last two inches.',
  ],
  mistakes: [
    { title: 'Rowing with the torso, not the arms', body: 'A little pad pressure is fine. Rocking off the pad every rep is a badly loaded hip hinge.' },
    { title: 'Seat so low the pull becomes a shrug', body: 'Handles at mid-chest, not in your lap. Height changes the whole lift.' },
    { title: 'Logging seated cable row on this slug', body: 'Cable rows let the torso move. This is the chest-supported machine. Different groove, different PR.' },
    { title: 'Cutting the stretch because the stack is noisy', body: 'Let the arms go long. If the stack slams, add a slower lower or a slightly higher pin, not a shorter range.' },
  ],
  variations: [
    { slug: 'wide-grip-machine-seated-row', name: 'Wide-grip machine seated row', note: 'Elbows out, more rear delt and upper back.' },
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'No pad, you have to own the torso.' },
    { slug: 'chest-supported-t-bar-row', name: 'Chest-supported T-bar row', note: 'Plate-loaded cousin of the same idea.' },
    { slug: 'single-arm-dumbbell-row', name: 'Single-arm dumbbell row', note: 'When one side is lagging or the machine path hates your shoulders.' },
  ],
  progressions: [
    'Learn the pad height with a light stack and a full reach.',
    'Working sets of 8–12 with the chest staying put.',
    'Add a plate or a pin when the last set still touches the same spot.',
    'Wide-grip handle or a pause at the ribs when the top of the row disappears.',
  ],
  programming: 'High-quality row volume: 3–4 sets of 8–15. Pair it with a vertical pull, not with three other rows. If the gym’s machine changes every week, note the brand or handle — LIFTAG cannot tell a Hammer pad from a plate-loaded T-bar unless you do.',
  relatedSlugs: [
    'seated-cable-row',
    'wide-grip-machine-seated-row',
    'chest-supported-t-bar-row',
    'barbell-bent-over-row',
  ],
} satisfies ExerciseOverlay
