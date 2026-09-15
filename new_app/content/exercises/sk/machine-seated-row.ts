import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-seated-row',
  metaDescription:
    'Príťah v sede na stroji: nastavenie vankúša a sedadla, dráha držadiel a vysvetlenie, prečo nejde o seated cable row v LIFTAGu.',
  steps: [
    'Nastav sedadlo tak, aby držadlá smerovali do stredu až spodnej časti hrudníka a hrudný vankúš sa opieral o hrudnú kosť. Ramená začínajú vpredu, ale nie vykrčené.',
    'Chodidlá pevne zapri, spevni trup, nechaj hrudník na vankúši a ťahaj držadlá k rebrám vedením lakťov dozadu.',
    'Nechaj lopatky zatiahnuť bez násilného stláčania do kŕčovitého dorazu. Krk drž dlhý.',
    'Paže pomaly vystieraj. Záťažový blok nesmie naraziť. Ak má stroj hrudný vankúš, odlepovanie sa od neho znamená cheating posledných centimetrov.',
  ],
  mistakes: [
    {
      title: 'Príťah trupom namiesto pažami',
      body: 'Mierny tlak do vankúša je v poriadku. Odhojdovanie od vankúša pri každom opakovaní je zle zaťažený hip hinge.',
    },
    {
      title: 'Príliš nízke sedadlo, takže pohyb sa zmení na shrug',
      body: 'Držadlá maj v strede hrudníka, nie v lone. Výška mení celý cvik.',
    },
    {
      title: 'Zapisovanie seated cable row ako samostatného cviku',
      body: 'Pri cable row sa trup môže pohybovať. Toto je strojový príťah s oporou hrudníka. Iná dráha znamená iný rekord.',
    },
    {
      title: 'Skracovanie natiahnutia kvôli hlučnému bloku',
      body: 'Nechaj paže prejsť do dlhej polohy. Ak blok udiera, spomaľ spúšťanie alebo použi o niečo vyšší kolík, nie kratší rozsah.',
    },
  ],
  variations: [
    {
      slug: 'wide-grip-machine-seated-row',
      name: 'Wide-grip machine seated row',
      note: 'Lakte idú viac do strán, viac pracujú zadné delty a horný chrbát.',
    },
    {
      slug: 'seated-cable-row',
      name: 'Seated cable row',
      note: 'Bez vankúša musíš sám stabilizovať trup.',
    },
    {
      slug: 'chest-supported-t-bar-row',
      name: 'Chest-supported T-bar row',
      note: 'Kotúčová príbuzná verzia rovnakého princípu.',
    },
    {
      slug: 'single-arm-dumbbell-row',
      name: 'Single-arm dumbbell row',
      note: 'Keď jedna strana zaostáva alebo dráha stroja nesedí ramenám.',
    },
  ],
  progressions: [
    'Nauč sa výšku vankúša s ľahkým blokom a úplným vystretím paží.',
    'Pracovné série po 8–12 opakovaní, pričom hrudník zostáva na rovnakom mieste.',
    'Pridaj kotúč alebo posuň kolík, keď sa posledná séria stále dotýka rovnakého bodu.',
    'Široké držadlo alebo pauza pri rebrách, keď sa horná časť príťahu začne strácať.',
  ],
  programming:
    'Vysokokvalitný objem príťahov: 3–4 série po 8–15 opakovaní. Spáruj ho s vertikálnym ťahom, nie s tromi ďalšími príťahmi. Ak sa stroj v posilňovni každý týždeň mení, poznač si značku alebo držadlo — LIFTAG nerozozná Hammer stroj s hrudným vankúšom od kotúčového T-baru, ak mu to neuvedieš.',
  relatedSlugs: [
    'seated-cable-row',
    'wide-grip-machine-seated-row',
    'chest-supported-t-bar-row',
    'barbell-bent-over-row',
  ],
} satisfies ExerciseOverlay
