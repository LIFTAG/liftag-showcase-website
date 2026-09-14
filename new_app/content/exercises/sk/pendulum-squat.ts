import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pendulum-squat',
  metaDescription:
    'Pendulum drep: nastavenie plošiny, oblúková dráha a samostatné zaznamenávanie drepov na pákovom stroji oproti hacken drepom v LIFTAG-u.',
  steps: [
    'Ramená vlož pod podložky a chodidlá polož na plošinu tak, aby oblúková dráha dovolila udržať tlak cez celé chodidlo.',
    'Odisti stroj, spevni stred tela a klesaj po jeho dráhe. Pendulum vyžaduje vzpriamenejší trup než zadný drep.',
    'Klesaj do hĺbky, ktorú by si pri drepe počítal, bez odlepovania krížov od podložky.',
    'Tlač cez stred chodidla. Rukami znovu zaisti stroj na doraze, nie nekontrolovaným uzamknutím.',
  ],
  mistakes: [
    {
      title: 'Chodidlá príliš vysoko, až sa cvik zmení na tlak sedacími svalmi',
      body: 'To je v poriadku, ak je to cieľ. Ak chceš drep, posuň chodidlá nižšie, aby kolená mohli cestovať dopredu.',
    },
    {
      title: 'Zaznamenávanie ako hacken drep',
      body: 'Iný stroj, iný oblúk a iný osobný rekord. Štítok na Pendulum stroji má otvoriť tento identifikátor.',
    },
    {
      title: 'Odraz páky v dolnej polohe',
      body: 'Pendulum ukladá energiu. Náraz a odraz nie sú séria pre kvadricepsy. Zastav alebo kontroluj poslednú tretinu pohybu.',
    },
    {
      title: 'Jazda po špičkách',
      body: 'Ak sa dvíhajú päty, poloha chodidiel nezodpovedá oblúku. Uprav postoj a nekrč ramená v snahe ďalej nakladať.',
    },
  ],
  variations: [
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Lineárna dráha, ak fitko nemá Pendulum stroj.',
    },
    {
      slug: 'smith-machine-squat',
      name: 'Drep na Smithovom stroji',
      note: 'Drep s vedenou činkou, keď chceš koľajnicu, nie páku.',
    },
    {
      slug: 'standard-leg-press',
      name: 'Klasický leg press',
      note: 'Leg press na saniach a stále strojový objem pre kvadricepsy.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Zadný drep s veľkou činkou',
      note: 'Variant s voľnou záťažou a rovnakým pohybovým vzorcom.',
    },
  ],
  progressions: [
    'Ľahký Pendulum drep do úplnej a pokojnej dolnej polohy.',
    'Záťaž pridaj, keď chrbát zostáva pri každom opakovaní na podložke.',
    'Pauzované opakovania, ak využívaš odraz páky.',
    'Užší postoj alebo pomalšie spúšťanie, keď je pohyb automatický.',
  ],
  programming:
    'Hlavný alebo druhý drep s dôrazom na kvadricepsy: 3–4 série po 6–12 opakovaní. Pri rovnakej námahe býva pre chrbát príjemnejší než drep s činkou, no aj tak ho zaznamenávaj tu. Ak v rovnakom mezocykle striedaš Pendulum a hacken drep, sú to dva cviky, nie jeden riadok „strojového drepu“.',
  equipmentAlternatives: [
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Základná náhrada vo fitkách, ktoré Pendulum stroj nemajú.',
    },
    { slug: 'belt-squat', name: 'Belt squat', note: 'Úplne odľahčí ramená, ak je problémom tlak podložiek.' },
  ],
  relatedSlugs: ['machine-hack-squat', 'standard-leg-press', 'barbell-back-squat', 'smith-machine-squat'],
} satisfies ExerciseOverlay
