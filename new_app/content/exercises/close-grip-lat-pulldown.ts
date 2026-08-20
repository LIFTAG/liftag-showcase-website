import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'close-grip-lat-pulldown',
  metaDescription: 'Close-grip lat pulldown: V-bar path, elbows in, and logging close-grip pulldowns separately from wide-grip or cable rows in LIFTAG.',
  steps: [
    'Clip a V-handle or a close-neutral attachment. Same thigh pad as any pulldown — you still need it, even though the handle looks like a row.',
    'Start with the arms long and the shoulders reached up. Neutral palms, wrists straight, not curled around the handle.',
    'Pull the handle to the upper abs / lower sternum. Elbows graze the torso and drive toward the back pockets, not out into a wide pulldown.',
    'Stretch long at the top. If you keep a pumped 90° elbow the whole set, you turned it into a biceps hold.',
  ],
  mistakes: [
    { title: 'Biceps-curling the V-bar', body: 'If the shoulder angle never changes and the elbows stay put, the biceps did the set. Think elbows down and in, chest up.' },
    { title: 'Logging it as a seated cable row', body: 'Same handle, opposite direction. This is still a vertical pull. Rows belong on seated cable row.' },
    { title: 'Mixing close-grip and wide-grip on one slug', body: 'The loads are different and so is the range. LIFTAG has both. Use them or the chart lies in week six.' },
    { title: 'Leaning so far the handle hits the belt', body: 'A little lean is a pulldown. Hitting your belt buckle with a 45° rock is a row with extra steps. Sit up and drop the pin.' },
  ],
  variations: [
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Standard bar, default vertical-pull volume.' },
    { slug: 'wide-grip-lat-pulldown', name: 'Wide-grip lat pulldown', note: 'The other grip. Shorter range, more flare.' },
    { slug: 'chin-up', name: 'Chin-up', note: 'Underhand bar version of a close vertical pull.' },
    { slug: 'straight-arm-pulldown', name: 'Straight-arm pulldown', note: 'Take the elbows out of it when the arms always quit first.' },
  ],
  progressions: [
    'Light V-bar, full stretch, handle to the sternum, no rock.',
    'Build 8–12 before you load it like a row.',
    'Chin-ups or close-grip pull-ups once this is easy and the biceps are not the limiter.',
  ],
  programming: 'Close-grip pulldown is a good main vertical pull when chin-ups are the long-term goal, or a back-off after them. Three to four sets of 8–12. Note V-bar vs close overhand if you switch attachments. Rest like a pull, not like a curl — the LIFTAG timer still belongs on this lift.',
  equipmentAlternatives: [
    { slug: 'chin-up', name: 'Chin-up', note: 'Take it to the bar when you can. Log extra weight if you add a belt.' },
    { slug: 'lat-pulldown', name: 'Lat pulldown', note: 'Straight bar when the V-handle is missing or the elbows want more flare.' },
    { slug: 'seated-cable-row', name: 'Seated cable row', note: 'If what you actually wanted was a horizontal pull with that same handle.' },
  ],
  relatedSlugs: [
    'lat-pulldown',
    'wide-grip-lat-pulldown',
    'chin-up',
    'pull-up',
    'straight-arm-pulldown',
  ],
} satisfies ExerciseOverlay
