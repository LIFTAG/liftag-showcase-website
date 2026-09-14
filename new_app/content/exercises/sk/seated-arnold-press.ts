import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-arnold-press',
  metaDescription:
    'Arnoldove tlaky v sede: rotácia, rozsah a samostatné zapisovanie od tlakov s jednoručkami v sede v LIFTAGu.',
  steps: [
    'Sadni si ako pri tlakoch s jednoručkami. Začni s jednoručkami pred ramenami a dlaňami k sebe, v polohe zdvihu, nie tlaku.',
    'Tlač a zároveň rotuj: hore smerujú dlane dopredu a jednoručky končia nad temenom. Rotácia nie je samostatné krútenie v spodnej polohe pod záťažou.',
    'Spúšťaj po opačnej dráhe, kým sa dlane pri ramenách znova otočia k tebe. Poslednú tretinu pohybu kontroluj, práve tá pridáva rozsah.',
    'Lakte drž počas rotácie pred trupom. Ak sa dole rozídu do strán, vytvoril si nečistý tlak s rozpažením.',
  ],
  mistakes: [
    {
      title: 'Vynechanie rotácie a zápis ako tento cvik',
      body: 'Bez otočenia ide o tlak s jednoručkami v sede. Tento cvik si nechaj pre celý Arnoldov pohyb; miešanie zakryje, že si vynechal náročnú časť.',
    },
    {
      title: 'Krútenie jednoručiek s hmotnosťou 40 kg v spodnej polohe',
      body: 'Rotácia patrí do dráhy tlaku. Zastavené krútenie pod záťažou v spodnej polohe je experiment s vnútornou rotáciou, nie tlak.',
    },
    {
      title: 'Odraz zo zdvihovej polohy',
      body: 'Spodok Arnoldovho tlaku je najdlhšia poloha. Zastav alebo zostaň pokojný; odraz od deltov premrhá dodatočný rozsah.',
    },
    {
      title: 'Naháňanie trojopakovacieho maxima',
      body: 'Je to hypertrofický tlak. Ak sú jednoručky také ťažké, že ich nedokážeš otočiť, robíš nečistý tlak v sede. Uber alebo vyber iný cvik v katalógu.',
    },
  ],
  variations: [
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami nad hlavou v sede',
      note: 'Rovnaké sedadlo bez rotácie, zvyčajne s vyššou záťažou.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlaky s veľkou činkou nad hlavou v stoji',
      note: 'Silový tlak, ktorým sa Arnoldov tlak nesnaží byť.',
    },
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Priama práca bočných deltov, keď rotácia limituje a samotný tlak nie.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Tlak na ramená na stroji',
      note: 'Pevná dráha pre objem nad hlavou bez rotácie.',
    },
  ],
  progressions: [
    'Tlaky s jednoručkami v sede, kým je vystretie nad hlavou čisté.',
    'Ľahké Arnoldove tlaky s pomalou rotáciou a pauzou dole.',
    'Vybuduj 8–12 opakovaní, až potom zvyšuj jednoručky. Ak rotácia zmizne, záťaž vyskočila príliš skoro.',
  ],
  programming:
    'Arnoldov tlak používaj ako hlavný tlak v sede počas tréningu ramien alebo ako druhý cvik po tlaku s veľkou činkou nad hlavou. Rob 3–4 série po 8–12. Progresiu nezdieľaj s tlakmi s jednoručkami v sede — ak ich zapisuješ ako jeden cvik, LIFTAG ich bude považovať za rovnaký PR, hoci nie sú.',
  equipmentAlternatives: [
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami nad hlavou v sede',
      note: 'Použi ich, keď rotácia dráždi rameno alebo sú jednoručky priveľké na čisté otočenie.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine tlak',
      note: 'Jednoručný tlak nad hlavou s príjemnejšou dráhou.',
    },
  ],
  faqs: [
    {
      question: 'Je Arnoldov tlak lepší než tlak s jednoručkami v sede?',
      answer:
        'Má dlhší pohyb, nie automaticky lepší. Dole získaš viac rozsahu a trochu rotácie, no zvládneš menšiu záťaž. Na jeden blok si vyber hlavný tlak, aby graf zostal čitateľný.',
    },
  ],
  relatedSlugs: [
    'seated-dumbbell-shoulder-press',
    'standing-barbell-overhead-press',
    'machine-shoulder-press',
    'cable-lateral-raise',
  ],
} satisfies ExerciseOverlay
