import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'flat-dumbbell-bench-press',
  metaDescription:
    'Tlaky s jednoručkami na rovnej lavičke: ako si pomôcť stehnami pri zdvihnutí činiek, kontrolovať spodnú polohu a v LIFTAGu ich zapisovať oddelene od tlakov s veľkou činkou.',
  steps: [
    'Sadni si s jednoručkami na stehnách. Pri ukladaní na lavičku si pomôž stehnami a dostaň činky do východiskovej polohy nad hrudníkom.',
    'Stiahni lopatky rovnako ako pri bench presse s veľkou činkou. Dlane smerujú dopredu alebo mierne k sebe.',
    'Spúšťaj, kým sú rukoväte približne pri hrudníku a lakte tesne pod lavičkou; neprepadaj do bolestivej polohy.',
    'Tlač nahor a mierne k sebe, aby jednoručky skončili nad hrudníkom, nie nad tvárou. Pri citlivých lakťoch ich nevystieraj prudko.',
  ],
  mistakes: [
    {
      title: 'Spúšťanie posledných centimetrov bez kontroly',
      body: 'Práve dodatočný rozsah je dôvodom tohto cviku. Spodnú polohu ovládaj alebo zmenši pokles.',
    },
    {
      title: 'Búchanie jednoručiek hore',
      body: 'Buchnutie nie je vystretie, iba metronóm. Skonči nad hrudníkom bez tlesknutia.',
    },
    {
      title: 'Zapisovanie ľavej a pravej strany ako dvoch cvikov',
      body: 'Stále ide o jeden cvik. Ak jedna strana zlyhá skôr, uveď to v poznámke a progresiu nerozdeľuj.',
    },
  ],
  variations: [
    {
      slug: 'incline-dumbbell-press',
      name: 'Tlak s jednoručkami na šikmej lavičke',
      note: 'Viac zapája hornú časť hrudníka a predné delty.',
    },
    {
      slug: 'barbell-bench-press',
      name: 'Tlak s veľkou činkou na lavičke',
      note: 'Vyššia záťaž, menší rozsah pohybu.',
    },
    {
      slug: 'dumbbell-floor-press',
      name: 'Tlak s jednoručkami na podlahe',
      note: 'Kratší rozsah, keď ramenu nevyhovuje natiahnutie v spodnej polohe.',
    },
  ],
  progressions: [
    'Kliky, potom ľahké jednoručky, ktoré bezpečne dostaneš k ramenám.',
    'Najprv zvládni plný rozsah v sériách po 8–12, až potom naháňaj ťažké trojky.',
    'Záťaž pridaj, keď obe strany dokončia sériu spolu.',
  ],
  programming:
    'Tlak s jednoručkami je vhodnejší na hypertrofiu než na test 1RM. Rob 3–4 série po 6–12 opakovaní. Zapisuj hmotnosť jednej jednoručky, nie súčet páru, a každý týždeň používaj rovnaké pravidlo, aby graf LIFTAGu niečo znamenal.',
  relatedSlugs: ['barbell-bench-press', 'incline-dumbbell-press', 'flat-bench-dumbbell-fly'],
  faqs: [],
} satisfies ExerciseOverlay
