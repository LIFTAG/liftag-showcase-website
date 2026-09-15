import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-rear-delt-fly',
  metaDescription:
    'Rozpažovanie na zadné ramená na stroji: čelom k podložke, nie k pec decku, a správne zaznamenávanie zadných deltových svalov v LIFTAG-u.',
  steps: [
    'Postav sa čelom k podložke. Toto nie je pec deck. Nastav sedadlo tak, aby rukoväte začínali približne vo výške ramien; hrudník opri o podložku a lakte mierne pokrč.',
    'Veď ruky von a dozadu, kým nebudú približne v línii trupu. Pohyb začínaj lakťami a ramená drž ďalej od uší.',
    'Pomaly sa vráť bez toho, aby sa kotúče dotkli. Náraz záťažového bloku v natiahnutí je oddych, nie opakovanie.',
    'Uhol lakťov zachovaj. Ak rukoväte cestujú k rebrám, začal si robiť príťah.',
    'Vyber si nastavenie rukovätí oproti podložke a horný alebo dolný otvor tak, aby pracovali zadné ramená bez padania ramena. Ak má fitko viac možností, poznač si otvor.',
  ],
  mistakes: [
    {
      title: 'Sedenie ako pri pec decku',
      body: 'Chrbát na podložke a spájanie rúk znamenajú pec deck. Pri zadných ramenách čelíš podložke a otváraš ruky. Naskenuj štítok, aby LIFTAG otvoril tento identifikátor, nie cvik na hrudník.',
    },
    {
      title: 'Pokrčenie lakťov na príťah stroja',
      body: 'Lakeť je mierne pokrčený, ale takmer pevný. Ak zakončenie vyzerá ako príťah v sede, zníž kolík a rozpažuj. Príťahy majú vlastné grafy.',
    },
    {
      title: 'Trhanie záťažového bloku, ktorý nevieš rozpažiť bez trhnutia',
      body: 'Stroj na zadné ramená ti dovolí naložiť ako na príťah. Ak sa hrudník odlepí od podložky, je to príliš ťažké. Toto nie je cvik na 1RM.',
    },
    {
      title: 'Zaznamenávanie ako pec deck',
      body: 'Rovnaký rám, opačný smer a opačný graf. Miešaním sa rekord hrudníka objaví v dni zadných ramien.',
    },
  ],
  variations: [
    {
      slug: 'bent-over-dumbbell-reverse-fly',
      name: 'Obrátené rozpažovanie s jednoručkami v predklone',
      note: 'Variant s voľnou záťažou, ktorý sa ťažšie stabilizuje, ale sleduje rovnakú myšlienku.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Face pull na ramená',
      note: 'Zadné rameno s vonkajšou rotáciou. Zaraď ho ako dvojicu, nie ako bezmyšlienkovú náhradu.',
    },
    {
      slug: 'pec-deck-flys',
      name: 'Rozpažovanie na pec decku',
      note: 'Opačný smer na mnohých rámoch. Nezamieňaj ich.',
    },
    {
      slug: 'cable-reverse-fly',
      name: 'Obrátené rozpažovanie na kladke',
      note: 'Kladky, keď má tento stroj rukoväte pri zápästiach a nevieš ho poctivo nastaviť.',
    },
  ],
  progressions: [
    'Ľahký záťažový blok, dvojsekundové otvorenie, hrudník prilepený k podložke a kotúče bez dotyku.',
    'Kolík pridaj, keď zostáva trup pokojný pri všetkých opakovaniach.',
    'Pomalé spúšťanie, ak ti dôjde poctivá záťaž skôr než technika.',
    'Obrátené rozpažovanie s jednoručkami alebo face pully, keď dráha stroja nesedí tvojim ramenám.',
  ],
  programming:
    'Stroj na zadné ramená poskytuje objem po tlaku bez premýšľania o predklone. Tri až štyri série po 12–20 opakovaní. V partnerskom fitku má QR alebo NFC štítok na tomto ráme otvoriť tento identifikátor. Ak otvorí pec deck, záznam už klame. Poznač si otvor sedadla. Nežeň sa za strojovým 1RM. LIFTAG záťaž uloží, ale graf slúži na týždenný objem, nie na preteky. Face pully majú vlastný identifikátor.',
  equipmentAlternatives: [
    {
      slug: 'bent-over-dumbbell-reverse-fly',
      name: 'Obrátené rozpažovanie s jednoručkami v predklone',
      note: 'Základná náhrada, keď je stroj obsadený alebo sú rukoväte v nesprávnej výške.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Face pull na ramená',
      note: 'Práca zadných ramien na kladke s lanom. Stále ide o iný cvik.',
    },
  ],
  faqs: [
    {
      question: 'Aj pec deck má podložku týmto smerom. Je to rovnaký cvik?',
      answer:
        'Nie. Ak máš hrudník na podložke a otváraš ruky, ide o rozpažovanie na zadné ramená na stroji. Ak máš chrbát na podložke a ruky spájaš, ide o pec deck. Rovnaký rám, dva identifikátory. Naskenuj štítok podľa smeru, ktorý si skutočne cvičil.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'shoulder-facepulls',
    'bent-over-dumbbell-reverse-fly',
    'cable-reverse-fly',
  ],
} satisfies ExerciseOverlay
