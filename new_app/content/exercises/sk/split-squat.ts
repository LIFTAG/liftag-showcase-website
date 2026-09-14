import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'split-squat',
  metaDescription:
    'Drep v rozkročnom stoji: dĺžka postoja, dráha kolena a samostatné zaznamenávanie výpadov na mieste oproti chôdzovým výpadom a bulharským drepom v LIFTAG.',
  steps: [
    'Zaujmi rozkročený postoj: predné chodidlo celé na podlahe, zadné na špičke. Boky drž kolmo. Počas série polohu chodidiel nemeníš.',
    'Spevni trup a klesaj prevažne priamo nadol. Predné predkolenie zostáva približne zvislé a zadné koleno smeruje k podlahe.',
    'Vytlač sa cez predné chodidlo do stoja. Trup drž nad sebou — mierny predklon je v poriadku, rotácia nie.',
    'Dokonči sériu a potom vymeň nohy. Medzi opakovaniami z toho nerob chôdzový výpad.',
  ],
  mistakes: [
    {
      title: 'Postoj je príliš krátky',
      body: 'Predná päta sa dvíha a koleno prudko putuje dopredu. Predĺž postoj, kým dokážeš klesnúť medzi chodidlá bez straty rovnováhy.',
    },
    {
      title: 'Zadnú nohu dvíhaš a cvik stále voláš split squat',
      body: 'To je bulharský drep s jednoručkami. Má iný rozsah aj vlastný záznam.',
    },
    {
      title: 'Pri každom opakovaní posúvaš chodidlá',
      body: 'Ak vykračuješ, robíš výpad. Chodidlo polož, klesni a postav sa. Zostáva tam, kam si ho umiestnil.',
    },
    {
      title: 'Obe nohy zapisuješ ako chôdzový výpad',
      body: 'Drep v rozkročnom stoji, chôdzový výpad a bulharský drep sú tri samostatné rekordy. V LIFTAG tento cvik zapisuj presne.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-bulgarian-split-squat',
      name: 'Bulharský drep s jednoručkami',
      note: 'Zadná noha je vyvýšená, rozsah väčší a flexor bedra zadnej nohy dostáva väčšiu záťaž.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Verzia s vykračovaním, keď chceš chôdzový vzor, nie pevný postoj.',
    },
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Zaťažený výpad, zvyčajne vpred alebo vzad, nie nehybný rozkročný postoj.',
    },
    {
      slug: 'smith-machine-split-squat',
      name: 'Drep v rozkročnom stoji na Smithovom stroji',
      note: 'Pevná dráha, keď rovnováha a nie nohy predstavujú limit.',
    },
  ],
  progressions: [
    'Drep s vlastnou hmotnosťou do rovnakej hĺbky zadného kolena.',
    'Keď sa postoj prestane kývať, pridaj goblet alebo jednoručky.',
    'Ak sa začneš odrážať zo spodnej polohy, v nej na chvíľu zastav.',
    'Na väčší rozsah prednej nohy prejdi na vyvýšenú zadnú nohu, teda bulharský drep.',
  ],
  programming:
    'Doplnkový cvik: po hlavnom drepe urob 3–4 série po 6–12 opakovaní na každú nohu. Každú stranu zaznamenaj. Ak druhá strana vždy zlyháva, odpočívaj aj medzi nohami. Vlastná hmotnosť je platná záťaž — sériu nevynechaj len preto, že máš prázdne ruky.',
  equipmentAlternatives: [
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Zachováš jednostrannú prácu, keď chceš vykračovať namiesto pevného postoja.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Potrebuješ priestor na chôdzu, nie lavičku. Stále ide o vzor v rozkročnom stoji.',
    },
    {
      slug: 'barbell-lunge',
      name: 'Výpad s veľkou činkou',
      note: 'Činka na chrbte, keď už jednoručky nie sú dosť ťažké.',
    },
  ],
  faqs: [
    {
      question: 'Drep v rozkročnom stoji alebo výpad?',
      answer:
        'Pri drepe v rozkročnom stoji zostávajú chodidlá počas celej série na mieste. Výpad zahŕňa vykročenie. Ak chodidlá pri každom opakovaní nastavuješ nanovo, zapíš výpad, ktorý si skutočne urobil — chôdzový, vzad alebo s veľkou činkou — nie tento cvik.',
    },
  ],
  relatedSlugs: [
    'dumbbell-bulgarian-split-squat',
    'barbell-bulgarian-split-squat',
    'walking-lunge',
    'dumbbell-lunge',
    'barbell-lunge',
  ],
} satisfies ExerciseOverlay
