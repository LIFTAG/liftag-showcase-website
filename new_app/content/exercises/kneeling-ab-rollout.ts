import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'kneeling-ab-rollout',
  metaDescription: 'Kneeling ab rollout: wheel from the knees, a long brace, and how to log kneeling rollouts in LIFTAG separately from standing-ab-rollout and plank holds.',
  steps: [
    'Kneel on a pad. Hands on the wheel under the shoulders. Glutes on, ribs down, neck long. This is a moving plank, not a dive.',
    'Roll forward by reaching the arms. The hips travel with the torso. Dumping the low back to buy range is the end of the set, not a PR.',
    'Stop while you can still pull back. The floor is not the target. A long line you own beats a collapsed stretch you cannot reverse.',
    'Pull the wheel back under the shoulders with the lats and abs. Do not sit up off the knees to yank it home.',
    'A barbell with round plates is the same lift if you do not have a wheel. Still this slug.',
  ],
  mistakes: [
    { title: 'Sagging the lumbar at end range', body: 'The brace is the lift. Once the hips drop and the ribs flare, you are hanging on the spine. Shorten the roll and earn the range back.' },
    { title: 'Piking the hips to make the return easier', body: 'Hips shooting up unloads the abs and turns the return into a hinge. Keep the line. If you cannot, you rolled too far.' },
    { title: 'Logging standing rollouts here', body: 'Standing-ab-rollout is a different slug and a different cost. Same wheel, different chart. Kneeling stays here.' },
    { title: 'Chasing the floor every rep because the video did', body: 'Full range is the range you can reverse without a sag. Touching the floor with a broken line is not a completion.' },
  ],
  variations: [
    { slug: 'standing-ab-rollout', name: 'Standing ab rollout', note: 'Same wheel, from the feet. Much harder. Different slug.' },
    { slug: 'plank', name: 'Plank', note: 'The brace this lift is trying to move. Use it if the wheel still dumps you.' },
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Loaded flexion when you want a curl instead of an anti-extension roll.' },
    { slug: 'crunch', name: 'Crunch', note: 'Floor curl if the gym has no wheel and no cable.' },
  ],
  progressions: [
    'Short-range kneeling rollouts with a hard brace and a quiet low back.',
    'Lengthen the roll only while the return stays clean.',
    'Pause in the long position before you chase more distance.',
    'Standing-ab-rollout when kneeling is easy. Log that on its own slug.',
  ],
  programming: 'High-cost core: 3 sets of 6–12. Stop the set on the first sag. Log kneeling here even if you used a barbell instead of a wheel. Standing work goes on standing-ab-rollout. If last week’s LIFTAG note says the low back took over at mid-range, that is the range this week, not a cue to add reps.',
  equipmentAlternatives: [
    { slug: 'plank', name: 'Plank', note: 'No wheel, no barbell. Train the brace you would have rolled.' },
    { slug: 'machine-ab-crunch', name: 'Machine ab crunch', note: 'Loaded abs without an anti-extension skill demand.' },
    { slug: 'standing-ab-rollout', name: 'Standing ab rollout', note: 'Only when kneeling is truly easy. Not a substitute for a weak kneeling set.' },
  ],
  faqs: [
    {
      question: 'When do I switch to standing rollouts?',
      answer: 'When kneeling sets are long-range, no sag, and the return is boring. Standing-ab-rollout is a different slug. Do not log standing work here because you used the same wheel.',
    },
  ],
  relatedSlugs: [
    'plank',
    'machine-ab-crunch',
    'standing-ab-rollout',
    'crunch',
  ],
} satisfies ExerciseOverlay
