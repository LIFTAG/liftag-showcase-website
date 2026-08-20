import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-triceps-pushdown',
  metaDescription: 'Rope triceps pushdown: elbows pinned, split at lockout, and how to log this high-pulley rope in LIFTAG without mixing skullcrushers or straight-bar pushdowns.',
  steps: [
    'Clip a rope to a high pulley and stand close enough the stack does not drag you forward. Ribs down, slight forward lean from the hips is fine; a crunch is not.',
    'Take the rope with a thumbs-up grip and pin the elbows to the ribs. The upper arms barely move.',
    'Push down until the elbows lock and the rope ends split apart. That split is the finish, not an optional flourish.',
    'Return until the forearms are about parallel. Stop before the rope flies up and the elbows turn into an overhead extension.',
  ],
  mistakes: [
    { title: 'Logging these as skullcrushers', body: 'Lying EZ-bar work is ez-bar-skullcrusher. This is a standing high-pulley rope. Different pattern, different load. Keep cable-triceps-pushdown. LIFTAG charts one slug.' },
    { title: 'Logging a bar attachment on this slug', body: 'The catalog name is rope triceps pushdown. Straight-bar, V-bar, and reverse-grip each have their own slug. The pin weight will not match. Use the attachment you actually clipped.' },
    { title: 'Letting the elbows drift forward into a crunch', body: 'If the upper arms leave the ribs, you are pressing with the lats and abs. Glue the elbows. If they will not stay, drop the pin.' },
    { title: 'Skipping the split at lockout', body: 'Hands together at the bottom is a partial. Separate the rope ends. That last bit is the triceps work you came for.' },
  ],
  variations: [
    { slug: 'straight-bar-triceps-pushdown', name: 'Straight-bar triceps pushdown', note: 'Same elbows-by-ribs idea, different attachment, different slug.' },
    { slug: 'overhead-cable-triceps-extension', name: 'Overhead cable triceps extension', note: 'Elbows by the ears, long-head stretch, still a cable.' },
    { slug: 'ez-bar-skullcrusher', name: 'EZ-bar skullcrusher', note: 'Lying isolation when the cable is taken. Do not log it here.' },
    { slug: 'close-grip-bench-press', name: 'Close-grip bench press', note: 'Press pattern when isolation is not the limiter.' },
  ],
  progressions: [
    'Light rope, elbows glued, full split at lockout.',
    'Working sets of 10–15 with the same stance and the same attachment.',
    'Pause in the split before you chase a heavier pin.',
    'Overhead cable or a bar pushdown as a second pass, logged on those slugs.',
  ],
  programming: 'Triceps volume after a press: 3–4 sets of 10–15. This slug is the rope. Straight-bar, V-bar, and reverse-grip pushdowns have their own charts, and a skullcrusher is a different pattern. Scan the high-pulley tag if there is one; it should open cable-triceps-pushdown, not ez-bar-skullcrusher. Rest just long enough that the lockouts still split.',
  equipmentAlternatives: [
    { slug: 'straight-bar-triceps-pushdown', name: 'Straight-bar triceps pushdown', note: 'When the rope is gone. Log that slug, not this one.' },
    { slug: 'v-bar-triceps-pushdown', name: 'V-bar triceps pushdown', note: 'Closer to a hammer grip, still not a rope. Own chart.' },
    { slug: 'machine-triceps-extension', name: 'Machine triceps extension', note: 'Pad or handles when every cable is taken.' },
  ],
  faqs: [
    {
      question: 'Is a rope pushdown the same as a skullcrusher?',
      answer: 'No. One is a standing high-pulley rope with the elbows by the ribs. The other is a lying EZ-bar extension. Different demand, different load. Keep cable-triceps-pushdown. Parking rope work on ez-bar-skullcrusher makes both charts useless.',
    },
  ],
  relatedSlugs: [
    'overhead-cable-triceps-extension',
    'close-grip-bench-press',
    'ez-bar-skullcrusher',
    'straight-bar-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
