import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'rack-pull',
  metaDescription: 'Rack pull: pin height, start position, and how to log partial deadlifts separately from floor pulls in LIFTAG.',
  steps: [
    'Set the pins at a height you will repeat — below the knee, at the knee, or just above. Write it down.',
    'Bar over mid-foot. Hinge, grip, brace, and pull the slack out before the plates leave the pins.',
    'Push the floor away. Hips and shoulders rise together. Lock out tall — do not lean back into a fake finish.',
    'Lower to the pins under control. Reset every rep. This is not a bounce off steel.',
  ],
  mistakes: [
    { title: 'Changing pin height and calling it a PR', body: 'Two holes up is a different lift. Note the height in LIFTAG or the chart is fiction by week four.' },
    { title: 'Logging rack pulls as conventional deadlifts', body: 'No floor start. Keep this slug even if the lockout looks identical on film.' },
    { title: 'Jerking the bar with slack still in it', body: 'The pins clang, the back takes the jerk. Pull the slack, then pull the weight — same as a floor pull.' },
    { title: 'Hitching or leaning back at lockout', body: 'Stand tall and squeeze the glutes. A laid-back finish is not more lockout, it is a different spine.' },
  ],
  variations: [
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Floor start. The lift rack pulls are usually trying to help.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Neutral handles, still a full-range pull for most lifters.' },
    { slug: 'sumo-deadlift', name: 'Sumo deadlift', note: 'Wider stance if the conventional floor start is the actual problem.' },
    { slug: 'barbell-romanian-deadlift-rdl', name: 'Barbell Romanian deadlift', note: 'Hinge volume without a pin-height debate.' },
  ],
  progressions: [
    'Romanian deadlift until the hinge is automatic.',
    'Mid-shin rack pulls with a reset every rep.',
    'Lower the pins toward the floor as the start stays tight.',
    'Above-knee overload only if lockout is the actual goal, not because it looks heavier.',
  ],
  programming: 'Overload or weak-point pull: 3–5 sets of 3–6. Rest like a deadlift — three to five minutes. Put the pin height in the set note (“below knee”, “at knee”). A pin-high PR is not a deadlift PR; do not chase it on conventional day.',
  equipmentAlternatives: [
    { slug: 'conventional-deadlift', name: 'Conventional deadlift', note: 'Use the floor when the pins are just making you feel strong.' },
    { slug: 'trap-bar-deadlift', name: 'Trap bar deadlift', note: 'Full-range pull that is often easier on the back than a high rack pull with a round start.' },
  ],
  faqs: [
    {
      question: 'Do rack pulls build the deadlift?',
      answer: 'They can overload the lockout or let you pull when the floor start is not the priority. They do not replace floor work. If the bar still dies off the ground, lower the pins or go back to conventional.',
    },
  ],
  relatedSlugs: [
    'conventional-deadlift',
    'trap-bar-deadlift',
    'barbell-romanian-deadlift-rdl',
    'sumo-deadlift',
  ],
} satisfies ExerciseOverlay
