import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'flat-bench-dumbbell-fly',
  metaDescription:
    'Rozpažovanie s jednoručkami na rovnej lavičke: pevný uhol lakťov, kontrolované natiahnutie a zapisovanie izolácie hrudníka bez miešania pec decku či tlaku s jednoručkami v LIFTAGu.',
  steps: [
    'Ľahni si na rovnú lavičku, chodidlá zapri a jednoručky drž nad hrudníkom dlaňami oproti sebe. Vyzdvihni ich rovnako ako pri tlaku s jednoručkami.',
    'Lakte nechaj mierne a takmer pevne pokrčené. Otváraj paže do širokého oblúka, kým cítiš natiahnutie hrudníka, nie preťaženie ramien.',
    'Zastav, keď sú nadlaktia približne v línii trupu. Lakte hlboko pod úrovňou lavičky sú spôsob, ako si podráždiť prednú časť ramena.',
    'Vráť jednoručky nad hrudník bez nárazu. Oblúk iba jemne uzavri, netlač ich hore ako pri tlaku.',
    'Ak sa posledné opakovania zmenia na tlak s úzkym úchopom, pár je príliš ťažký. Zníž jednoručky a zachovaj rozpažovanie.',
  ],
  mistakes: [
    {
      title: 'Premena na tlak',
      body: 'Ak sa lakte ohýbajú a vystierajú ako pri benchi, zvolil si nesprávny vzor. Lakte drž mäkké a takmer pevné. Tlak patrí pod flat dumbbell bench press.',
    },
    {
      title: 'Spúšťanie lakťov pod lavičku',
      body: 'Ďalší rozsah nie je zadarmo. Natiahnutie kontroluj, inak ho pocítiš v ramene namiesto v prsnom svale. Ľahšie jednoručky sú lepšie než príliš hlboké spustenie.',
    },
    {
      title: 'Narážanie jednoručiek hore',
      body: 'Toto tlesknutie je metronóm, nie stiahnutie hrudníka. Dokonči pohyb nad hrudníkom s malou tichou medzerou.',
    },
    {
      title: 'Zapisovanie ako tlak s jednoručkami',
      body: 'Je to iný pohyb aj iný rekord. Zachovaj tento cvik. Pec deck a cable crossover majú vlastné grafy; izoláciu nemiešaj do záznamu tlaku.',
    },
  ],
  variations: [
    {
      slug: 'pec-deck-flys',
      name: 'Pec deck flys',
      note: 'Strojová verzia s menšími nárokmi na stabilizáciu a ľahším poctivým dávkovaním záťaže.',
    },
    {
      slug: 'standing-cable-crossover',
      name: 'Standing cable crossover',
      note: 'Kladky držia napätie aj v natiahnutí a umožnia voľnejšie zvoliť dráhu.',
    },
    {
      slug: 'incline-dumbbell-fly',
      name: 'Incline dumbbell fly',
      note: 'Rovnaká izolácia na šikmej lavičke. Samostatný cvik a vlastný graf.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Flat dumbbell bench press',
      note: 'Tlak, za ktorým toto rozpažovanie zvyčajne nasleduje. Nenahrádzaj ním hlavný tlak.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, ktoré dokážeš vyzdvihnúť a otvoriť bez klesania lakťov.',
    'Dve sekundy spúšťaj, v natiahnutí zastav a potom paže spoj.',
    'Pridaj záťaž, keď aj pri dvanástom opakovaní stále vyzerá pohyb ako fly.',
    'Pec deck alebo kladky, ak rameno zle znáša natiahnutie s voľnou váhou.',
  ],
  programming:
    'Izoláciu zaraď po tlaku, nie namiesto neho. Rob 2–4 série po 10–15 opakovaní. Zapisuj hmotnosť jednej jednoručky, nie súčet páru, a zachovaj ju konzistentnú. Incline fly, pec deck a crossover majú vlastné grafy. Ak je cieľom pauza v natiahnutí, uveď to v poznámke. Odhadované 1RM v LIFTAGu tu nepotrebuješ. Nechaj bežať časovač odpočinku; rýchle rozpažovanie sa zmení na neupravený tlak.',
  equipmentAlternatives: [
    {
      slug: 'pec-deck-flys',
      name: 'Pec deck flys',
      note: 'Predvolená náhrada, keď natiahnutie s jednoručkami dráždi rameno alebo trénuješ sám s ťažkým párom.',
    },
    {
      slug: 'standing-cable-crossover',
      name: 'Standing cable crossover',
      note: 'Keď chceš napätie v spodnej polohe a možnosť zvoliť vlastnú dráhu.',
    },
  ],
  faqs: [
    {
      question: 'Ako nízko mám jednoručky spúšťať?',
      answer:
        'Kým cítiš natiahnutie hrudníka a nadlaktia sú približne v úrovni trupu. Lakte smerujúce k podlahe neznamenajú viac hrudníka, ale viac ramena. Ak určitú hĺbku zvládneš iba s veľmi ľahkým párom, práve ten je vhodná záťaž. Zapíš ho a nevymýšľaj rozsah, ktorý nedokážeš kontrolovať.',
    },
  ],
  relatedSlugs: [
    'pec-deck-flys',
    'flat-dumbbell-bench-press',
    'standing-cable-crossover',
    'incline-dumbbell-fly',
  ],
} satisfies ExerciseOverlay
