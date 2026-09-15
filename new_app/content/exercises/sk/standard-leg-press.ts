import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standard-leg-press',
  metaDescription:
    'Štandardný leg press: poloha chodidiel, hĺbka a zaznamenávanie objemu strojového drepu v LIFTAG.',
  steps: [
    'Sadni si tak, aby bol driek pevne pritlačený k podložke. Chodidlá na začiatok umiestni približne na šírku ramien do stredu platformy.',
    'Odisti sane a spúšťaj ich, kým sú stehná aspoň rovnobežne s platformou — tak hlboko, ako boky dovolia bez podsadenia panvy.',
    'Tlač cez celé chodidlo. Vystieraj bez úderu do dorazov a bez odrazu zo spodnej polohy.',
  ],
  mistakes: [
    {
      title: 'V dolnej polohe necháš panvu zrolovať',
      body: 'Ide o ohnutie driekovej chrbtice pod záťažou. Skráť rozsah alebo zdvihni chodidlá vyššie.',
    },
    {
      title: 'Krátky rozsah s obrovskou kopou závaží',
      body: 'Záznam tým neoklameš. LIFTAG uloží záťaž, no kolená si uložia tento návyk.',
    },
  ],
  variations: [
    {
      slug: 'wide-stance-leg-press',
      name: 'Leg press so širokým postojom',
      note: 'Väčší dôraz na boky a iná dráha pohybu.',
    },
    {
      slug: 'single-leg-press',
      name: 'Leg press jednou nohou',
      note: 'Pomáha vyrovnať rozdiely medzi stranami.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Zodpovedajúca verzia s voľnou váhou.',
    },
  ],
  progressions: [
    'Ľahké leg pressy v celom rozsahu.',
    'Záťaž pridaj, keď panva zostáva na podložke.',
    'Prejdi na jednu nohu, keď jedna strana vždy povolí ako prvá.',
  ],
  programming:
    'Objem pre kvadricepsy a sedacie svaly, ktorý zvládneš aj unavený. Vykonaj 3–5 sérií po 8–15 opakovaní. Naskenuj skutočný stroj — hacken drep a leg press nie sú v LIFTAG rovnaké cviky.',
  relatedSlugs: ['machine-hack-squat', 'barbell-back-squat', 'machine-leg-extension'],
} satisfies ExerciseOverlay
