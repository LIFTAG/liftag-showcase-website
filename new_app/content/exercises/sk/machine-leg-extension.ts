import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-leg-extension',
  metaDescription:
    'Predkopávanie na stroji: nastavenie osi pri kolene, rozsah pohybu a zaznamenávanie izolácie kvadricepsov v LIFTAG bez zámeny za drep.',
  steps: [
    'Zarovnaj koleno s otočným bodom vačky stroja. Polstrovanie má byť na dolnej časti predkolenia, nie v strede chodidla.',
    'Sadni si tak, aby boky zostali na sedadle a chrbát bol opretý o podložku. Uchop držadlá.',
    'Vystieraj kolená až do vystretia bez kopnutia do závaží a bez hyperextenzie.',
    'Spúšťaj záťaž pod kontrolou do natiahnutia, ktoré vieš udržať — zastav skôr, než kotúče narazia.',
  ],
  mistakes: [
    {
      title: 'Otočný bod nie je pri kolene',
      body: 'Ak je vačka za kĺbom alebo pred ním, každé opakovanie zbytočne strihá v kolene. Posuň sedadlo, kým sa osi nezarovnajú.',
    },
    {
      title: 'Vyhadzovanie záťaže švihom',
      body: 'Kopnutie schová náročnú časť rozsahu. Spomaľ posledných 30° alebo uber kolík.',
    },
    {
      title: 'Krátky rozsah s obrovskou kopou závaží',
      body: 'LIFTAG záťaž uloží. Tvoje kolená si však uložia tento návyk. Ovládaj natiahnutie aj vystretie.',
    },
    {
      title: 'Zapisuješ predkopávanie ako objem drepov',
      body: 'Toto je izolácia. Hacken drep, leg press a tento cvik majú tri samostatné grafy. Tak to aj nechaj.',
    },
  ],
  variations: [
    {
      slug: 'standard-leg-press',
      name: 'Štandardný leg press',
      note: 'Komplexný objem pre kvadricepsy, keď stále chceš používať stroj.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Drep na saniach, ak potrebuješ viac než len kopanie predkolením.',
    },
    {
      slug: 'barbell-front-squat',
      name: 'Predný drep s veľkou činkou',
      note: 'Vztýčený drep s voľnou váhou, ktorý kvadricepsy poriadne zaťaží.',
    },
  ],
  progressions: [
    'Ľahké predkopávanie v celom rozsahu s kolenom zarovno s vačkou.',
    'V hornej polohe na chvíľu zastav bez hyperextenzie.',
    'Prejdi na jednu nohu, keď jedna strana vždy povolí ako prvá.',
    'Keď je nastavenie sedadla rovnaké na každom tréningu, pridaj väčšiu záťaž v sériách po 8–12.',
  ],
  programming:
    'Ber ho ako záver tréningu, nie náhradu drepu: 2–4 série po 8–15 opakovaní. Naskenuj skutočný stroj — štítok má otvoriť tento cvik. Ak kolená protestujú, mierne skráť spodnú časť rozsahu a spomaľ hornú fázu, namiesto pridávania kotúčov k odrazom v vystretí.',
  equipmentAlternatives: [
    {
      slug: 'standard-leg-press',
      name: 'Štandardný leg press',
      note: 'Zachováš prácu kvadricepsov, keď sa pri predkopávaní čaká v rade.',
    },
    {
      slug: 'pendulum-squat',
      name: 'Kyvadlový drep',
      note: 'Vedený komplexný cvik, ak chceš záťaž bez izolovaného kopania.',
    },
  ],
  faqs: [
    {
      question: 'Škodí predkopávanie kolenám?',
      answer:
        'Ide o izolovaný cvik s dlhou pákou. Zarovnaj otočný bod, zvoľ rozsah, ktorý ovládaš, a neodrážaj záťaž. Ak konkrétny stroj vždy bolí, vymeň ho za hacken drep alebo leg press a zaznamenaj skutočne vykonaný cvik.',
    },
  ],
  relatedSlugs: ['standard-leg-press', 'machine-hack-squat', 'barbell-front-squat', 'pendulum-squat'],
} satisfies ExerciseOverlay
