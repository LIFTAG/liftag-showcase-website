import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-calf-raise',
  metaDescription:
    'Výpony v stoji s jednoručkami: stupienok, vystreté koleno, úplné natiahnutie a samostatné zaznamenávanie lýtok s voľnou záťažou oproti výponom v sede a na stroji v LIFTAG-u.',
  steps: [
    'Jednoručky drž po bokoch. Prednú časť chodidiel polož na stupienok a päty nechaj visieť. Kolená sú vystreté, ale nepretláčaj ich do hyperextenzie.',
    'Spusť päty do natiahnutia, v ktorom dokážeš zastaviť. Ak je stupienok príliš vysoký, použi kotúč s hranou alebo nižší blok.',
    'Zatlač cez vankúšik pod palcom a vystúp do pevného vystretia členkov. Zastav. Kolenami neodrážaj.',
    'Pomaly sa spusti. Ak sa jednoručky kývajú, séria obsahuje trhanie, nie výpon.',
    'Ak sa verzia na oboch nohách zmení len na prenášanie váhy, cvič na jednej nohe s jednou jednoručkou.',
  ],
  mistakes: [
    {
      title: 'Pokrčenie kolien do zmesi drepu a výponu',
      body: 'Keď pokrčíš kolená, prácu si odobral dvojhlavému lýtkovému svalu. Mierne ich uvoľni, potom uhol zachovaj.',
    },
    {
      title: 'Zaznamenávanie výponov v sede alebo na stroji sem',
      body: 'Práca s pokrčeným kolenom patrí k výponom v sede. Stroj s ramennou podložkou je strojový výpon v stoji. Jednoručky na stupienku zostávajú pod týmto identifikátorom.',
    },
    {
      title: 'Čiastočné pumpovanie bez natiahnutia',
      body: 'Dvojpalcové ťukanie na podlahe nie je výpon. Nechaj pätu visieť a členok úplne vystieraj, inak zaznamenávaš iba hluk.',
    },
    {
      title: 'Prevalenie na vonkajšiu hranu chodidla',
      body: 'Tlač cez vankúšik pod palcom. Prevalený členok pri uzamknutí je falošné stiahnutie a skutočné podvrtnutie na obzore.',
    },
  ],
  variations: [
    {
      slug: 'machine-standing-calf-raise',
      name: 'Výpon v stoji na stroji',
      note: 'Rovnaký dôraz na vystreté koleno, jednoduchšie nakladanie a iný osobný rekord.',
    },
    {
      slug: 'seated-calf-raise',
      name: 'Výpon v sede',
      note: 'Práca lýtka s pokrčeným kolenom. Zaraď ho vedľa, nenazývaj ho rovnakým cvikom.',
    },
    {
      slug: 'bodyweight-calf-raise',
      name: 'Výpon s vlastnou hmotnosťou',
      note: 'Odľahčený variant so zachovaným natiahnutím na stupienku.',
    },
    {
      slug: 'barbell-calf-raise',
      name: 'Výpon s veľkou činkou',
      note: 'Činka na chrbte, keď jednoručky nie sú limitom.',
    },
  ],
  progressions: [
    'Vlastná hmotnosť na stupienku s pauzou v oboch krajných polohách.',
    'Ľahké jednoručky pri cvičení na oboch nohách a úplné natiahnutie pri každom opakovaní.',
    'Záťaž pridaj, keď sa natiahnutie počas celej série neskracuje.',
    'Výpon v stoji na jednej nohe, ak jedna strana vždy podvádza pri uzamknutí. Túto stranu zaznamenaj.',
  ],
  programming:
    '3–4 série po 8–15 opakovaní po drepe alebo predklone v bokoch. Práca s vystretým kolenom zasiahne viac dvojhlavý lýtkový sval než výpon v sede. Zaznamenávaj dvojicu jednoručiek, nie iba „lýtka“. Ak budúci týždeň prejdeš na strojový výpon v stoji, ide o druhý cvik. Nedovoľ, aby rekord s jednoručkami pretiekol do grafu výponov v sede alebo na stroji.',
  equipmentAlternatives: [
    {
      slug: 'machine-standing-calf-raise',
      name: 'Výpon v stoji na stroji',
      note: 'Keď chceš namiesto jednoručiek a stupienka použiť ramennú podložku.',
    },
    {
      slug: 'seated-calf-raise',
      name: 'Výpon v sede',
      note: 'Zachovaj objem lýtok, keď potrebuješ pracovať s pokrčenými kolenami.',
    },
    {
      slug: 'bodyweight-calf-raise',
      name: 'Výpon s vlastnou hmotnosťou',
      note: 'Na cestách. Rovnaké natiahnutie bez záťaže.',
    },
  ],
  faqs: [
    {
      question: 'Potrebujem stupienok alebo môžem robiť výpony z podlahy?',
      answer:
        'Stupienok je súčasťou cviku. Z podlahy máš takmer nulové natiahnutie, hoci práve to je podstatná časť pohybu. Ak máš iba podlahu fitka, urob menej poctivých opakovaní na hrane kotúča namiesto obrovského počtu odrazov. Ak musíš, poznač „podlaha“ a neporovnávaj to s týždňom na stupienku.',
    },
  ],
  relatedSlugs: [
    'seated-calf-raise',
    'machine-standing-calf-raise',
    'bodyweight-calf-raise',
    'barbell-calf-raise',
  ],
} satisfies ExerciseOverlay
