import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'lat-pulldown',
  metaDescription: 'Lat pulldown: thigh pad, bar to the chest, and logging pulldowns separately from pull-ups and grip-width variants in LIFTAG.',
  steps: [
    'Set the thigh pad so you cannot lift off the seat at the stretch. Grab the bar a bit outside shoulder width, wrists stacked, thumbs around.',
    'Start long: arms extended, shoulders reached up. Depress the scaps first, then pull. A 10–20° lean is a pulldown; a 45° lean is a row you sat down for.',
    'Pull the bar to the upper chest / collarbone. Elbows drive down, chest up. Chin stays out of the way without a chicken-neck to meet the bar.',
    'Return to a full stretch until the shoulders reach up again. That last inch at the top is the next rep’s start, not a rest with bent elbows.',
  ],
  mistakes: [
    { title: 'Behind-the-neck pulldowns as the default', body: 'Most gym shoulders do not have that rotation cold. Pull to the chest. If a program calls for behind-the-neck, keep this slug and note it.' },
    { title: 'Leaning into a seated row every rep', body: 'A little lean is fine. If you have to throw the torso to move the stack, the pin is too heavy or you should be on seated cable row.' },
    { title: 'Logging this as a pull-up', body: 'Different lift, different PR. Pulldowns are the machine you can load in small jumps. Pull-ups belong on that slug, weighted or not.' },
    { title: 'Skipping the stretch because the pad is loose', body: 'Tighten the thigh pad. If you float off the seat, the stack won. The lengthened lat is the work you came for.' },
  ],
  variations: [
    { slug: 'wide-grip-lat-pulldown', name: 'Wide-grip lat pulldown', note: 'Hands out toward the bends. Shorter range, keep it on its own slug.' },
    { slug: 'close-grip-lat-pulldown', name: 'Close-grip lat pulldown', note: 'V-bar or close neutral, more arm, still a vertical pull.' },
    { slug: 'pull-up', name: 'Pull-up', note: 'The bodyweight version this is regressing toward.' },
    { slug: 'assisted-pull-up', name: 'Assisted pull-up', note: 'Use when the goal is actually getting to the bar, not loading a stack.' },
  ],
  progressions: [
    'Light stack, full stretch, bar to the chest, no yank.',
    'Build sets of 8–12 before you chase a stack PR with a half-rep lean.',
    'Assisted or strict pull-ups once pulldown sets of 10 are clean and boring.',
    'Straight-arm pulldown if the arms always quit before the lats.',
  ],
  programming: 'Default vertical-pull volume when pull-ups are not there yet, or as back-off after them. Three to four sets of 8–12. Do not mix wide-grip and close-grip numbers on this slug — LIFTAG has those lifts. Mag-grip vs straight bar belongs in a note if you switch, or the chart is two machines pretending to be one.',
  equipmentAlternatives: [
    { slug: 'pull-up', name: 'Pull-up', note: 'Use the bar when you can. Log extra weight if you add a belt.' },
    { slug: 'assisted-pull-up', name: 'Assisted pull-up', note: 'Closer to a pull-up than a heavy, leaned-back pulldown.' },
    { slug: 'straight-arm-pulldown', name: 'Straight-arm pulldown', note: 'Isolation for the same line of pull when the elbows always steal the set.' },
  ],
  faqs: [
    {
      question: 'Should I pulldown behind the neck?',
      answer: 'Not as the default. To-the-chest is the repeatable pattern and the one that matches a pull-up. Behind-the-neck asks for more rotation than most people bring to a Monday lat session.',
    },
  ],
  relatedSlugs: [
    'pull-up',
    'chin-up',
    'wide-grip-lat-pulldown',
    'close-grip-lat-pulldown',
    'straight-arm-pulldown',
  ],
} satisfies ExerciseOverlay
