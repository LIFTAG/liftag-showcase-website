import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-dip',
  metaDescription:
    'Dip na stroji: výška sedadla, úplné vystretie a samostatné zaznamenávanie dipov s kotúčmi alebo blokom oproti dipom na bradlách v LIFTAG-u.',
  steps: [
    'Nastav sedadlo tak, aby rukoväte začínali pri spodnej časti hrudníka a chodidlá boli pevne na podlahe. Príliš vysoká poloha vedie ku krčeniu ramien, príliš nízka ťa dostane do zlej tlakovej pozície.',
    'Uchop rukoväte so zápästiami nad predlaktiami, opri sa o zadnú podložku a trup drž pomerne vzpriamený; toto je stroj na tricepsy.',
    'Vytlač rukoväte do úplného vystretia bez vyhadzovania ramien k ušiam. Ak sa záťažový blok snaží odrážať, v hornej polohe na chvíľu zastav.',
    'Vráť sa, kým nebudú nadlaktia približne rovnobežné s podlahou alebo kým ramená zostanú pokojné pri tvojej maximálnej hĺbke. Kolíky nezarážaj.',
  ],
  mistakes: [
    {
      title: 'Zaznamenávanie dipu na stroji ako dipu na bradlách alebo hrudníkového dipu',
      body: 'Vedená dráha, iná záťaž a iný osobný rekord. Použi tento identifikátor. Naskenuj štítok na ráme, aby sa neotvoril cvik na bradlách.',
    },
    {
      title: 'Sedadlo je tak vysoko, že sa ramená pri každom opakovaní krčia',
      body: 'Ak prvý pohyb vyzerá ako krčenie trapézov, zníž sedadlo, aby lakte mohli cestovať pod zápästiami.',
    },
    {
      title: 'Skracovanie vystretia, aby sa blok stále hýbal',
      body: 'Posledná tretina je práca tricepsov. Ak hore lakte iba zmäkčíš, zmenil si cvik na čiastočný tlak.',
    },
    {
      title: 'Nekonzistentné zaznamenávanie kotúčov a záťažového bloku',
      body: 'Niektoré stroje majú blok, iné kotúče. Zaznamenaj číslo z konkrétneho stroja a spôsob každý týždeň zachovaj, inak graf pri zmene fitka vyskočí.',
    },
  ],
  variations: [
    {
      slug: 'parallel-bar-triceps-dip',
      name: 'Tricepsový dip na bradlách',
      note: 'Voľná opora, väčšia náročnosť na stabilitu a rovnaký vzpriamený vzor.',
    },
    {
      slug: 'chest-dips',
      name: 'Hrudníkový dip',
      note: 'Predklon na bradlách, keď chceš prsia, nie dráhu stroja.',
    },
    {
      slug: 'assisted-dip',
      name: 'Asistovaný dip',
      note: 'Protiťažová plošina, kým sú dipy s vlastnou hmotnosťou čisté.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press s úzkym úchopom',
      note: 'Tlak s pridanou záťažou, ak strojový dip dráždi ramená.',
    },
  ],
  progressions: [
    'Ľahký záťažový blok alebo prázdne ramená stroja, úplné vystretie bez odrazu.',
    'Pracovné série po 8–12 opakovaní s rovnakou polohou sedadla.',
    'V dolnej polohe pridaj pauzu a až potom zvyšuj záťaž.',
    'Prejdi na dipy na bradlách, keď je stroj ľahký a ramená zostávajú pokojné.',
  ],
  programming:
    'Objem pre tricepsy bez balancovania na bradlách: 3–4 série po 8–12 opakovaní. Štítky partnerských fitiek na tomto ráme by mali otvárať dip na stroji, nie hrudníkový dip. Ak striedaš stroj s kotúčmi a stroj s blokom, uveď pomôcku v poznámke, aby 40 kg rekord nebol iba výsledkom iného záťažového bloku.',
  faqs: [
    {
      question: 'Je dip na stroji rovnaký ako asistovaný dip?',
      answer:
        'Nie. Asistovaný dip používa plošinu na odľahčenie vlastnej hmotnosti pri bradlách. Dip na stroji je tlak v sede alebo kľaku na rukovätiach. Ide o iný vzorec aj iný identifikátor; zaznamenaj ten stroj, na ktorom si sedel.',
    },
  ],
  relatedSlugs: [
    'parallel-bar-triceps-dip',
    'chest-dips',
    'close-grip-bench-press',
    'machine-triceps-extension',
  ],
} satisfies ExerciseOverlay
