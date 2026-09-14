import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-shrug',
  metaDescription:
    'Krčenie ramien s jednoručkami: priame zdvihnutie, pauza hore a práca trapézov bez zrolovaného upright row v LIFTAGu.',
  steps: [
    'Stoj s jednoručkami pri bokoch, paže nechaj dlhé, hrudník otvorený a krk dlhý. Mierny predklon je voliteľný; zalomenie v páse by bol príťah.',
    'Dvíhaj ramená priamo k ušiam. Neroluj nimi. Hore chvíľu zastav, aby trapézy skutočne pracovali a pohyb nebol iba odrazom.',
    'Spúšťaj, kým sa trapézy natiahnu a jednoručky visia. Táto predĺžená poloha je začiatok ďalšieho opakovania, nie oddych s pokrčenými lakťami.',
    'Keď zlyháva úchop, poriadne stiskni jednoručky alebo použi trhačky. Ak musíš pri pohybe ohýbať lakte, záťaž je priveľká alebo už nerobíš shrug.',
  ],
  mistakes: [
    {
      title: 'Rolovanie ramenami',
      body: 'Krúženie dopredu je divadlo a spoľahlivý spôsob, ako podráždiť akromioklavikulárny kĺb. Hore, pauza, dole. Trapézy zdvíhajú; neobiehajú.',
    },
    {
      title: 'Premena na upright row',
      body: 'Pokrčené lakte a jednoručky stúpajúce popri rebrách znamenajú iný cvik. Ak to robíš, zapíš barbell upright row. Pri shrugu zostávajú paže dlhé.',
    },
    {
      title: 'Vysúvanie krku hore',
      body: 'Hlava zostáva vzpriamená. Vysúvanie brady, aby si cvik „cítil viac“, iba zaťaží krk. Ramená idú k ušiam, nie uši k ramenám.',
    },
    {
      title: 'Vyhadzovanie 50-kilových jednoručiek v trojkách',
      body: 'Shrug odmeňuje čas pod napätím viac než falošný 1RM. Ak sa jednoručky hýbu a trapézy nemajú pauzu, zníž záťaž.',
    },
  ],
  variations: [
    {
      slug: 'barbell-upright-row',
      name: 'Barbell upright row',
      note: 'Viac deltov a stále horné trapézy, iba ak ramenu vyhovuje táto dráha.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Standing barbell overhead press',
      note: 'Ťažký lockout zaťaží trapézy ako zložený cvik, nie ako náhrada shrugov.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Trap bar deadlift',
      note: 'Ťažký lockout na trap bare zasiahne horné trapézy; skutočné shrugy však stále patria k tomuto cviku.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, dvojsekundová pauza a úplné natiahnutie dole.',
    'Pridaj záťaž, keď pauza zostáva a lakte sa nevkladajú do pohybu.',
    'Trhačky použi, keď úchop limituje trapézy — do poznámky uveď „straps“, aby graf zostal poctivý.',
    'Spomaľ spúšťanie, keď ti dôjdu ťažké jednoručky skôr než kvalitné opakovania.',
  ],
  programming:
    'Shrug je doplnková práca: 3–4 série po 8–15 opakovaní po ťahu alebo tlaku. Zapisuj hmotnosť jednej jednoručky, nie súčet páru. Rekord v LIFTAGu má význam iba s pauzou; ťažší pár vyhodený švihom nie je rekord trapézov. Odpočívaj tak dlho, aby ďalšia séria nebola súťažou úchopu, ak práve ten netrénuješ.',
  equipmentAlternatives: [
    {
      slug: 'barbell-upright-row',
      name: 'Barbell upright row',
      note: 'Ak máš iba os a ramená túto dráhu znášajú. Je to iný vzor, preto ho zapíš ako príťah.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Trap bar deadlift',
      note: 'Trap bar použi na ťažké ťahy. Shrug s ním zapisuj sem iba vtedy, ak pohyb skutočne bol shrugom.',
    },
  ],
  faqs: [
    {
      question: 'Mám hore rolovať ramenami?',
      answer:
        'Nie. Dvíhaj ich a spúšťaj. Rolovanie nepridá tajné vlákno trapézov, iba drhne ramenný pletenec. Ak chceš viac práce, predĺž pauzu alebo spomaľ spúšťanie.',
    },
  ],
  relatedSlugs: [
    'barbell-upright-row',
    'standing-barbell-overhead-press',
    'trap-bar-deadlift',
    'conventional-deadlift',
    'barbell-shrugs',
  ],
} satisfies ExerciseOverlay
