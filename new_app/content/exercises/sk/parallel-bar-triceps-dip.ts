import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'parallel-bar-triceps-dip',
  metaDescription:
    'Tricepsové dipy na bradlách: vzpriamený trup, hĺbka a samostatné zaznamenávanie oproti dipom na hrudník a stroji v LIFTAG.',
  steps: [
    'Uchop bradlá, vytlač sa do vystretých lakťov a drž trup relatívne vzpriamený. Špičky môžu smerovať nadol, no neprechádzaj do predklonu typického pre dip na hrudník.',
    'Stiahni ramená nadol a mierne dozadu. Ide o oporu, nie o zavesenie s ramenami pri ušiach.',
    'Pokrč lakte a klesaj, kým ramená nebudú vo výške lakťov alebo tesne pod ňou — iba tak hlboko, ako zostane predná časť ramena pokojná.',
    'Vytlač sa do úplného vystretia bez švihu nohami pri posledných troch opakovaniach. Hore nezaklapni lakte úderom.',
  ],
  mistakes: [
    {
      title: 'Nakloníš sa do dipu na hrudník a zapisuješ ho sem',
      body: 'Predklon patrí k dipu na hrudník. Vzpriamený trup a lakte smerujúce dozadu predstavujú tricepsovú verziu. Vyber správny cvik a prispôsob mu trup.',
    },
    {
      title: 'Spustíš sa do príliš hlbokej spodnej polohy',
      body: 'Hĺbka bez stiahnutých ramien je cesta k problémom s ramenom. Ovládaj radšej kratší rozsah než hlučný pohyb.',
    },
    {
      title: 'Posledné opakovania vykipuješ nohami',
      body: 'Ak ťa z dolnej polohy musia vymrštiť boky, séria sa skončila. Ukonči ju alebo prejdi na asistované dipy.',
    },
    {
      title: 'Nezaznamenáš opasok s prídavnou záťažou',
      body: 'Rekordy s vlastnou hmotnosťou a so záťažou sú odlišné. Keď si nasadíš opasok, zapíš pridané kilogramy, inak sa graf nepohne správne.',
    },
  ],
  variations: [
    {
      slug: 'chest-dips',
      name: 'Dipy na hrudník',
      note: 'Rovnaké bradlá, predklon a väčší dôraz na prsné svaly.',
    },
    {
      slug: 'machine-dip',
      name: 'Dipy na stroji',
      note: 'Vedená dráha v sede, keď bradlá dráždia ramená alebo chceš použiť záťažový blok.',
    },
    {
      slug: 'assisted-dip',
      name: 'Asistované dipy',
      note: 'Protizávažie, kým nebude celý rozsah s vlastnou hmotnosťou čistý.',
    },
    {
      slug: 'bench-triceps-dip',
      name: 'Tricepsové dipy o lavičku',
      note: 'Domáca náhrada s oveľa prívetivejším (a ľahším) rozsahom.',
    },
  ],
  progressions: [
    'Asistované dipy alebo dipy na stroji, kým je výdrž vo vzpore v celom rozsahu ľahká.',
    'Série s vlastnou hmotnosťou po 6–10 opakovaní so vzpriameným trupom.',
    'Pred pridaním opasku na chvíľu zastav tesne nad spodnou polohou.',
    'Zaťažovanie opaskom zapisuj ako pridanú hmotnosť pri tomto cviku.',
  ],
  programming:
    'Zaťažené tricepsové dipy ber ako tlak: 3–4 náročné série. Ak už v tréningu robíš dipy na hrudník, táto verzia je zvyčajne ľahší druhý blok alebo patrí na iný deň — ramená nezaujíma, že si predklon pomenoval inak. Odpočívaj ako pri úzkom bench presse; časovač v LIFTAG ti pomôže neponáhľať sa pri vystieraní.',
  faqs: [
    {
      question: 'Ako hlboko mám ísť pri tricepsových dipov?',
      answer:
        'Približne po rovnobežku nadlaktia s podlahou alebo mierne nižšie, pokiaľ je predná časť ramena stabilná. Väčšia hĺbka nie je lepšia, ak sa rameno pretáča dopredu. Hĺbka dipu na hrudník s predklonom je iný cvik.',
    },
  ],
  relatedSlugs: ['chest-dips', 'close-grip-bench-press', 'machine-dip', 'push-up'],
} satisfies ExerciseOverlay
