import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-cable-crossover',
  metaDescription:
    'Kríženie kladiek v stoji: vysoké kladky, stály uhol lakťov a zaznamenávanie práce hrudníka bez miešania s rozpažovaním zdola nahor či na peck-decku v jednom grafe LIFTAG.',
  steps: [
    'Obe kladky nastav nad výšku ramien, do každej ruky vezmi držadlo a vykroč dopredu do rozkročeného postoja s kladkami za chrbtom. Kolená nechaj mäkké a rebrá stiahnuté.',
    'Udržuj takmer rovnaké pokrčenie lakťov. Veď paže dolu a dovnútra, až kým sa ruky stretnú alebo mierne prekrížia pred dolnou časťou hrudníka.',
    'Mierny predklon je v poriadku. Pri dokončení však neotáčaj trup. Závažie má byť v natiahnutí stále vo vzduchu.',
    'Vracaj ruky, kým cítiš natiahnutie hrudníka, nie až kým ťa záťaž strhne dozadu. Poslednú tretinu pohybu ovládaj.',
    'Ak začneš lakte vystierať ako pri tlaku, vybral si tlak. Uber kolíky a zachovaj rozpažovanie.',
  ],
  mistakes: [
    {
      title: 'Kladky sú pri bokoch',
      body: 'Vtedy robíš rozpažovanie zdola nahor, čo je iný cvik a iná línia pohybu. Pri tomto cviku používaj vysoké kladky. Ak ich niekedy nastavíš do strednej výšky, poznač si otvor.',
    },
    {
      title: 'Meníš cvik na tlak v stoji',
      body: 'Pokrčenie a vystieranie lakťov znamená tlak s kladkami. Uhol lakťov zostáva mäkký a stály. Tlaky zapisuj na vlastný riadok.',
    },
    {
      title: 'Pri natiahnutí ťa záťaž odhodí dozadu',
      body: 'Práve preto ľudia nemajú radi kríženie kladiek. Vykroč dopredu, uber kolík a ovládaj excentrickú fázu. Natiahnutie je súčasť práce.',
    },
    {
      title: 'Zapisuješ rozpažovanie zhora nadol alebo peck-deck',
      body: 'Zhora nadol končí pohyb striktnejšie smerom dolu a peck-deck je stroj. Zachovaj tento cvik. Inak sa káblový rekord objaví v grafe zo dňa na peck-decku.',
    },
  ],
  variations: [
    {
      slug: 'pec-deck-flys',
      name: 'Rozpažovanie na peck-decku',
      note: 'Strojová verzia, pri ktorej nemusíš riešiť postoj.',
    },
    {
      slug: 'high-to-low-cable-fly',
      name: 'Rozpažovanie na kladkách zhora nadol',
      note: 'Rovnaké vysoké kladky, no výraznejšie klesajúce zakončenie. Samostatný cvik a vlastný graf.',
    },
    {
      slug: 'low-to-high-cable-fly',
      name: 'Rozpažovanie na kladkách zdola nahor',
      note: 'Opačná línia s väčším dôrazom na hornú časť hrudníka. Nezapisuj ho sem.',
    },
    {
      slug: 'flat-bench-dumbbell-fly',
      name: 'Rozpažovanie s jednoručkami na rovnej lavičke',
      note: 'Voľná váha, keď sú obe kladky obsadené.',
    },
  ],
  progressions: [
    'Ľahké kolíky, dvojsekundové spojenie aj návrat a kotúče sa nedotýkajú.',
    'Záťaž pridaj, keď trup zostáva pokojný a uhol lakťov stály.',
    'Ak chceš na konci väčšie stiahnutie, ruky mierne prekríž. Poznač si „kríž“ alebo „stretnutie“.',
    'Ak chceš rovnakú izoláciu bez kontroly postoja, použi peck-deck.',
  ],
  programming:
    'Zaraď ako izoláciu po tlaku. Vykonaj 2–4 série po 10–15 opakovaní. Zapisuj kolík na jednom zásobníku, nie súčet oboch, a drž nastavenie rovnaké, aby graf niečo znamenal. Rozpažovanie zhora nadol aj zdola nahor patria k samostatným cvikom, hoci stanica vyzerá rovnako. Ak „vysoká“ kladka v posilňovni nie je skutočne vysoko, poznač si otvor. Odhadované 1RM v LIFTAG tu nepotrebuješ. Nechaj bežať časovač odpočinku. Ponáhľanie sa z kríženia urobí iba skracovačku v stoji.',
  equipmentAlternatives: [
    {
      slug: 'pec-deck-flys',
      name: 'Rozpažovanie na peck-decku',
      note: 'Keď sú oba kladkové stĺpy obsadené alebo chceš oporu chrbta.',
    },
    {
      slug: 'flat-bench-dumbbell-fly',
      name: 'Rozpažovanie s jednoručkami na rovnej lavičke',
      note: 'Voľná váha, keď nemáš k dispozícii kladkovú stanicu.',
    },
  ],
  faqs: [
    {
      question: 'Majú sa ruky prekrížiť alebo iba stretnúť?',
      answer:
        'Stretnutie stačí. Mierne prekríženie môže na konci pridať stiahnutie, ak rameno zostáva pokojné. Veľké prekrižovanie s rotáciou trupu je divadlo. Vyber jednu verziu, zapíš ju do poznámky série a používaj tento cvik. Prekrížené zápästia z toho nerobia druhý cvik.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'high-to-low-cable-fly',
    'flat-bench-dumbbell-fly',
    'low-to-high-cable-fly',
  ],
} satisfies ExerciseOverlay
