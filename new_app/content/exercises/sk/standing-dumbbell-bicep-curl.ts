import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-bicep-curl',
  metaDescription:
    'Bicepsový zdvih s jednoručkami v stoji: stabilné lakte, plný vis a samostatné zapisovanie striktných zdvihov bez miešania kladivových ani veľkých činkových rekordov.',
  steps: [
    'Postav sa s jednoručkou v každej ruke, dlane smerujú dopredu a paže sú dlhé. Rebrá drž dole a zadok zľahka spevni; sadnutie znamená iný cvik.',
    'Lakte drž pri trupe. Môžu sa posunúť o pár centimetrov, nesmú však odštartovať švih.',
    'Zdvihni jednoručky do úplného skrátenia bicepsu. Zápästia drž v osi a činky v línii s predlaktiami, nie prevalené na nich.',
    'Kontrolovane ich spusti do plného visu a na chvíľu zastav. Striedaj paže alebo ich dvíhaj naraz, no počas bloku pravidlo zachovaj.',
  ],
  mistakes: [
    {
      title: 'Premena posledných opakovaní na zdvih bokmi',
      body: 'Mierna pomoc telom pri skutočne poslednom opakovaní je jedna vec. Ak jednoručky potrebujú rozbeh zo stehien, váha vyhrala; uber.',
    },
    {
      title: 'Zapisovanie kladivových zdvihov ako bicepsových zdvihov v stoji',
      body: 'Palce hore patria pod hammer-curls, dlane hore pod tento cvik. LIFTAG sleduje jeden úchop; ich miešaním vytvoríš falošný rekord iného svalu.',
    },
    {
      title: 'Sadnutie hneď, keď cvik stvrdne',
      body: 'Potom je to zdvih v sede s nábytkom navyše. Zostaň stáť alebo použi seated-dumbbell-bicep-curl.',
    },
    {
      title: 'Zapisovanie páru ako jedného čísla',
      body: 'Zapisuj hmotnosť jednej jednoručky, nie súčet oboch. Zdvojená váha pokazí graf už od prvého týždňa.',
    },
  ],
  variations: [
    {
      slug: 'barbell-curl',
      name: 'Zdvih s veľkou činkou',
      note: 'Obojručná verzia v stoji s menšími skokmi záťaže.',
    },
    {
      slug: 'incline-dumbbell-curl',
      name: 'Zdvih jednoručiek na šikmej lavičke',
      note: 'Biceps je v predĺženej polohe a chrbát má oporu.',
    },
    {
      slug: 'hammer-curls',
      name: 'Kladivové zdvihy',
      note: 'Neutrálny úchop s väčším dôrazom na brachialis a predlaktie.',
    },
    {
      slug: 'seated-dumbbell-bicep-curl',
      name: 'Bicepsový zdvih s jednoručkami v sede',
      note: 'Rovnaké jednoručky bez podvádzania v stoji a s menším natiahnutím.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, plný vis a trup, ktorý nezačína zdvih.',
    'Pracovné série po 8–12 opakovaní v rovnakom postoji a s rovnakým pravidlom striedania.',
    'Pauzu v spodnej polohe pridaj skôr, než začneš používať ťažšie jednoručky.',
    'Incline alebo Scottov zdvih zaraď ako druhý cvik a zapisuj ho ako samostatný cvik.',
  ],
  programming:
    'Hlavný bicepsový cvik s jednoručkami: 3–4 série po 8–12. Zapisuj jednu jednoručku, nie pár. Striedané aj súčasné zdvihy patria sem; spôsob uveď v poznámke série. Kladivové, zdvihy v sede a zdvihy na šikmej lavičke majú vlastné grafy. Štítok pri stojane má otvoriť standing-dumbbell-bicep-curl, nie barbell-curl.',
  equipmentAlternatives: [
    {
      slug: 'barbell-curl',
      name: 'Zdvih s veľkou činkou',
      note: 'Keď chceš jednu záťaž a menšie skoky než pri jednoručkách.',
    },
    {
      slug: 'standing-cable-bicep-curl',
      name: 'Bicepsový zdvih na kladke v stoji',
      note: 'Stále napätie, ak sú jednoručky dole príliš ľahké.',
    },
  ],
  faqs: [
    {
      question: 'Mám striedať paže alebo dvíhať obe naraz?',
      answer:
        'Obe možnosti patria pod tento cvik. Striedanie ti dovolí sledovať každú pažu, súčasné dvíhanie sa viac podobá zdvihu s veľkou činkou. Pre blok si vyber jednu verziu a pri zmene ju uveď v poznámke; zmena nie je PR.',
    },
  ],
  relatedSlugs: ['barbell-curl', 'incline-dumbbell-curl', 'hammer-curls', 'seated-dumbbell-bicep-curl'],
} satisfies ExerciseOverlay
