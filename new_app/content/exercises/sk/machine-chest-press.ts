import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-chest-press',
  metaDescription:
    'Tlaky na hrudník na stroji: výška sedadla, voľba rukovätí a poctivé zaznamenávanie strojových tlakov v LIFTAGu, aby sken otvoril správny cvik.',
  steps: [
    'Nastav sedadlo tak, aby rukoväte smerovali do stredu hrudníka. Príliš vysoko zdvihneš ramená, príliš nízko budeš tlačiť do ramien.',
    'Chodidlá zapri o podlahu, hornú časť chrbta prilep k opierke a uchop rukoväte tak, aby lakte zostali pod zápästiami.',
    'Vytlač do mäkkého vystretia bez straty kontaktu s opierkou. Vráť sa, kým cítiš natiahnutie, nie až kým závažový blok narazí.',
  ],
  mistakes: [
    {
      title: 'Hlava a rebrá sa odlepujú od opierky',
      body: 'Zo strojového tlaku si práve urobil neusporiadaný tlak z podlahy. Zostaň opretý.',
    },
    {
      title: 'Každý stroj na hrudník zapisuješ ako tento cvik',
      body: 'Šikmý, klesajúci tlak a pec deck sú iné identifikátory. Naskenuj štítok — LIFTAG otvorí cvik priradený ku konkrétnemu stroju.',
    },
  ],
  variations: [
    {
      slug: 'machine-incline-chest-press',
      name: 'Šikmé tlaky na hrudník na stroji',
      note: 'Strojová alternatíva s väčším dôrazom na hornú časť hrudníka.',
    },
    {
      slug: 'pec-deck-flys',
      name: 'Rozpažovanie na pec decku',
      note: 'Izolačný cvik na podobnom mieste.',
    },
    {
      slug: 'barbell-bench-press',
      name: 'Bench press s veľkou činkou',
      note: 'Voľná váha s rovnakým základným pohybom.',
    },
  ],
  progressions: [
    'Ľahký závažový blok, plný rozsah a žiadne odrážanie.',
    'Kotúče alebo kolík pridaj, keď sú aj posledné dve opakovania čisté.',
  ],
  programming:
    'Strojový tlak poskytuje týždenný objem pre hrudník bez sparing partnera: 3–4 série po 8–15 opakovaní. V partnerskom fitku má QR alebo NFC štítok na tomto stroji otvoriť tento identifikátor; ak otvorí iný tlak, oznám to fitku, aby denník zostal poctivý.',
  relatedSlugs: ['barbell-bench-press', 'pec-deck-flys', 'machine-incline-chest-press'],
} satisfies ExerciseOverlay
