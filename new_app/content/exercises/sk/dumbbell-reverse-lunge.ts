import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-reverse-lunge',
  metaDescription:
    'Spätný výpad s jednoručkami: tichý došľap vzad, pokojné predné koleno a zaznamenávanie spätných výpadov v LIFTAG-u oddelene od chôdzových a predných výpadov.',
  steps: [
    'Stoj vzpriamene s jednoručkami po bokoch, kĺby prstov smerujú dopredu a ramená drž pevne. Predné chodidlo zostane na mieste; o to ide.',
    'Vykroč dozadu na špičku zadnej nohy do rozkročeného postoja, v ktorom dokážeš ticho dopadnúť. Celé predné chodidlo nechaj na podlahe a pätu dole.',
    'Pokrč obe kolená. Predné predkolenie zostáva pokojnejšie než pri výpade dopredu. Trup drž nad panvou, neskláňaj ho k prednému kolenu.',
    'Zatlač predným chodidlom do podlahy a postav sa. Zadná noha sa vráti. Medzi opakovaniami nepreskakuj a nehľadaj nové miesto predným chodidlom.',
    'Kratší krok znamená väčší dôraz na koleno, dlhší viac na boky. Vyber si jeden a počas série ho zachovaj.',
  ],
  mistakes: [
    {
      title: 'Premena cviku na chôdzový výpad',
      body: 'Ak sa stále posúvaš dopredu, opustil si tento identifikátor. Chôdzový výpad má iný došľap aj iný osobný rekord.',
    },
    {
      title: 'Zaznamenávanie predných výpadov sem',
      body: 'Krok dopredu pri každom opakovaní prudko mení uhol predkolenia. Pri spätnom výpade zostáva predné chodidlo stabilné. Na krok dopredu použi výpad s jednoručkami.',
    },
    {
      title: 'Čoraz plytší výpad, keď jednoručky ťažknú',
      body: 'Ak je štvrtý týždeň iba malé pokrčenie, rekord je falošný. Natoč si jednu stranu alebo si pre zadné koleno vyber cieľ na podlahe.',
    },
    {
      title: 'Jednoručky sa kývajú ako metronómy pri chôdzi',
      body: 'Ruky drž pokojne. Kývajúca sa jednoručka znamená, že trup zaostáva. Zastav v dolnej polohe alebo zníž záťaž.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Krok dopredu. Iný došľap a zvyčajne podráždenejšie predné koleno.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Pokračuj v pohybe. Viac rovnováhy aj celkovej únavy.',
    },
    {
      slug: 'split-squat',
      name: 'Delený drep',
      note: 'Chodidlá zostávajú na mieste. Najlepší, keď je problémom samotný krok.',
    },
    {
      slug: 'dumbbell-step-up',
      name: 'Výstup na lavičku s jednoručkami',
      note: 'Jednonožný cvik na vyvýšenie, nie krok dozadu.',
    },
  ],
  progressions: [
    'Spätné výpady s vlastnou hmotnosťou, kým bude došľap zadnej nohy tichý.',
    'Ľahké jednoručky, 8–12 opakovaní na každú nohu a rovnaká hĺbka na oboch stranách.',
    'Záťaž pridaj, keď predná päta nikdy nestratí kontakt s podlahou a jednoručky sa nehýbu.',
    'Chôdzový alebo bulharský variant až vtedy, keď spätný krok už nie je limitom.',
  ],
  programming:
    'Základný zaťažený spätný výpad: 3–4 série po 8–12 opakovaní na každú nohu po drepe. Zaznamenaj dvojicu jednoručiek aj obe nohy. Ak uprostred bloku prejdeš na krok dopredu alebo na chôdzu, zmeň identifikátor, inak bude odhadované 1RM spájať dva došľapy do jedného cviku.',
  equipmentAlternatives: [
    {
      slug: 'split-squat',
      name: 'Delený drep',
      note: 'Bez kroku. Zachováš rozkročený postoj, keď je problémom došľap.',
    },
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Variant s krokom dopredu, ak je spätný výpad čistý a chceš práve opačný došľap.',
    },
  ],
  faqs: [
    {
      question: 'Prečo robiť spätný výpad namiesto výpadu dopredu?',
      answer:
        'Predné chodidlo zostáva na mieste. Pri každom opakovaní nenarážaš do nového uhla predkolenia, preto ho podráždené kolená často znášajú lepšie. Ak je spätný výpad čistý a predný nie, naprogramuj tento identifikátor a výpad s jednoručkami nechaj na neskôr. Neopakuj bolestivý krok dopredu iba preto, aby si „robil výpady“.',
    },
  ],
  relatedSlugs: ['dumbbell-lunge', 'walking-lunge', 'split-squat', 'dumbbell-step-up'],
} satisfies ExerciseOverlay
