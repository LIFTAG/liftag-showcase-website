import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pec-deck-flys',
  metaDescription:
    'Rozpažovanie na pec decku: výška sedadla, uhol lakťov a zaznamenávanie izolácie hrudníka na stroji v LIFTAG-u.',
  steps: [
    'Nastav sedadlo tak, aby rukoväte alebo podložky boli v strednej výške hrudníka a ramená zostali stiahnuté.',
    'Lakte mierne pokrč a rovnaký uhol zachovaj počas celého pohybu. Toto nie je tlak.',
    'Spoj podložky bez krčenia ramien. Vracaj ich, kým necítiš natiahnutie hrudníka, nie prepadnutie ramien.',
  ],
  mistakes: [
    {
      title: 'Premena cviku na tlak',
      body: 'Ak lakte cestujú ako pri tlaku na hrudník, vybral si nesprávny pohyb stroja. Zachovaj oblúk rozpažovania.',
    },
    {
      title: 'Odraz záťažového bloku v natiahnutí',
      body: 'Natiahnutie je súčasť práce. Pohyb kontroluj alebo zníž kolík.',
    },
  ],
  variations: [
    {
      slug: 'flat-bench-dumbbell-fly',
      name: 'Rozpažovanie s jednoručkami na rovnej lavičke',
      note: 'Variant s voľnou záťažou, ktorý sa ťažšie stabilizuje.',
    },
    {
      slug: 'standing-cable-crossover',
      name: 'Kríženie kladiek v stoji',
      note: 'Kladky umožnia voľnejšie zvoliť dráhu.',
    },
  ],
  progressions: [
    'Ľahký záťažový blok a dvojsekundové stiahnutie.',
    'Záťaž pridaj, keď natiahnutie zostáva pokojné v ramenách.',
  ],
  programming:
    'Izolácia po tlaku: 2–4 série po 10–15 opakovaní. Naskenuj štítok pec decku, aby sa cvik v zázname nezaradil k tlaku na hrudník na stroji.',
  relatedSlugs: ['machine-chest-press', 'flat-bench-dumbbell-fly', 'standing-cable-crossover'],
} satisfies ExerciseOverlay
