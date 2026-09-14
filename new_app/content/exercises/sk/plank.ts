import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'plank',
  metaDescription:
    'Plank: nastavenie, spevnenie tela a zapisovanie časovaných výdrží v LIFTAGu, aby práca na strede tela nezanikla vedľa skracovačiek.',
  steps: [
    'Polož predlaktia na podlahu, lakte maj pod ramenami a dlane približne v jednej línii. Nohy sú vystreté a špičky opreté o podlahu.',
    'Aktívne odtlač podlahu, aby lopatky nepadali medzi paže. Zapoj sedacie svaly a kvadricepsy; boky nesmú klesať ani sa dvíhať do strechy.',
    'Vytvor dlhú líniu od hlavy po päty. Pozeraj do podlahy, nie na stenu pred sebou.',
    'Dýchaj. Vydrž, kým sa línia tela nezačne rozpadať, a potom polož kolená. Tichá, trasľavá výdrž bez dychu je panika, nie spevnenie tela.',
  ],
  mistakes: [
    {
      title: 'Prehýbanie krížov kvôli ďalším sekundám',
      body: 'Výdrž sa počíta iba dovtedy, kým drží línia tela. Klesnutie bokov znamená koniec série, nie bonusové opakovania.',
    },
    {
      title: 'Dvíhanie bokov, aby bola poloha ľahšia',
      body: 'Potom z planku vznikne smutný downward dog. Ak nedokážeš udržať boky v línii, skráť páku alebo prejdi na kolená a zapíš to.',
    },
    {
      title: 'Zapisovanie „1 série“ bez času',
      body: '20-sekundový plank a 90-sekundový plank nie sú rovnaký tréning. Zapíš do denníka počet sekúnd, inak bude história plná rovnakých jednotiek.',
    },
    {
      title: 'Zadržiavanie dychu počas celej výdrže',
      body: 'Trénuješ spevnenie, za ktorým dokážeš dýchať, nie odpočítavanie do chvíle, keď zmodrieš.',
    },
  ],
  variations: [
    {
      slug: 'side-plank',
      name: 'Side plank',
      note: 'Bočné spevnenie tela; ľavú a pravú stranu zapisuj oddelene, akoby išlo o dve výdrže.',
    },
    {
      slug: 'hollow-body-hold',
      name: 'Hollow body hold',
      note: 'Výdrž na chrbte so zadným podsadením panvy — iná zručnosť, ktorá sa tiež meria časom.',
    },
    {
      slug: 'dead-bug',
      name: 'Dead bug',
      note: 'Pohyb končatín pri pokojnej spodnej časti chrbta.',
    },
    {
      slug: 'cable-pallof-press',
      name: 'Cable Pallof press',
      note: 'Anti-rotačný cvik so záťažou, keď chceš pridať odpor namiesto predlžovania výdrže.',
    },
  ],
  progressions: [
    'Plank na kolenách alebo so skrátenou pákou, kým nezvládneš 30 čistých sekúnd.',
    'Časovaný plank na predlaktiach s neprerušovanou líniou tela.',
    'Pridávaj čas po 10 sekundách alebo pridaj kotúč na chrbát — nie oboje v rovnakom týždni.',
    'Dlhšia páka (predlaktia mierne vpredu) alebo side plank, keď je 60–90 sekúnd ľahkých.',
  ],
  programming:
    'Tri výdrže, nie desaťminútové pozeranie do podlahy. Sériu ukonči, keď boky klesnú; to je skutočné trvanie. Ak pridáš záťaž, zapíš kotúč. Side plank a hollow body hold sú samostatné cviky — nehádž každé spevnenie do jedného cviku len preto, že všetky cítiš v strede tela.',
  faqs: [
    {
      question: 'Ako dlho by mal plank trvať?',
      answer:
        'Dostatočne dlho na to, aby bolo spevnenie náročné, ale tak, aby sa línia tela nikdy nerozbila. Pre väčšinu cvičiacich je to 20–60 sekúnd na sériu, nie pokus o päťminútový rekord. Najprv zlepši kvalitu, potom čas.',
    },
  ],
  relatedSlugs: [
    'side-plank',
    'hanging-leg-raise',
    'cable-pallof-press',
    'hollow-body-hold',
    'crunch',
    'kneeling-ab-rollout',
  ],
} satisfies ExerciseOverlay
