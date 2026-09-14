import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-romanian-deadlift-rdl',
  metaDescription:
    'Rumunský mŕtvy ťah s veľkou činkou: predklon v bedrách, rozsah pohybu a zaznamenávanie RDL oddelene od klasického mŕtveho ťahu v LIFTAGu.',
  steps: [
    'Vyber činku zo stojana alebo ju zdvihni, postav sa vzpriamene a mierne odomkni kolená. V tejto polohe zostanú.',
    'Posúvaj boky dozadu. Činka zostáva pri stehnách a potom pri predkoleniach. Chrbtica zostáva dlhá a pevná.',
    'Zastav sa, keď už zadné stehná nedovolia väčší rozsah, zvyčajne približne v polovici predkolení, nie až vtedy, keď sa kotúče dotknú podlahy.',
    'Zatlač boky dopredu a postav sa. Ide o predklon v bedrách, nie o krčenie ramien.',
  ],
  mistakes: [
    {
      title: 'Pokrčenie kolien do klasického mŕtveho ťahu',
      body: 'Ak kolená cestujú dopredu, spúšťaš činku ako pri drepe. Posúvaj boky, nie kolená.',
    },
    {
      title: 'Dotýkanie sa podlahy pri každom opakovaní',
      body: 'To je mŕtvy ťah s vystretými nohami zo zeme, nie RDL. Rozsah má určovať napätie zadných stehien.',
    },
    {
      title: 'Zaznamenávanie RDL ako klasického mŕtveho ťahu',
      body: 'Majú iný začiatok aj iný osobný rekord. Použi tento identifikátor.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-romanian-deadlift',
      name: 'Rumunský mŕtvy ťah s jednoručkami',
      note: 'Jednoduchší na učenie a praktický na cestách.',
    },
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Začína na podlahe a umožňuje väčšiu záťaž.',
    },
    {
      slug: 'barbell-good-morning',
      name: 'Predklon s veľkou činkou na chrbte',
      note: 'Činka je na chrbte a pohyb v bedrách je ešte výraznejší.',
    },
  ],
  progressions: [
    'Predklon v bedrách s tyčou.',
    'Ľahký RDL po polovicu predkolení.',
    'Záťaž pridaj, keď zostáva sklon chrbta počas celého pohybu rovnaký.',
  ],
  programming:
    'Hlavný cvik na zadné stehná s predklonom v bedrách: 3–4 série po 5–10 opakovaní. Záťaž bude oveľa nižšia než pri klasickom mŕtvom ťahu. Ak LIFTAG zobrazí tento cvik v rovnakom grafe, zaznamenal si nesprávny cvik.',
  relatedSlugs: ['conventional-deadlift', 'dumbbell-romanian-deadlift', 'machine-lying-leg-curl'],
} satisfies ExerciseOverlay
