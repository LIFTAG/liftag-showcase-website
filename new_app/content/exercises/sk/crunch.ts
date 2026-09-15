import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'crunch',
  metaDescription:
    'Skracovačka: zrolovanie rebier k panve na podlahe, nie sed-ľah, a zaznamenávanie skracovačiek s vlastnou hmotnosťou v LIFTAGu oddelene od sed-ľahov a stroja na brucho.',
  steps: [
    'Ľahni si na chrbát, pokrč kolená a chodidlá polož na podlahu. Ruky si daj na hrudník alebo končeky prstov k spánkom. Prsty nezapletaj za hlavu a neťahaj za ňu.',
    'Podsaď panvu tak, aby bol driek pokojne položený na podlahe. Stiahni rebrá. To je začiatok. Medzera pod krížami by znamenala, že sa z toho stáva sed-ľah.',
    'Vydýchni a zroluj hrudný kôš smerom k panve. Lopatky sa odlepia od podlahy, boky zostávajú dole. Pozeraj do stropu, nie na kolená.',
    'Spúšťaj ramená, kým sa lopatky jemne nedotknú podlahy. Zastav. Ďalšie opakovanie začína odtiaľ, nie od odrazu.',
    'Ak sa chodidlá dvíhajú alebo sériu preberajú ohýbače bedier, skráť zrolovanie. Nie je to sed-ľah skrátený na polovicu.',
  ],
  mistakes: [
    {
      title: 'Ťahanie za krk',
      body: 'Ruky za hlavou a ťah znamenajú sériu pre krk. Prsty daj k spánkom, lakte nechaj široko a bradu mierne zasuň. Pohybujú sa rebrá, hlava ich iba nasleduje.',
    },
    {
      title: 'Odlepovanie krížov od podlahy',
      body: 'Keď sa odlepí driek, robíš sed-ľah. Zroluj rebrá. Ak sa stále dvíhaš až do sedu, zmeň identifikátor namiesto toho, aby si predstieral bonusový rozsah.',
    },
    {
      title: 'Zaznamenávanie sed-ľahov alebo stroja na brucho sem',
      body: 'Cvik na podlahe s vlastnou hmotnosťou, sed-ľah a stroj na brucho majú tri samostatné grafy. Pre tento cvik vyber identifikátor skracovačky na podlahe. Podložka so záťažovým blokom nie je tento cvik.',
    },
    {
      title: 'Odraz od lopatiek',
      body: 'Spadnutie a prudké trhnutie je iba zotrvačnosť. Zastav na podlahe a potom sa zroluj. Ak potrebuješ odraz, opakovania, ktoré sa počítali, už skončili.',
    },
  ],
  variations: [
    {
      slug: 'sit-up',
      name: 'Sed-ľah',
      note: 'Driek sa odlepí od podlahy. Iný identifikátor a väčšia práca ohýbačov bedier.',
    },
    {
      slug: 'machine-ab-crunch',
      name: 'Skracovačka na stroji',
      note: 'Zaťažená podložka. Vyber tento variant, nie identifikátor cviku na podlahe.',
    },
    {
      slug: 'reverse-crunch',
      name: 'Obrátená skracovačka',
      note: 'Panva smeruje k rebrám, keď ohýbače bedier preberajú skracovačku na podlahe.',
    },
    {
      slug: 'kneeling-cable-crunch',
      name: 'Kľaková skracovačka na kladke',
      note: 'Zrolovanie s kladkou, keď chceš pridať záťaž bez premeny cviku na sed-ľah.',
    },
  ],
  progressions: [
    'Ruky na hrudníku, pomalé zrolovanie, výdrž hore a kríže prilepené k podlahe.',
    'Končeky prstov pri spánkoch, keď zostáva krk pokojný.',
    'Kotúč na hrudi pridaj až po zvládnutí čistého pohybu. Zaznamenaj jeho hmotnosť.',
    'Obrátená skracovačka alebo stroj, keď potrebuješ záťaž, ktorú podlaha neposkytne.',
  ],
  programming:
    'Izolácia po hlavných cvikoch: 3 série po 12–20 opakovaní. Zaznamenávaj opakovania. Ak držíš kotúč, zaznamenaj aj jeho hmotnosť. Skracovačka na podlahe zostáva pod týmto identifikátorom. Sed-ľah a skracovačka na stroji majú iné rekordy. Spoj ju s plankom alebo zdvihom nôh vo vise, nie s ďalšou variáciou skracovačky v rovnakom bloku iba preto, aby si mal pocit práce.',
  equipmentAlternatives: [
    {
      slug: 'machine-ab-crunch',
      name: 'Skracovačka na stroji',
      note: 'Použi záťažový blok, keď vlastná hmotnosť nestačí a podložka ti sedí.',
    },
    {
      slug: 'kneeling-cable-crunch',
      name: 'Kľaková skracovačka na kladke',
      note: 'Rovnaké zrolovanie rebier k panve s kladkou, keď nemáš stroj na brucho.',
    },
    { slug: 'plank', name: 'Plank', note: 'Spevnenie namiesto ohýbania, ak dnes chrbát zle znáša flexiu.' },
  ],
  faqs: [
    {
      question: 'Je skracovačka iba krátky sed-ľah?',
      answer:
        'Nie. Pri sed-ľahu sa odlepia kríže a ohýbače bedier pomáhajú dostať telo do sedu. Pri skracovačke smeruje hrudný kôš k panve a driek zostáva na podlahe. Ak si sa posadil, zaznamenaj sed-ľah. Ak si použil podložku a záťažový blok, zaznamenaj skracovačku na stroji.',
    },
  ],
  relatedSlugs: ['machine-ab-crunch', 'plank', 'reverse-crunch', 'sit-up'],
} satisfies ExerciseOverlay
