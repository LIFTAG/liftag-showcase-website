import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'high-to-low-cable-fly',
  metaDescription:
    'High-to-low cable fly: klesajúca dráha, zakončenie pri spodnej časti hrudníka a oddelené zapisovanie od crossoveru a low-to-high fly v LIFTAGu.',
  steps: [
    'Nastav obe kladky nad výšku ramien, uchop držadlá a vykroč do mierneho split postoja. Kolená nechaj mäkké a predklon drž rovnaký počas celej série.',
    'Lakeť mierne pokrč a takmer ho zafixuj. Veď paže dolu a k sebe, kým sa držadlá nestretnú pred spodnou časťou hrudníka alebo hornou časťou brucha. Nie pri bokoch.',
    'Dráha pripomína objatie, ktoré končí nízko. Ak ruky utečú ku krku, nerobíš tento cvik.',
    'Kontrolovane sa vracaj iba tak ďaleko, ako ramená zostávajú v pohodlí. Nedovoľ záťažovým blokom, aby ťa strhli do reverse fly.',
    'Uhol trupu zostáva pevný. Ak musíš na dokončenie opakovania robiť skracovačku, zníž kolík.',
  ],
  mistakes: [
    {
      title: 'Dokončenie pri bokoch',
      body: 'To je chop, nie fly. Zastav pri spodnej časti hrudníka. Ďalej už stáčaš ramená dopredu a strácaš prácu prsných svalov.',
    },
    {
      title: 'Zapisovanie ako standing cable crossover',
      body: 'Používaš rovnakú stanicu, ale s presnejším klesajúcim zakončením. Zachovaj tento cvik. Ak sa ruky skutočne stretli v strede hrudníka alebo sa prekrížili, séria patrí pod standing cable crossover.',
    },
    {
      title: 'Miešanie low-to-high do tohto grafu',
      body: 'Low-to-high vedie k hornej časti hrudníka a kladky sú dole. High-to-low je tento opačný smer. Sú to dva samostatné cviky; v LIFTAGu ich spriemeruj až po samostatnom zapisovaní.',
    },
    {
      title: 'Tlačenie držadiel nadol',
      body: 'Ak sa lakte ohýbajú a vystierajú, zmenil si cvik na cable press. Drž mäkký, pevný uhol alebo si vyber tlak a zapíš ten.',
    },
  ],
  variations: [
    {
      slug: 'standing-cable-crossover',
      name: 'Standing cable crossover',
      note: 'Rovnaké horné kladky, väčšia voľnosť v koncovej polohe. Samostatný cvik.',
    },
    {
      slug: 'low-to-high-cable-fly',
      name: 'Low-to-high cable fly',
      note: 'Opačný smer, väčší dôraz na hornú časť hrudníka. Pár s incline prácou, nie s týmto záznamom.',
    },
    {
      slug: 'pec-deck-flys',
      name: 'Pec deck flys',
      note: 'Izolácia na stroji, keď sú obe kladky obsadené.',
    },
    {
      slug: 'incline-dumbbell-press',
      name: 'Incline dumbbell press',
      note: 'Tlak, ktorý môžeš zaradiť v ten istý deň. Nie je to zámenná verzia tejto dráhy.',
    },
  ],
  progressions: [
    'Ľahké kolíky: dve sekundy veď držadlá k spodnej časti hrudníka a dve sekundy ich vracaj.',
    'Pridaj záťaž, až keď zakončenie stále vyzerá ako fly, nie ako skracovačka alebo tlak.',
    'Poznač si otvor kladky, ak je „horná“ poloha v tejto posilňovni iba tesne nad ramenom.',
    'Pec deck alebo dumbbell fly, ak káblová dráha dráždi rameno.',
  ],
  programming:
    'Izoláciu zaraď po tlaku, často v tréningu spodnej časti hrudníka alebo všeobecného fly. Rob 2–4 série po 10–15 opakovaní. Zapisuj kolík na jednom záťažovom bloku, nie súčet oboch. Standing cable crossover a low-to-high cable fly patria mimo tento graf, aj keď si použil rovnaké stĺpce. Ak ruky stretávaš vyššie než pri spodnej časti hrudníka, uveď výšku v poznámke. Odhadované 1RM v LIFTAGu tu nepotrebuješ. Nechaj bežať časovač odpočinku. Rýchle spúšťanie trhá rameno do natiahnutia.',
  equipmentAlternatives: [
    {
      slug: 'standing-cable-crossover',
      name: 'Standing cable crossover',
      note: 'Keď chceš rovnakú stanicu s menej prísnym zakončením.',
    },
    {
      slug: 'pec-deck-flys',
      name: 'Pec deck flys',
      note: 'Strojový fly, keď sú kladky obsadené.',
    },
  ],
  faqs: [
    {
      question: 'Je high-to-low to isté ako standing cable crossover?',
      answer:
        'Stanica je podobná, záznam však nie. Crossover dovolí stretnúť alebo prekrížiť ruky približne pri hrudníku. High-to-low je klesajúce objatie, ktoré končí pri spodnej časti hrudníka, nie pri bokoch. Ak zakončenie stále meníš, vyber jeden cvik a druhú verziu uveď v poznámke. Miešanie oboch do jedného grafu v LIFTAGu vytvorí falošný káblový rekord.',
    },
  ],
  relatedSlugs: [
    'incline-dumbbell-press',
    'standing-cable-crossover',
    'pec-deck-flys',
    'low-to-high-cable-fly',
  ],
} satisfies ExerciseOverlay
