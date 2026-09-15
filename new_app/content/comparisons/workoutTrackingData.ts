export const rows = [
  {
    name: 'LIFTAG',
    platforms: 'iOS, Android',
    free: 'Core tracking free forever; optional premium intelligence',
    bestFor: 'Serious lifters at a gym with NFC/QR machine tags',
    weakSpot: 'Partner-gym network is still expanding',
    unique: 'Tap or scan a machine to open the exact exercise with setup videos',
  },
  {
    name: 'Strong',
    platforms: 'iOS, Android',
    free: 'Free tier (3 routines), paid Pro',
    bestFor: 'Minimalist, fast, free-form set logging',
    weakSpot: 'No gym integration, paid wall on multiple routines',
    unique: 'Cleanest single-screen set logger',
  },
  {
    name: 'Hevy',
    platforms: 'iOS, Android',
    free: 'Generous free tier, paid Pro',
    bestFor: 'Social feed plus general-purpose logging',
    weakSpot: 'Not gym-aware, paid analytics behind subscription',
    unique: 'Built-in community and program sharing',
  },
  {
    name: 'FitNotes',
    platforms: 'Android only',
    free: 'Fully free',
    bestFor: 'Lifters who want no-frills logging on Android',
    weakSpot: 'No iOS, no machine integration, dated UI',
    unique: 'Truly free with no ads or paywalls',
  },
  {
    name: 'JEFIT',
    platforms: 'iOS, Android',
    free: 'Free with ads, paid Elite',
    bestFor: 'Massive exercise library',
    weakSpot: 'Ad-heavy free tier, aging UX',
    unique: 'One of the largest exercise databases in the category',
  },
  {
    name: 'Boostcamp',
    platforms: 'iOS, Android',
    free: 'Most programs free, paid premium',
    bestFor: 'Following named-coach programs',
    weakSpot: 'Set-logging UX is secondary to programming',
    unique: 'Hosts free programs from major lifting coaches',
  },
  {
    name: 'MacroFactor',
    platforms: 'iOS, Android',
    free: 'Paid (subscription)',
    bestFor: 'Lifters who want nutrition and workout in one app',
    weakSpot: 'Workout tracking is newer than competitors’',
    unique: 'Research-credibility positioning and adaptive macro tracking',
  },
  {
    name: 'Fitbod',
    platforms: 'iOS, Android',
    free: 'Limited trial, paid subscription',
    bestFor: 'Lifters who want the app to design the workout',
    weakSpot: 'Algorithmic plans do not always match serious programming',
    unique: 'Generates next-workout suggestions from prior sessions',
  },
]

export const cards = [
  {
    name: 'LIFTAG',
    oneLine: 'The workout tracker built around the gym itself.',
    goodAt: [
      'Tap an NFC tag or scan a QR code on a machine to open the exact exercise',
      'Set logging: weight, reps, rest time, optional RPE, timestamped permanently',
      'Rest timer that auto-starts after a logged set',
      'Personal records and estimated 1RM per exercise',
      'Volume, frequency, and progress charts per exercise and per muscle group',
      'Trainer profiles, plan sharing, partner-gym map discovery',
      'Free on iOS and Android with no required subscription',
    ],
    notGoodAt: [
      'The partner-gym network is still expanding, so the NFC/QR layer only triggers at gyms that have installed LIFTAG tags',
      'Social feed is not the focus; Hevy is stronger if a public feed is what you want',
    ],
    pickWhen:
      'You train at a gym and want a tracker that treats every machine as the entry point. Also pick LIFTAG if you want a free app that does not paywall progress analytics.',
  },
  {
    name: 'Strong',
    oneLine: 'The original minimalist set logger.',
    goodAt: [
      'Fast, single-screen set logging',
      'Clean, distraction-free UI',
      'Apple Watch and Wear OS integration',
    ],
    notGoodAt: [
      'Free tier is limited to a handful of routines',
      'No gym-machine integration',
      'No partner-gym or coaching layer',
    ],
    pickWhen:
      'You want the fastest possible manual set logger and nothing else, and you are happy on the paid tier once you outgrow the free routine limit.',
  },
  {
    name: 'Hevy',
    oneLine: 'Set logger with a social layer.',
    goodAt: [
      'Generous free tier compared to Strong',
      'Social feed and program sharing built in',
      'Reached millions of downloads through organic growth',
    ],
    notGoodAt: ['No machine-level gym integration', 'Advanced analytics gated behind paid Hevy Pro'],
    pickWhen: 'You want logging plus a community feel, and you do not need gym-machine integration.',
  },
  {
    name: 'FitNotes',
    oneLine: 'The cult-favorite free Android logger.',
    goodAt: [
      'Truly free, no ads, no subscription, no account required',
      'Reliable basic set/rep/weight logging',
      'Calendar history view',
    ],
    notGoodAt: ['Android only', 'No iOS, no cross-device sync, no gym integration', 'Visual design is dated'],
    pickWhen:
      'You are on Android, you want zero cost or friction, and you do not need anything beyond basic logging and history.',
  },
  {
    name: 'JEFIT',
    oneLine: 'Big exercise library, old-school UX.',
    goodAt: ['Very large exercise database', 'Community programs and templates'],
    notGoodAt: ['Ad-heavy free tier', 'Aging UX compared to newer competitors'],
    pickWhen: 'You want a deep exercise library and do not mind upgrading to remove ads.',
  },
  {
    name: 'Boostcamp',
    oneLine: 'Free programs from real coaches, in one app.',
    goodAt: [
      'Hosts free programs from named lifting coaches',
      'Strong for "follow this program" rather than "build my own"',
    ],
    notGoodAt: ['Logging UX is secondary to programming', 'No gym-machine integration'],
    pickWhen: 'You want to follow a specific named coach’s program and treat logging as a side effect of it.',
  },
  {
    name: 'MacroFactor',
    oneLine: 'Nutrition-first app with a growing workout module.',
    goodAt: ['Research-credibility brand association', 'Strong nutrition + macro tracking'],
    notGoodAt: ['Workout tracking is newer than competitors’', 'Subscription pricing'],
    pickWhen:
      'You care about nutrition and workouts in one paid app and want the research-credibility positioning.',
  },
  {
    name: 'Fitbod',
    oneLine: 'The app that picks your workout for you.',
    goodAt: ['Algorithmic next-workout generation', 'Useful when you do not want to plan'],
    notGoodAt: ['Auto-generated plans rarely match serious programming', 'Subscription priced'],
    pickWhen: 'You want the app to plan for you, not the other way around.',
  },
]
