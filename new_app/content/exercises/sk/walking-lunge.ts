import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'walking-lunge',
  metaDescription:
    'Chôdzový výpad: dĺžka kroku, priestor a zaznamenávanie krokov bez miešania spätných výpadov do rovnakého osobného rekordu.',
  steps: [
    'Uvoľni si dráhu. Stoj vzpriamene, vykroč dopredu do rozkročenia, v ktorom vieš ticho dopadnúť, a ohni obe kolená do hĺbky, ktorú dokážeš opakovať.',
    'Predné chodidlo nechaj pevne na podlahe, koleno veď v smere špičiek a panvu smeruj dopredu. Nechoď po úzkej čiare ani príliš širokým, neistým krokom.',
    'Zatlač predným chodidlom, pritiahni zadnú nohu dopredu a pokračuj v chôdzi. Ak ďalší došľap spôsobuje iba zotrvačnosť, na chvíľu zastav.',
    'Kratšie kroky viac zaťažia koleno, dlhšie boky. Vyber si jednu dĺžku kroku a počas série ju zachovaj.',
  ],
  mistakes: [
    {
      title: 'Chôdza po lane',
      body: 'Chodidlá by mali dopadať približne na šírku bokov. Jedna úzka línia spôsobuje kývanie a padanie kolena dovnútra.',
    },
    {
      title: 'Ponáhľanie sa do došľapu',
      body: 'Ak sa v dolnej polohe nevieš zastaviť, ďalší krok je pád. Spomaľ alebo zníž záťaž.',
    },
    {
      title: 'Zaznamenávanie spätných výpadov alebo delených drepov sem',
      body: 'Chôdzové výpady majú iný došľap aj iný osobný rekord. Spätné výpady a delený drep majú vlastné identifikátory.',
    },
    {
      title: 'Počítanie iba jednej strany',
      body: 'Rozhodni sa pre celkový počet krokov alebo pre počet na každú nohu a drž sa toho. „20 chôdzových výpadov“ ako 10 na každú stranu je v poriadku; miešať oba spôsoby z týždňa na týždeň nie.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Zvyčajne na mieste alebo s kratším krokom. Rovnaký vzorec a jednoduchšie ovládanie došľapu.',
    },
    {
      slug: 'dumbbell-reverse-lunge',
      name: 'Spätný výpad s jednoručkami',
      note: 'Krok dozadu, často šetrnejší k prednému kolenu.',
    },
    { slug: 'split-squat', name: 'Delený drep', note: 'Stacionárny variant bez náročnosti chôdze.' },
    {
      slug: 'barbell-lunge',
      name: 'Výpad s veľkou činkou',
      note: 'Rovnaká myšlienka s osou. Najprv si ju zaslúž.',
    },
  ],
  progressions: [
    'Chôdzové výpady s vlastnou hmotnosťou v rovnej línii a tichými došľapmi.',
    'Goblet variant alebo ľahké jednoručky, keď je dĺžka kroku automatická.',
    'Pracovné série po 8–12 opakovaní na každú nohu. Záťaž pridaj, keď posledné kroky vyzerajú ako prvé.',
    'Spätné výpady alebo delené drepy, ak je limitom chôdza, nie nohy.',
  ],
  programming:
    'Kondičný objem a objem na jednej nohe, nie maximálny silový cvik: 2–4 série po 8–12 opakovaní na každú nohu po drepoch. Do poznámky uveď pomôcku (vlastná hmotnosť, goblet, dve jednoručky). Rekord po prechode z vlastnej hmotnosti na 20 kg goblet je skutočný; rekord zo skrátenia dráhy nie.',
  faqs: [
    {
      question: 'Ako mám počítať opakovania?',
      answer:
        'Pri tomto identifikátore si vyber celkový počet krokov alebo počet opakovaní na každú nohu a spôsob zachovaj. Počet na nohu sa ľahšie porovnáva so spätnými výpadmi a delenými drepmi. Ak by si si to v budúcnosti mohol pomýliť, do poznámky série napíš „/noha“.',
    },
  ],
  relatedSlugs: ['dumbbell-lunge', 'barbell-lunge', 'dumbbell-reverse-lunge', 'split-squat'],
} satisfies ExerciseOverlay
