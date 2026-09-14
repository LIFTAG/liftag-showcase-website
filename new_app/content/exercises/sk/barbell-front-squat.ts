import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-front-squat',
  metaDescription:
    'Predný drep s veľkou činkou: poloha činky, výška lakťov a samostatné zaznamenávanie oproti zadnému drepu v LIFTAGu.',
  steps: [
    'Ulož činku na predné ramená. Vyber si úchop ako pri premiestnení alebo prekrížený úchop podľa toho, pri ktorom dokážeš udržať lakte vysoko.',
    'Odstúp zo stojana, spevni stred tela a klesaj medzi nohy s vystretým trupom.',
    'Dosiahni rovnakú hĺbku a potom sa postav bez toho, aby lakte klesli a činka sa zošmykla.',
  ],
  mistakes: [
    {
      title: 'Lakte klesajú v spodnej polohe',
      body: 'Činka sa skotúľa a séria končí. Práca hornej časti chrbta a o niečo užší úchop to zvyčajne vyriešia rýchlejšie než snaha tlačiť silou.',
    },
    {
      title: 'Premena predného drepu na zadný drep s činkou vpredu',
      body: 'Ak sa príliš predkláňaš, zníž záťaž. Predný drep je vzpriamený pohyb.',
    },
  ],
  variations: [
    {
      slug: 'barbell-back-squat',
      name: 'Zadný drep s veľkou činkou',
      note: 'Väčšia záťaž a väčšie zapojenie zadného reťazca.',
    },
    {
      slug: 'dumbbell-goblet-squat',
      name: 'Goblet drep s jednoručkou',
      note: 'Nácvik rovnakej polohy trupu.',
    },
  ],
  progressions: [
    'Goblet drep.',
    'Výdrže v prednom drepe s prázdnou tyčou v stojane.',
    'Pracovné série, keď je poloha činky úplne stabilná.',
  ],
  programming:
    'Výborný druhý drepový deň alebo hlavný drep pri olympijskom vzpieraní. Záťaž bude výrazne nižšia než pri zadnom drepe, čo je očakávané. Na tomto identifikátore nesleduj čísla zadného drepu.',
  relatedSlugs: ['barbell-back-squat', 'dumbbell-goblet-squat', 'barbell-zercher-squat'],
} satisfies ExerciseOverlay
