import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'bodyweight-squat',
  metaDescription:
    'Drep s vlastnou hmotnosťou: postoj, hĺbka a zaznamenávanie drepov bez záťaže v LIFTAGu pred pridaním veľkej činky alebo goblet drepu.',
  steps: [
    'Postav sa do postoja, ktorý dokážeš opakovať, a špičky vytoč iba natoľko, aby ich smer nasledovali kolená. Celé chodidlo nechaj na podlahe.',
    'Spevni stred tela a začni súčasne ohýbať boky aj kolená. Sadni si medzi nohy a nenechaj hrudník spadnúť.',
    'Choď do hĺbky, ktorú zvládneš pri každom opakovaní; u väčšiny cvičiacich je to poloha, v ktorej je záhyb bedra nižšie než koleno. Potom sa postav bez padania kolien dovnútra.',
    'V hornej polohe znovu nastav dych. Ak nevieš ovládať dolnú pozíciu, použi cieľovú výšku a postupne ju zlepši; neodrážaj sa.',
  ],
  mistakes: [
    {
      title: 'Skracovanie hĺbky hneď, keď začne byť cvik ťažký',
      body: 'Drep s vlastnou hmotnosťou vo vysokom počte opakovaní sa zmení na krátke pulzy. Vyber si hĺbku a jednu sériu si natoč zboku.',
    },
    {
      title: 'Dvíhanie päty alebo padanie kolien dovnútra',
      body: 'Skráť rozsah, uprav šírku postoja a udrž pevné chodidlo. Nepridávaj záťaž pohybu, ktorý sa už teraz rozpadá.',
    },
    {
      title: 'Zaznamenávanie drepov s výskokom alebo goblet drepov sem',
      body: 'Výskok je iný identifikátor. Jednoručka na hrudi je goblet drep. Tento cvik zostáva bez záťaže v rukách.',
    },
    {
      title: 'Ponáhľanie sa pod činku skôr, než bude pohyb istý',
      body: 'Ak nedokážeš 15-krát pokojne klesnúť do hĺbky, veľká činka ťa to nenaučí. Iba zakryje chybu.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-goblet-squat',
      name: 'Goblet drep s jednoručkou',
      note: 'Pre väčšinu cvičiacich prvý drep so záťažou. Rovnaký vzpriamený pohyb, iba s váhou v rukách.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Zadný drep s veľkou činkou',
      note: 'Variant s voľnou činkou, keď vieš opakovať spevnenie aj hĺbku.',
    },
    {
      slug: 'split-squat',
      name: 'Delený drep',
      note: 'Jednonožný variant, ak pri drepe na oboch nohách stále zlyháva jedna strana.',
    },
    {
      slug: 'jump-squat',
      name: 'Drep s výskokom',
      note: 'Rovnaký začiatok, výbušné zakončenie. Zaznamenávaj ho samostatne, aby graf drepov zostal grafom drepov, nie výskokov.',
    },
  ],
  progressions: [
    'Drep na box alebo k cieľu do stále rovnakej hĺbky.',
    'Voľný drep s vlastnou hmotnosťou s trojsekundovým spúšťaním.',
    'Goblet drep, keď chceš pridať záťaž bez veľkej činky.',
    'Drep s prázdnou veľkou činkou, keď je pohyb automatický.',
  ],
  programming:
    'Nácvik drepu aj zakončenie tréningu s vysokým počtom opakovaní: 3–4 série po 8–20 opakovaní. Zaznamenávaj ho. Aj „iba vlastná hmotnosť“ má svoju históriu a vďaka nej uvidíš, že minulomesačné série po 20 opakovaní už boli ľahké. Keď vezmeš jednoručku, prejdi na goblet drep, aby graf zostal presný.',
  equipmentAlternatives: [
    {
      slug: 'dumbbell-goblet-squat',
      name: 'Goblet drep s jednoručkou',
      note: 'Bežný ďalší krok, keď už drep s vlastnou hmotnosťou nie je náročný.',
    },
    {
      slug: 'kettlebell-goblet-squat',
      name: 'Goblet drep s kettlebellom',
      note: 'Rovnaké držanie, iná pomôcka. Stále ide o samostatný identifikátor.',
    },
    {
      slug: 'wall-sit',
      name: 'Výdrž v sede pri stene',
      note: 'Izometrická práca kvadricepsov, keď dnes nemôžeš vykonať celý drep.',
    },
  ],
  faqs: [
    {
      question: 'Koľko drepov s vlastnou hmotnosťou mám urobiť pred použitím činky?',
      answer:
        'Neexistuje cieľový počet opakovaní. Keď sa pri únave opakuje hĺbka, spevnenie aj smer kolien, vezmi goblet alebo prázdnu veľkú činku. Nedbalých 50 opakovaní nie je vstupenka k drepu so záťažou.',
    },
  ],
  relatedSlugs: ['dumbbell-goblet-squat', 'barbell-back-squat', 'split-squat', 'kettlebell-goblet-squat'],
} satisfies ExerciseOverlay
