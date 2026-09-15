import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-decline-bench-press',
  metaDescription:
    'Tlak s veľkou činkou na klesajúcej lavičke: uhol lavičky, miesto dotyku a samostatné zapisovanie od rovného tlaku v LIFTAGu.',
  steps: [
    'Zaisti nohy a nastav mierny sklon, zvyčajne 15–30°. Oči maj mierne za osou v stojane. Aj tu je dôležitý sparingpartner.',
    'Uchop os rovnomerne, stiahni hornú časť chrbta a odober ju. Spúšťaj na spodnú časť hrudníka alebo líniu hrudnej kosti, nie na rovnaké miesto ako pri rovnej lavičke.',
    'Vytlač činku do stabilného vystretia so zápästiami nad lakťami. Nenechaj ju putovať k tvári — sklon ju už prirodzene vedie tým smerom.',
    'Činku vráť do hákov pod kontrolou. Ak je odoberanie alebo odkladanie neisté, potrebuješ sparingpartnera alebo iný tlak.',
  ],
  mistakes: [
    {
      title: 'Príliš strmý sklon, ktorý z tlaku robí takmer dip',
      body: 'Strmá lavička presunie prácu z hrudníka a zhorší odoberanie. Ak chceš stále tlak, sklon zmenši.',
    },
    {
      title: 'Zapisovanie PR zo sklonu k rovnému tlaku',
      body: 'Rozsah je kratší a uhol iný. Použi tento cvik, inak budú oba grafy nepresné.',
    },
    {
      title: 'Odoberanie bez sparingpartnera',
      body: 'Na klesajúcej lavičke ťa môže činka pripnúť v spodnej polohe, odkiaľ ju neodhodíš. Použi uzávery, dorazy ak ich stanica má, a človeka, ktorý sleduje sériu.',
    },
    {
      title: 'Odraz od spodnej časti hrudníka',
      body: 'Činka už prejde kratšiu dráhu. Odraz iba skryje spodnú polohu. Pri dotyku zostaň pod kontrolou alebo urob pauzu.',
    },
  ],
  variations: [
    {
      slug: 'decline-dumbbell-press',
      name: 'Tlak s jednoručkami na klesajúcej lavičke',
      note: 'Samostatné rukoväte sa ľahšie odhodia pri zlyhaní; uhol zostáva rovnaký.',
    },
    {
      slug: 'barbell-bench-press',
      name: 'Tlak s veľkou činkou na lavičke',
      note: 'Rovná verzia, predvolený horizontálny tlak.',
    },
    {
      slug: 'machine-decline-chest-press',
      name: 'Klesajúci tlak na stroji',
      note: 'Pevná dráha, keď chceš objem v sklone bez osi nad tvárou.',
    },
    {
      slug: 'chest-dips',
      name: 'Dipy na hrudník',
      note: 'Podobná línia ako klesajúci tlak, bez lavičky; záťaž možno pridať opaskom.',
    },
  ],
  progressions: [
    'Tlak s jednoručkami na klesajúcej lavičke, kým ti uhol a opora nôh nebudú prirodzené.',
    'Tlak s prázdnou osou a pauzou na spodnej časti hrudníka.',
    'Pracovné série pri rovnakom uhle lavičky. Záťaž pridaj, keď miesto dotyku zostáva rovnaké.',
    'Dipy alebo úzky tlak zaraď vtedy, keď sa zastavuje vystretie, nie dotyk.',
  ],
  programming:
    'Zaraď ho ako druhý cvik na hrudník alebo doplnok po rovnom tlaku: 3–4 série po 5–10 opakovaní. Ak má fitko viac sklonov, zapíš uhol do poznámky. Nehádaj sa s číslami z rovného tlaku — dráha je kratšia a pohyb iný.',
  equipmentAlternatives: [
    {
      slug: 'decline-dumbbell-press',
      name: 'Tlak s jednoručkami na klesajúcej lavičke',
      note: 'Predvolená náhrada, keď sa os z lavičky odoberá neisto.',
    },
    {
      slug: 'chest-dips',
      name: 'Dipy na hrudník',
      note: 'Bez klesajúcej lavičky; pri predklone stále zvýraznia spodnú časť hrudníka.',
    },
    {
      slug: 'machine-decline-chest-press',
      name: 'Klesajúci tlak na stroji',
      note: 'Vhodné pri samostatnom tréningu bez osi nad tvárou.',
    },
  ],
  faqs: [
    {
      question: 'Potrebujem klesajúcu lavičku na spodnú časť hrudníka?',
      answer:
        'Nie. Väčšine cvičiacich stačí rovný tlak, dipy a rozpažovanie. Klesajúci tlak je kratší variant, ktorý niektorým vyhovuje. Použi ho, ak je stanica bezpečná a ramená ho tolerujú, a zapisuj ho ako tento cvik.',
    },
  ],
  relatedSlugs: [
    'decline-dumbbell-press',
    'barbell-bench-press',
    'machine-decline-chest-press',
    'chest-dips',
  ],
} satisfies ExerciseOverlay
