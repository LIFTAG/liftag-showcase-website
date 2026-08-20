import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-shrugs',
  metaDescription: 'Barbell shrugs: straight-up elevation with a bar, a pause at the top, and how to log them in LIFTAG without mixing in dumbbell-shrug or trap-bar-shrug.',
  steps: [
    'Stand with the bar at the thighs, overhand or mixed, stance like a deadlift lockout. Chest up, neck long. A fold at the waist is a row.',
    'Elevate the shoulders straight toward the ears. Do not roll. Pause until the traps are actually working, not just bouncing the plates.',
    'Lower until the traps stretch and the bar hangs. That lengthened position is the next start, not a rest with bent elbows.',
    'Arms stay long. If the bar scrapes up the thighs and the elbows bend, you are on barbell-upright-row.',
    'Straps once the hands die and the traps are the target. Note “straps” so the chart is honest.',
  ],
  mistakes: [
    { title: 'Rolling the shoulders', body: 'Forward-circle shrugs are theater and a reliable way to irritate the AC joint. Up, pause, down. Traps elevate. They do not orbit.' },
    { title: 'Logging dumbbell or trap-bar shrugs here', body: 'Bells at the sides have more range. A trap bar is a different implement and usually a different load. dumbbell-shrug and trap-bar-shrug exist. Use them.' },
    { title: 'Turning it into an upright row', body: 'Elbows bent and the bar traveling up the body is a different lift. Shrugs keep the arms long. If you wanted that pull, log barbell-upright-row.' },
    { title: 'Bouncing a heavy bar for triples', body: 'A fake 1RM with no pause is not a trap PR. Drop the load until you can hold the top. LIFTAG will store the bounce if you log it. Do not chase it next week.' },
  ],
  variations: [
    { slug: 'dumbbell-shrug', name: 'Dumbbell shrug', note: 'Bells at the sides, usually more stretch. Different slug, different chart.' },
    { slug: 'trap-bar-shrug', name: 'Trap bar shrug', note: 'Neutral handles, less thigh scrape, often easier to load. Still not this bar.' },
    { slug: 'cable-shrug', name: 'Cable shrug', note: 'Constant tension when the bar feels like a bounce machine.' },
    { slug: 'dumbbell-farmers-walk', name: 'Dumbbell farmers walk', note: 'Loaded carry if the shrug is only there to train a walk you are not doing.' },
  ],
  progressions: [
    'Light bar, two-second pause, full stretch at the bottom.',
    'Add load when the pause is still there and the elbows stay straight.',
    'Straps once grip is the limiter. Note them.',
    'Behind-the-back bar only if you actually want that path. Write “behind” in the set note. It is still this slug.',
  ],
  programming: 'Accessory after a pull: 3–4 sets of 8–15. Log the bar weight, not a pair total. This is not dumbbell-shrug and it is not trap-bar-shrug. A LIFTAG PR here only matters if the pause stayed in. Rest just long enough that the next set is not a grip contest unless that is the point.',
  equipmentAlternatives: [
    { slug: 'dumbbell-shrug', name: 'Dumbbell shrug', note: 'Default swap when there is no bar, or you want more stretch at the bottom.' },
    { slug: 'trap-bar-shrug', name: 'Trap bar shrug', note: 'Use the hex bar when the straight bar scrapes or the lockout feels better neutral.' },
    { slug: 'cable-shrug', name: 'Cable shrug', note: 'Keep the pattern when plates and bells are gone.' },
  ],
  faqs: [
    {
      question: 'Bar, dumbbells, or trap bar: does the chart care?',
      answer: 'Yes. A bar in front has less range than bells at your sides. A trap bar is the friendlier middle. Keep barbell-shrugs, dumbbell-shrug, and trap-bar-shrug on their own slugs so a switch of implement is not a mystery PR.',
    },
  ],
  relatedSlugs: [
    'dumbbell-shrug',
    'dumbbell-farmers-walk',
    'trap-bar-shrug',
    'barbell-upright-row',
  ],
} satisfies ExerciseOverlay
