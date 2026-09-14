import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'landmine-row',
  metaDescription:
    'Landmine row: hip hinge, držadlo a rozdiel oproti T-bar príťahu a jednoručnému Meadows row na rovnakej osi.',
  steps: [
    'Zasuň os do landmine. Obkroč ju chrbtom k ukotveniu a pod naložený koniec pripevni držadlo — V-rukoväť, popruh alebo úchop oboma rukami priamo na osi.',
    'Predkloň sa v bokoch, kolená nechaj mäkké, spevni sa a zdvihni záťaž tesne nad podlahu. Trup zostáva v tomto predklone; vzpriamenejší štart rozsah príťahu skracuje.',
    'Priťahuj držadlo k spodnej časti hrudníka alebo hornej časti brucha. Lakte veď dozadu a ramená drž od uší.',
    'Spúšťaj záťaž, kým vystrieš paže, a udržuj predklon. Ďalšie opakovanie nezačínaj trhnutím bokmi.',
  ],
  mistakes: [
    {
      title: 'Trhnutie bokmi v prvom centimetri',
      body: 'Ak kotúče vyskočia skôr, než sa pohnú lakte, robíš slabo spevnený RDL. V zastavení chvíľu podrž záťaž a potom vykonaj príťah.',
    },
    {
      title: 'Miešanie T-bar a landmine do jedného cviku',
      body: 'T-bar row je v tejto skupine príťah s úzkym držadlom a postojom obkročmo. Ak úchop alebo postoj zodpovedá landmine verzii, zapisuj ju pod tento cvik.',
    },
    {
      title: 'Jednoručný, kolmý Meadows row bez poznámky',
      body: 'Jednoručný landmine row má inú páku. Ak máš v pláne túto verziu, zapisuj ju pod tento cvik a do poznámky série napíš „Meadows“ alebo „1-arm“, aby ťa záťaž budúci týždeň neprekvapila.',
    },
    {
      title: 'Ukotvenie sa počas série posúva',
      body: 'Uvoľnený roh nie je landmine. Ak puzdro kĺže, dráha sa pod tebou mení. Najprv oprav ukotvenie.',
    },
  ],
  variations: [
    {
      slug: 't-bar-row',
      name: 'T-bar row',
      note: 'Rovnaká skupina cvikov, zvyčajne s osobitným úzkym držadlom a hlbším predklonom.',
    },
    {
      slug: 'chest-supported-t-bar-row',
      name: 'Chest-supported T-bar row',
      note: 'Vankúš preberie záťaž zo vzpriamovačov chrbtice.',
    },
    {
      slug: 'single-arm-dumbbell-row',
      name: 'Single-arm dumbbell row',
      note: 'Jednoručková verzia jednoručného landmine príťahu.',
    },
    {
      slug: 'barbell-bent-over-row',
      name: 'Barbell bent-over row',
      note: 'Rovná os, dve ruky a väčšie nároky na kríže.',
    },
  ],
  progressions: [
    'Príťahy s oporou hrudníka alebo s jednoručkou, kým predklon zostane nehybný.',
    'Dvojručné landmine príťahy s malými kotúčmi, aby mal oblúk priestor.',
    'Pracovné série po 6–10 opakovaní. Pridaj kotúč, keď sa uhol trupu nemení.',
    'Jednoručný Meadows variant až vtedy, keď je dvojručná verzia istá. Poznač si ho.',
  ],
  programming:
    'Hodí sa do posilňovne s landmine bez T-bar stanovišťa: 3–4 série po 6–12 opakovaní. Oblúk dovolí niektorým ramenám ťahať viac než pri rovnej osi. Zapisuj kotúče aj to, či započítavaš hmotnosť osi — vyber jeden spôsob a dodrž ho.',
  relatedSlugs: [
    't-bar-row',
    'chest-supported-t-bar-row',
    'single-arm-dumbbell-row',
    'barbell-bent-over-row',
  ],
} satisfies ExerciseOverlay
