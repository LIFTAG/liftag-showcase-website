import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'landmine-press',
  metaDescription:
    'Landmine press: postoj, dráha približne 45° a zapisovanie práce s landmine v LIFTAGu, keď tlak striktne nad hlavou dráždi rameno.',
  steps: [
    'Zasuň puzdro osi do landmine alebo do rohu chráneného uterákom. Druhý koniec nalož. Postav sa do rozkročeného postoja s vnútornou nohou vzadu a os drž pri pracovnom ramene.',
    'Spevni sa ako pri anti-rotačnom planku. Voľnú ruku môžeš položiť na bedro alebo stojan. Rebrá drž dole — tento cvik sa rád zmení na skracovačku v stoji.',
    'Tlač po oblúku približne 45°, kým je paža dlhá pred tvárou, nie vo vertikálnom lockoute pri uchu. Na konci nekrč rameno do krku.',
    'Kontrolovane spusti os k ramenu. Ak zadná noha ušla, znovu nastav postoj. Vymeň stranu a dorovnaj počet opakovaní.',
  ],
  mistakes: [
    {
      title: 'Stojíš tak ďaleko, že z cviku vzniká predpažovanie',
      body: 'Pri veľkej vzdialenosti zdvíhaš puzdro vystretou rukou. Pristúp bližšie, aby začiatok bol pri ramene a dráha bola tlakom.',
    },
    {
      title: 'Stojíš tak blízko, že sa zastavíš pri hrudníku',
      body: 'Keď landmine natlačíš k telu, oblúk nemá priestor. Ustúp trochu, aby sa os mohla pohybovať nahor a k sebe.',
    },
    {
      title: 'Rotácia trupu pri každom opakovaní',
      body: 'Polovica zmyslu cviku je odolávať rotácii. Ak sa opačné rameno trhá dozadu, zníž záťaž alebo prejdi do kľaku na jednom kolene a stabilizuj trup.',
    },
    {
      title: 'Zapisovanie ako standing overhead press',
      body: 'Dráha aj rekord sú iné. Zachovaj tento cvik a pri striedaní stojacej a kľačiacej verzie uveď postoj v poznámke.',
    },
  ],
  variations: [
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Standing barbell overhead press',
      note: 'Zvislá os, väčšia záťaž a prísnejší rekord.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Seated dumbbell shoulder press',
      note: 'Nezávislé ruky na lavičke, keď nemáš landmine.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Machine shoulder press',
      note: 'Vedená dráha nad hlavou na objemovú prácu.',
    },
    {
      slug: 'landmine-row',
      name: 'Landmine row',
      note: 'Rovnaká stanica, opačný smer. Príťah nezapisuj ako tlak.',
    },
  ],
  progressions: [
    'Landmine press v kľaku na jednom kolene s ľahkým kotúčom, kým rebrá zostávajú dole.',
    'Tlaky v stoji s rozkročeným postojom, pričom obe ruky dorovnajú opakovania.',
    'Pridaj záťaž, keď zakončenie stále vyzerá ako tlak, nie ako shrug alebo skracovačka.',
    'Použi ho ako hlavný tlak, keď je vertikálny lockout mimo hry.',
  ],
  programming:
    'Landmine press sa hodí v dňoch s podráždeným ramenom aj ako hlavný jednoručný tlak. Rob 3–4 série po 6–10 opakovaní na každú ruku. Zapisuj jeden cvik, nie dva, a poznač stranu, ktorá zlyhala ako prvá. Medzi rukami odpočívaj, ak prvá strana ešte lapá po dychu — časovač LIFTAGu stále platí.',
  equipmentAlternatives: [
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Seated dumbbell shoulder press',
      note: 'Nemáš landmine ani vhodný roh — použi jednoručku a lavičku.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Machine shoulder press',
      note: 'Strojová dráha, keď chceš pracovať oboma rukami naraz.',
    },
  ],
  faqs: [
    {
      question: 'Kľak na jednom kolene alebo stoj?',
      answer:
        'Kľak je učebný postoj a zároveň cvičenie pre stred tela. V stoji môžeš naložiť viac. Ak používaš oba, postoj si zapíš do poznámky série; inak budeš budúci týždeň lámať hlavu, prečo záťaž vyskočila.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'landmine-row',
  ],
} satisfies ExerciseOverlay
