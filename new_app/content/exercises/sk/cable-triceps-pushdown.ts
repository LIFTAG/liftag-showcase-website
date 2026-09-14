import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-triceps-pushdown',
  metaDescription:
    'Stláčanie lana na triceps: lakte pri tele, rozdelenie lana v závere a zapisovanie cviku z hornej kladky v LIFTAG.',
  steps: [
    'Pripoj lano k hornej kladke a postav sa tak blízko, aby ťa zásobník neťahal dopredu. Rebrá drž dole; mierny predklon z bokov je v poriadku, skrčenie trupu nie.',
    'Uchop lano palcami nahor a prilep lakte k rebrám. Nadlaktia sa takmer nehýbu.',
    'Stláčaj nadol, kým sa lakte nevystrú a konce lana neroztiahneš od seba. Toto rozdelenie je záver, nie ozdoba.',
    'Vracaj lano, kým sú predlaktia približne rovnobežne so zemou. Zastav skôr, než lano vyletí hore a lakte sa zmenia na extenziu nad hlavou.',
  ],
  mistakes: [
    {
      title: 'Zapisuješ ho ako skullcrusher',
      body: 'Lying extenzia s EZ osou je ez-bar-skullcrusher. Toto je stojace lano na hornej kladke. Vzor aj váha sú iné, preto používaj cable-triceps-pushdown.',
    },
    {
      title: 'Pri tomto cviku používaš inú rukoväť',
      body: 'Katalógový názov označuje lano. Rovná, V-rukoväť aj spätný úchop sú samostatné cviky a váha na kolíku sa nedá porovnávať.',
    },
    {
      title: 'Lakte necháš putovať dopredu',
      body: 'Keď nadlaktia opustia rebrá, tlačíš latissimami a bruchom. Prilep lakte; ak nedržia, uber záťaž.',
    },
    {
      title: 'V závere lano nerozdelíš',
      body: 'Ruky pri dne spolu znamenajú skrátený pohyb. Rozdeľ konce lana — práve tam dokončíš prácu tricepsu.',
    },
  ],
  variations: [
    {
      slug: 'straight-bar-triceps-pushdown',
      name: 'Stláčanie tricepsu s rovnou tyčou',
      note: 'Rovnaká myšlienka s lakťami pri tele, iná rukoväť a samostatný cvik.',
    },
    {
      slug: 'overhead-cable-triceps-extension',
      name: 'Extenzia tricepsu nad hlavou na kladke',
      note: 'Lakte pri ušiach, natiahnutie dlhej hlavy a stále kábel.',
    },
    {
      slug: 'ez-bar-skullcrusher',
      name: 'Skullcrusher s EZ osou',
      note: 'Ležiaca izolácia, keď je kladka obsadená. Nezapisuj ho sem.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press úzkym úchopom',
      note: 'Tlakový vzor, keď izolácia nie je limitom.',
    },
  ],
  progressions: [
    'Ľahké lano, lakte pri tele a úplné rozdelenie v závere.',
    'Pracovné série po 10–15 opakovaní s rovnakým postojom a rukoväťou.',
    'Pred pridaním váhy na kolík podrž rozdelenie lana.',
    'Extenziu nad hlavou alebo stláčanie tyče veď ako samostatný cvik.',
  ],
  programming:
    'Objem pre triceps po tlakoch: tri až štyri série po 10–15. Tento cvik používa lano; rovná tyč, V-rukoväť a spätný úchop majú vlastné grafy a skullcrusher je iný vzor. Ak je na hornej kladke štítok, naskenuj ho, aby otvoril cable-triceps-pushdown, nie ez-bar-skullcrusher. Odpočívaj tak dlho, aby sa záver sérií stále rozdeľoval.',
  equipmentAlternatives: [
    {
      slug: 'straight-bar-triceps-pushdown',
      name: 'Stláčanie tricepsu s rovnou tyčou',
      note: 'Keď lano nie je voľné. Zapisuj vlastný cvik, nie tento.',
    },
    {
      slug: 'v-bar-triceps-pushdown',
      name: 'Stláčanie tricepsu s V-rukoväťou',
      note: 'Úchop je bližší kladivovému, stále však nejde o lano; má vlastný graf.',
    },
    {
      slug: 'machine-triceps-extension',
      name: 'Extenzia tricepsu na stroji',
      note: 'Stroj s oporou alebo rukoväťami, keď sú všetky kladky obsadené.',
    },
  ],
  faqs: [
    {
      question: 'Je stláčanie lana to isté ako skullcrusher?',
      answer:
        'Nie. Jedno je stojace lano na hornej kladke s lakťami pri rebrách, druhé ležiaca extenzia s EZ osou. Nároky aj váha sa líšia. Lano zapisuj pod cable-triceps-pushdown; keď ho dáš pod ez-bar-skullcrusher, pokazíš oba grafy.',
    },
  ],
  relatedSlugs: [
    'overhead-cable-triceps-extension',
    'close-grip-bench-press',
    'ez-bar-skullcrusher',
    'straight-bar-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
