import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'ez-bar-skullcrusher',
  metaDescription:
    'Francúzsky tlak s EZ-činkou: dráha lakťov aj osi a samostatné zaznamenávanie oproti francúzskemu tlaku s rovnou osou a benču s úzkym úchopom v LIFTAG-u.',
  steps: [
    'Ľahni si na rovnú lavičku a uchop šikmé časti EZ-činky nadhmatom, ktorý vyhovuje tvojim zápästiam.',
    'Začni s činkou nad ramenami, nie nad čelom. Nadlaktia zostávajú takmer nehybné; pohyb vychádza z lakťov a pracujú tricepsy.',
    'Pokrč lakte a spusti činku k vlasovej línii alebo mierne za hlavu, ak tým uľavíš lakťom. Dotkni sa jej bez odrazu.',
    'Vystieraj lakte do úplného uzamknutia. Posledná tretina je práca tricepsov, ktorú chceš; neskracuj ju len preto, aby si šetril lakte, na ktoré si práve naložil.',
    'Ak ramená premieňajú pohyb na pullover, zafixuj nadlaktia a zníž záťaž.',
  ],
  mistakes: [
    {
      title: 'Lakte sa rozchádzajú a putujú k bokom',
      body: 'Potom z toho vzniká neupravený bench press s úzkym úchopom. Nadlaktia drž v koridore vedľa hlavy.',
    },
    {
      title: 'Odraz činky od čela',
      body: 'Názov je varovanie, nie cieľ. Kontroluj dolnú polohu, inak si vyslúžiš jeho význam.',
    },
    {
      title: 'Miešanie EZ a rovných francúzskych tlakov do jedného cviku',
      body: 'Zakrivenie mení to, čo znesú zápästia a lakte, a podľa toho sa mení aj záťaž. Tlak s rovnou osou patrí pod druhý identifikátor.',
    },
    {
      title: 'Premena spúšťania na pullover',
      body: 'Ak nadlaktia pri každom opakovaní idú dozadu, pomáhajú široké chrbtové svaly a tricepsy strácajú prácu. Skráť rozsah alebo odľahči činku.',
    },
  ],
  variations: [
    {
      slug: 'barbell-skullcrusher',
      name: 'Francúzsky tlak s veľkou činkou',
      note: 'Rovná os, ktorá zvyčajne viac zaťažuje zápästia.',
    },
    {
      slug: 'lying-dumbbell-triceps-extension',
      name: 'Tricepsová extenzia s jednoručkami v ľahu',
      note: 'Nezávislé ruky uľahčia nájdenie uhla, ktorý nebolí lakte.',
    },
    {
      slug: 'overhead-cable-triceps-extension',
      name: 'Tricepsová extenzia nad hlavou na kladke',
      note: 'Stále napätie, ktoré mnohé lakte znášajú lepšie.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press s úzkym úchopom',
      note: 'Tlakový vzorec, keď ťa neobmedzuje izolácia.',
    },
  ],
  progressions: [
    'Ľahká EZ-činka s jednosekundovou pauzou tesne nad vlasovou líniou.',
    'Pracovné série po 8–12 opakovaní s rovnakou dráhou osi každý týždeň.',
    'Záťaž pridaj, keď lakte zostanú pokojné vo všetkých pracovných sériách.',
    'Ak rovná verzia dráždi kĺby, prejdi na mierne šikmú lavičku a uveď uhol v poznámke.',
  ],
  programming:
    'Izolácia po tlaku, nie maximálny silový cvik. 3–4 série po 8–12 opakovaní. Ak striedaš spúšťanie k čelu a za hlavu, napíš to do poznámky série, aby budúce ja vedelo, ktorú verziu francúzskeho tlaku si minulý týždeň skutočne cvičil. Oddychuj dostatočne dlho, aby zostalo vystretie lakťov poctivé.',
  faqs: [
    {
      question: 'Mám činku spúšťať k čelu alebo za hlavu?',
      answer:
        'Obe možnosti sú vhodné. Vlasová línia udrží nadlaktia zvislo; spúšťanie za hlavu pridá trochu flexie v ramenách a lakťom často vyhovuje viac. Vyber si základný variant a druhý si poznač, ak ich striedaš.',
    },
  ],
  relatedSlugs: [
    'barbell-skullcrusher',
    'close-grip-bench-press',
    'overhead-cable-triceps-extension',
    'cable-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
