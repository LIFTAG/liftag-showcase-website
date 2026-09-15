import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'straight-arm-pulldown',
  metaDescription:
    'Sťahovanie kladky s vystretými rukami: pevný uhol lakťov, oblúk širokých chrbtových svalov k stehnám a dôvod, prečo nejde o bežné sťahovanie kladky.',
  steps: [
    'Na hornú kladku pripoj tyč alebo lano. Ustúp, mierne sa predkloň a natiahni ruky nad hlavu s lakťami jemne pokrčenými; tento uhol zostane rovnaký.',
    'Stiahni adaptér k stehnám pohybom v ramenách, nie pokrčením lakťov. Rebrá drž dole a lano alebo tyč veď mimo tváre.',
    'V dolnej polohe stiahni široké chrbtové svaly bez zakláňania do skracovačky v stoji. Pomaly sa vráť do pohodlného natiahnutia nad hlavou.',
    'Vyber si tyč alebo lano a drž sa tejto voľby. Lano sa môže dole rozdeliť, tyč núti obe ruky zostať poctivé.',
  ],
  mistakes: [
    {
      title: 'Premena na sťahovanie kladky',
      body: 'Ak sa lakte stále pokrčujú, robíš sťahovanie kladky v stoji. Zafixuj uhol lakťov a zníž blok.',
    },
    {
      title: 'Dokončenie vystretím chrbtice',
      body: 'Široké chrbtové svaly vedú tyč k nohám. Zaklonené zakončenie je ego, nie väčší rozsah.',
    },
    {
      title: 'Zaznamenávanie ako sťahovanie hornej kladky',
      body: 'Iný pohyb v kĺboch znamená iný osobný rekord. Izolovaný cvik zostáva pod týmto identifikátorom.',
    },
    {
      title: 'Státie tak blízko, že kladka trafí tvár',
      body: 'Ustúp, kým dráha ťahu nevytvorí dlhý oblúk. Prílišná blízkosť skracuje prácu širokých chrbtových svalov a stláča ramená.',
    },
  ],
  variations: [
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie hornej kladky',
      note: 'Zložený variant: lakte sa ohýbajú, sedíš a môžeš pridať viac záťaže.',
    },
    {
      slug: 'dumbbell-pullover',
      name: 'Pullover s jednoručkou',
      note: 'Rovnaký pohyb vystretých rúk v ramenách, tentoraz na lavičke.',
    },
    {
      slug: 'pull-up',
      name: 'Zhyb nadhmatom',
      note: 'Zložený zvislý ťah, na ktorý táto izolácia pripravuje.',
    },
  ],
  progressions: [
    'Ľahké lano, pomalý oblúk a lakte zafixované v miernom pokrčení.',
    'Pracovné série po 10–15 opakovaní, v ktorých tyč stále dosiahne stehná bez náklonu.',
    'Záťaž pridaj, keď posledné tri opakovania vyzerajú ako prvé tri.',
    'Pri stagnácii pridaj pauzu pri stehnách alebo dlhšie natiahnutie nad hlavou.',
  ],
  programming:
    'Izolácia širokých chrbtových svalov po zhyboch alebo sťahovaní kladky: 2–4 série po 10–15 opakovaní. V porovnaní so sťahovaním kladky je správne použiť ľahšiu záťaž. Nenaháňaj tu čísla z kladky, inak začnú pomáhať lakte.',
  relatedSlugs: ['lat-pulldown', 'dumbbell-pullover', 'pull-up', 'wide-grip-lat-pulldown'],
} satisfies ExerciseOverlay
