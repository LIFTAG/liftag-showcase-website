import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'incline-dumbbell-curl',
  metaDescription:
    'Bicepsový zdvih s jednoručkami na šikmej lavičke: uhol lavičky, natiahnutie a samostatné zapisovanie zdvihov v predĺženej polohe oproti zdvihom v sede v LIFTAGu.',
  steps: [
    'Nastav lavičku približne na 45–60° a posaď sa úplne dozadu. Ak sedíš takmer vzpriamene, práve si si zvolil seated curl.',
    'Nechaj jednoručky visieť vedľa tela s pažami mierne za trupom. Dlane začínajú v supinácii alebo v neutrále.',
    'Priťahuj ich k ramenám bez posúvania lakťov dopredu, ktoré by zrušilo natiahnutie. Ak začínaš neutrálne, počas zdvihu otoč dlane nahor.',
    'Spúšťaj do úplného visu a pred ďalším opakovaním na chvíľu zastav. Práve tento vis je dôvod, prečo cvik existuje.',
  ],
  mistakes: [
    {
      title: 'Sadanie hore, keď séria stvrdne',
      body: 'V momente, keď sa chrbát odlepí od operáka, natiahnutie zmizne. Zníž jednoručky, nie uhol lavičky.',
    },
    {
      title: 'Lakte putujú dopredu',
      body: 'Potom robíš seated curl s nábytkom navyše. Nadlaktie drž za trupom počas celého opakovania.',
    },
    {
      title: 'Zapisovanie ako seated alebo standing dumbbell curl',
      body: 'Tu zvládneš menej opakovaní. Zachovaj tento cvik, inak práca v predĺženej polohe zmizne v grafe silnejšieho cviku.',
    },
    {
      title: 'Švih jednoručkami zo spodnej polohy',
      body: 'Hike patrí kettlebellu. Ak potrebuješ švih na začatie zdvihu, natiahnutie ťa už porazilo — zníž váhu.',
    },
  ],
  variations: [
    {
      slug: 'seated-dumbbell-bicep-curl',
      name: 'Seated dumbbell bicep curl',
      note: 'Vzpriamený sed, menšie natiahnutie a ľahšie nakladanie.',
    },
    {
      slug: 'barbell-curl',
      name: 'Barbell curl',
      note: 'Bilateral zdvih v stoji, pri ktorom môžeš pridávať malé kroky.',
    },
    {
      slug: 'concentration-curl',
      name: 'Concentration curl',
      note: 'Izolácia v skrátenej polohe, ak šikmé natiahnutie dráždi rameno.',
    },
    {
      slug: 'hammer-curls',
      name: 'Hammer curls',
      note: 'Neutrálny úchop, keď je limitom natiahnutie v supinácii.',
    },
  ],
  progressions: [
    'Ľahké jednoručky na 60° alebo nižšie, s visom, ktorý dokážeš udržať.',
    'Pracovné série po 8–12 opakovaní s chrbtom pevne na operáku.',
    'Pred pridaním záťaže pridaj jednosekundovú pauzu v dolnej polohe.',
    'Uhol lavičky zníž o otvor až vtedy, keď je súčasný čistý; číslo otvoru si poznač.',
  ],
  programming:
    'Použi ako bicepsový cvik v predĺženej polohe: 2–4 série po 8–12 opakovaní. Ak chceš druhý prechod v skrátenej polohe, spáruj ho s preacher alebo cable curl, nie s ďalším ťažkým incline curl. Ak má „incline“ lavička v posilňovni štyri rôzne uhly, uveď otvor v poznámke.',
  faqs: [
    {
      question: 'Aký strmý má byť sklon lavičky?',
      answer:
        'Taký, aby paže viseli za trupom, ale aby si nesedel takmer vzpriamene. Väčšina cvičiacich skončí medzi 45° a 60°. Vyšší sklon už začína vyzerať ako seated curl, ktorý má v LIFTAGu samostatný záznam.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'seated-dumbbell-bicep-curl',
    'standing-dumbbell-bicep-curl',
    'machine-preacher-curl',
    'concentration-curl',
  ],
} satisfies ExerciseOverlay
