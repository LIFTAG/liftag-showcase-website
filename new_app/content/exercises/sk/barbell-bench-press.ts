import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bench-press',
  metaDescription:
    'Bench press s veľkou činkou: nastavenie, časté chyby, variácie a zaznamenávanie každej série v LIFTAG. Hrudník, triceps a ramená na rovnej lavičke.',
  steps: [
    'Ľahni si na rovnú lavičku s očami pod osou, chodidlami pevne na zemi a hlavou, hornou časťou chrbta aj zadkom opretými o lavičku.',
    'Uchop os rovnomerne nadhmatom tak, aby palec obopínal os, stiahni lopatky dozadu a nadol a pri ťažkej váhe ju vyber zo stojana so sparingpartnerom.',
    'Kontrolovane spúšťaj os k strednej až spodnej časti hrudníka. Zápästia drž nad predlaktiami. Dotkni sa hrudníka bez odrazu.',
    'Vytlač ju nahor a mierne dozadu do stabilného vystretia. Pred ďalším opakovaním znovu nastav lopatky.',
    'Nastav bezpečnostné dorazy, použi objímky a zvoľ šírku úchopu, pri ktorej sú ramená v pohodlí.',
  ],
  mistakes: [
    {
      title: 'Odraz od hrudníka',
      body: 'Odraz skryje spodnú časť pohybu a prenesie záťaž do ramien. Zastav alebo aspoň udrž kontrolu pri dotyku.',
    },
    {
      title: 'Lakte vytáčaš do pravého uhla',
      body: 'Mierne ich pritiahni, aby boli predlaktia v spodnej pozícii zvislé. Široké lakte a vysoký dotyk často dráždia rameno.',
    },
    {
      title: 'Strácaš oporu v hornej časti chrbta',
      body: 'Keď sa lopatky posunú dopredu, dráha činky sa predĺži a ramená preberú záťaž. Ak treba, medzi opakovaniami sa znovu nastav.',
    },
    {
      title: 'Zapisuješ rozcvičku ako pracovné série',
      body: 'Rekordy a odhadované 1RM v LIFTAG vychádzajú zo zapísaných sérií. Rozcvičovacie trojky nechaj mimo pracovného riadku, ak ich program nepočíta.',
    },
  ],
  variations: [
    {
      slug: 'barbell-incline-bench-press',
      name: 'Šikmý bench press s veľkou činkou',
      note: 'Rovnaký vzor, väčší dôraz na hornú časť prsného svalu a predné ramená.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press úzkym úchopom',
      note: 'Užší úchop a viac tricepsu, stále dobre zaťažiteľný tlak.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Bench press s jednoručkami',
      note: 'Nezávislé rukoväte, väčší rozsah a pre niektoré ramená príjemnejší pohyb.',
    },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na prsia na stroji',
      note: 'Vedená dráha, keď chceš objem tlakov bez sparingpartnera.',
    },
  ],
  progressions: [
    'Kliky alebo tlak na stroji, kým zvládneš kontrolovaný celý rozsah.',
    'Bench press s prázdnou osou a pauzou na hrudníku.',
    'Pracovné série na opakovateľnom RPE 7–8; pridaj váhu alebo opakovanie, keď všetky série zostanú čisté.',
    'Pauzované alebo úzke variácie, keď sa zastaví vystretie alebo pohyb bez pauzy.',
  ],
  programming:
    'Väčšine cvičiacich vyhovujú tri až päť pracovných sérií po tri až osem opakovaní v hlavný bench deň. V LIFTAG zapisuj každú pracovnú sériu aj čas odpočinku; práve ten odlíši skutočnú ťažkú trojku od uponáhľanej. Keď rýchlosť činky klesá, najprv naháňaj rekord v opakovaniach a až potom váhu. Odhadované 1RM v aplikácii je trend, nie súťažný pokus.',
  equipmentAlternatives: [
    {
      slug: 'smith-machine-flat-bench-press',
      name: 'Rovný bench press na Smithovom stroji',
      note: 'Použi, keď vo fitku nie je voľná lavička alebo cvičíš sám.',
    },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na prsia na stroji',
      note: 'Vymeň ho, ak veľká činka dráždi ramená, no chceš zachovať objem tlakov.',
    },
    {
      slug: 'push-up',
      name: 'Klik',
      note: 'Nemáš lavičku? Nevadí. Zapisuj ho ako samostatný cvik, aby bol progres poctivý.',
    },
  ],
  faqs: [
    {
      question: 'Je bench press s veľkou činkou najlepší cvik na hrudník?',
      answer:
        'Pre väčšinu cvičiacich je to najľahšie zaťažiteľný horizontálny tlak, nie povinný cvik na hrudník. Ak ramenám veľká činka nesedí, hrudník vybudujú aj tlaky s jednoručkami alebo na stroji a rozpažovania. LIFTAG bude sledovať cvik, ktorý skutočne cvičíš.',
    },
    {
      question: 'Ako mám zapisovať pauzovaný bench press oproti opakovaniam bez pauzy?',
      answer:
        'Ak pauzu používaš len občas, veď ich ako jeden cvik. Ak je pauzovaný bench naprogramovanou variáciou, nechaj ho pri tomto cviku a do poznámky série napíš „pauza“, aby si budúci týždeň vedel, čo si cvičil.',
    },
  ],
  relatedSlugs: [
    'barbell-incline-bench-press',
    'close-grip-bench-press',
    'flat-dumbbell-bench-press',
    'machine-chest-press',
    'push-up',
  ],
} satisfies ExerciseOverlay
