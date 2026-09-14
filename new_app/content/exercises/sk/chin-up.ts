import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'chin-up',
  metaDescription:
    'Zhyb podhmatom: úchop dlaňami k sebe, úplný vis a samostatné zaznamenávanie zhybov podhmatom a nadhmatom v LIFTAGu.',
  steps: [
    'Zaves sa podhmatom s rukami približne na šírku ramien. Začni z nehybného visu.',
    'Ťahaj sa, kým nebude brada jasne nad hrazdou a lakte nestiahneš pri rebrách.',
    'Spusť sa do úplného visu. Spodnú polohu nevynechávaj iba preto, že bicepsy už pália.',
  ],
  mistakes: [
    {
      title: 'Zaznamenávanie zhybov podhmatom ako zhybov nadhmatom',
      body: 'Podhmat a nadhmat znamenajú iný cvik aj iný osobný rekord. Použi tento identifikátor.',
    },
    {
      title: 'Skracovanie visu',
      body: 'Predĺžená poloha bicepsov a širokých chrbtových svalov je súčasť práce. Vydrž v celom vise.',
    },
  ],
  variations: [
    { slug: 'pull-up', name: 'Zhyb nadhmatom', note: 'Variant s dlaňami smerujúcimi od teba.' },
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie hornej kladky',
      note: 'Varianta na stroji, keď zatiaľ nedokážeš zhyb podhmatom.',
    },
    {
      slug: 'barbell-curl',
      name: 'Bicepsový zdvih s veľkou činkou',
      note: 'Priama práca bicepsov, ak zhyb obmedzuje úchop alebo chrbát.',
    },
  ],
  progressions: [
    'Asistované zhyby podhmatom alebo sťahovanie kladky podhmatom.',
    'Striktné zhyby podhmatom.',
    'Zhyby podhmatom s pridanou záťažou, ktorú zaznamenáš samostatne.',
  ],
  programming:
    'Použi ho ako hlavný zvislý ťah alebo ako variant s väčším dôrazom na bicepsy popri zhyboch nadhmatom. Nerob oba varianty ťažko v jeden deň, pokiaľ máš skutočne dostatočnú regeneráciu; graf frekvencie v LIFTAGu ukáže, ak ich stále vrstvíš.',
  relatedSlugs: ['pull-up', 'lat-pulldown', 'barbell-curl'],
} satisfies ExerciseOverlay
