import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'close-grip-bench-press',
  metaDescription:
    'Bench press s úzkym úchopom: šírka úchopu, dráha lakťov a zaznamenávanie tlaku s dôrazom na tricepsy v LIFTAGu oddelene od klasického benču.',
  steps: [
    'Uchop činku tesne vnútri šírky ramien, pričom palce stále obtoč okolo osi. Diamantový úchop býva zvyčajne príliš úzky.',
    'Nastav hornú časť chrbta rovnako ako pri bežnom benči. Vyber činku zo stojana a začni nad spodnou časťou hrudníka.',
    'Pri spúšťaní drž lakte bližšie k trupu. Činky sa dotkni nižšie na hrudníku než pri širokom úchope.',
    'Vytlač ju do úplného vystretia. Posledná tretina pohybu je práca tricepsov, pre ktorú tento variant cvičíš.',
  ],
  mistakes: [
    {
      title: 'Ruky sa navzájom dotýkajú',
      body: 'Takýto úchop si koleduje o zranenie zápästia. O jednu šírku dlane užší úchop než ramená je dostatočne úzky.',
    },
    {
      title: 'Zaznamenávanie úzkeho benču ako bežného benču',
      body: 'Záťaže sa líšia. Použi tento identifikátor, aby bol objem pre tricepsy viditeľný.',
    },
    {
      title: 'Opätovné vytláčanie lakťov do strán v dolnej polohe',
      body: 'Ak lakte vyzerajú ako pri širokom benči, zmenou úchopu si nič nevyriešil.',
    },
  ],
  variations: [
    {
      slug: 'barbell-bench-press',
      name: 'Bench press s veľkou činkou',
      note: 'Širší úchop a väčší dôraz na prsia.',
    },
    {
      slug: 'barbell-skullcrusher',
      name: 'Francúzsky tlak s veľkou činkou',
      note: 'Izolovaný cvik, ak ťa pri tlaku neobmedzujú tricepsy.',
    },
    {
      slug: 'parallel-bar-triceps-dip',
      name: 'Tricepsový dip na bradlách',
      note: 'Variant úzkeho tlaku s vlastnou hmotnosťou.',
    },
  ],
  progressions: [
    'Kliky s úzkym úchopom.',
    'Ľahký bench press s úzkym úchopom a pauzou.',
    'Postupne sa približuj k rovnakým rozsahom pracovných opakovaní ako pri bežnom benči, ale s nižšou záťažou.',
  ],
  programming:
    'Zaraď ho ako hlavný tlak v dni zameranom na tricepsy alebo ako druhý cvik po bežnom benči. 3–5 sérií po 5–8 opakovaní. Oddychuj rovnako ako pri benči; časovač v LIFTAGu ti pomôže neponáhľať sa pri vystieraní lakťov.',
  relatedSlugs: ['barbell-bench-press', 'barbell-skullcrusher', 'cable-triceps-pushdown'],
} satisfies ExerciseOverlay
