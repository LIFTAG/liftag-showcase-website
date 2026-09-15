import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'decline-dumbbell-press',
  metaDescription:
    'Tlak s jednoručkami na šikmej lavičke hlavou dole: zaistenie nôh, dolná poloha a samostatné zaznamenávanie cviku na spodnú časť hrudníka oproti rovnému tlaku v LIFTAGu.',
  steps: [
    'Ešte pred ľahnutím si zahákni nohy pod opierky. Stačí mierny sklon nadol; pri príliš strmej lavičke sa ti nahrnie krv do hlavy a jednoručky poputujú smerom k tvári.',
    'Jednoručky dostaň do štartovej polohy odrazom od stehien alebo s pomocou druhého človeka. Začni vedľa spodnej časti hrudníka, s dlaňami dopredu alebo mierne k sebe.',
    'Spúšťaj ich, kým budú rukoväte približne v úrovni spodnej časti hrudníka a lakte mierne pod trupom, nie prudko smerom k podlahe, čo by bolo bolestivé.',
    'Vytlač jednoručky nahor a mierne k sebe, aby skončili nad spodnou časťou hrudníka. Ak lakte neznášajú prudké prepnutie, zakonči pohyb jemným vystretím.',
    'Pri vstávaní priveď jednoručky k stehnám a posaď sa. Aj bezpečný výstup je súčasť cviku; nezhadzuj 30 kg ponad tvár.',
  ],
  mistakes: [
    {
      title: 'Vynechanie zaistenia nôh',
      body: 'Na lavičke so sklonom nadol môžu nezaistené nohy spôsobiť, že spolu s cvičiacim skĺznu aj jednoručky. Najprv sa zaisti, potom tlač.',
    },
    {
      title: 'Použitie príliš strmého sklonu',
      body: 'Chcel si spodnú časť hrudníka, nie cirkusové vystúpenie. Na väčšine lavičiek stačí jedna alebo dve polohy pod rovinou.',
    },
    {
      title: 'Zaznamenávanie rekordov na šikmej lavičke do rovného tlaku s jednoručkami',
      body: 'Rozsah aj dráha sa líšia. Použi tento identifikátor, inak budú oba grafy vymyslené.',
    },
    {
      title: 'Pád v posledných troch palcoch',
      body: 'Sklon nadol už dolnú polohu predlžuje. Spúšťaj kontrolovane, inak ucítiš prednú časť ramena namiesto prsných svalov.',
    },
  ],
  variations: [
    {
      slug: 'barbell-decline-bench-press',
      name: 'Bench press s veľkou činkou na šikmej lavičke hlavou dole',
      note: 'Väčšia záťaž, kratší rozsah a stále potrebné zaistenie nôh.',
    },
    {
      slug: 'machine-decline-chest-press',
      name: 'Tlak na hrudník na stroji so sklonom nadol',
      note: 'Vedená dráha, keď nechceš na lavičke so sklonom odrážať jednoručky.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Rovný bench press s jednoručkami',
      note: 'Rovnaký vzorec v 0°. Začni ním, ak je nastavenie so sklonom neisté.',
    },
    {
      slug: 'decline-dumbbell-fly',
      name: 'Rozpažovanie s jednoručkami na lavičke hlavou dole',
      note: 'Izolovaný cvik v rovnakom uhle po tlaku.',
    },
  ],
  progressions: [
    'Osvoj si rovný bench press s jednoručkami s kontrolovanou dolnou polohou.',
    'Tlaky s miernym sklonom, pri ktorých dokážeš jednoručky bezpečne dostať hore aj sa posadiť bez dopomoci.',
    'Zastav sa palec nad hrudníkom a až potom naháňaj ťažšie jednoručky.',
    'Záťaž pridaj až vtedy, keď obe strany dokončia sériu spolu.',
  ],
  programming:
    'Tlak na rast svalov, nie test 1RM. 3–4 série po 8–12 opakovaní. Spoj ho so šikmým tlakom alebo rozpažovaním, nie s tlakom s veľkou činkou hlavou dole v ten istý deň, ak to výslovne nevyžadujú tvoje lakte. Zaznamenávaj skutočnú hmotnosť jednej jednoručky, nie súčet dvojice, a udržuj rovnaký spôsob merania, aby graf niečo znamenal.',
  equipmentAlternatives: [
    {
      slug: 'machine-decline-chest-press',
      name: 'Tlak na hrudník na stroji so sklonom nadol',
      note: 'Použi, keď na lavičke so sklonom nevieš jednoručky bezpečne dostať do štartu.',
    },
    {
      slug: 'decline-push-up',
      name: 'Klik s nohami vyššie',
      note: 'Tlak s nohami na vyvýšení, keď nemáš jednoručky.',
    },
  ],
  faqs: [
    {
      question: 'Potrebujem cviky so sklonom na spodnú časť hrudníka?',
      answer:
        'Nie. Rovný tlak aj dipy už zapájajú dolnú časť prsných svalov. Sklon nadol je užitočný druhý uhol, nie povinnosť. Ak je nastavenie nepríjemnejšie než samotné napumpovanie, vynechaj ho; LIFTAG bude sledovať tlak, ktorý skutočne cvičíš.',
    },
  ],
  relatedSlugs: [
    'barbell-decline-bench-press',
    'machine-decline-chest-press',
    'flat-dumbbell-bench-press',
    'chest-dips',
  ],
} satisfies ExerciseOverlay
