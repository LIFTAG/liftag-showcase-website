import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'toes-to-bar',
  metaDescription:
    'Toes-to-bar: dotyk chodidiel s hrazdou, striktná verzia verzus kipping a zaznamenávanie T2B v LIFTAG bez miešania s prednožovaním či priťahovaním kolien vo vise.',
  steps: [
    'Zaves sa nadhmatom na hrazdu, ruky maj trochu širšie než pri zhybe a ramená stiahni do aktívnej polohy. Pokrčenie ramien z pasívneho visu nie je aktívny začiatok.',
    'Striktná verzia: prejdi do dutého postavenia, podsadením panvy a zatvorením bedier zdvihni špičky k hrazde. Špičky sa hrazdy dotknú. Kopnutie smerom k stropu, ktoré ju minie, nie je opakovanie.',
    'Kippingová verzia: striedaj duté a prehnuté postavenie, potom špičkami ťukni do hrazdy. Stále musí ísť o dotyk, nie o priestor pred ňou. Ak je v programe striktná verzia, nekipuj bez poznámky.',
    'Spúšťaj sa bez toho, aby si sériu odovzdal kyvadlu, ktoré nevieš zastaviť. Ďalšie opakovanie začína z polohy, ktorú si si zvolil.',
    'Ak na hrazdu nedosiahneš, ešte nejde o tento cvik. Dovtedy zapisuj prednožovanie vo vise alebo priťahovanie kolien vo vise, kým rozsah nebude k dispozícii.',
  ],
  mistakes: [
    {
      title: 'Zapisuješ ich ako prednožovanie vo vise',
      body: 'Prednožovanie vo vise začína z pokojného visu a podsadenia panvy, zvyčajne bez potreby dotknúť sa hrazdy. Toes-to-bar znamená kontakt s hrazdou. Drž tieto cviky oddelene, inak graf mieša dve zručnosti.',
    },
    {
      title: 'Kipuješ v striktnom zázname bez poznámky',
      body: 'Kippingový objem nie je striktný rekord. Pri kippingu zostaň pri tomto cviku a do poznámky série napíš „kip“, aby sa butterfly séria neschovala medzi striktné opakovania.',
    },
    {
      title: 'Počítaš takmer dotyky',
      body: 'Špičky na hrazde. Predkolenie k hrazde je iný štandard, ktorý používajú niektoré posilňovne. Vyber si jeden, zapíš ho a nepočítaj kopnutie zastavené vo výške očí.',
    },
    {
      title: 'Úchop a švih ovládnu celú sériu',
      body: 'Ak nevieš švih zastaviť, skráť sériu alebo prejdi na priťahovanie kolien vo vise. Divoká neprerušovaná séria je kondičná práca, nie rekord v T2B, pokiaľ si ju práve tak nenaprogramoval.',
    },
  ],
  variations: [
    {
      slug: 'hanging-leg-raise',
      name: 'Prednožovanie vo vise',
      note: 'Striktný vis s vystretými nohami bez požiadavky dotknúť sa hrazdy. Poctivý príbuzný, nie náhrada záznamu.',
    },
    {
      slug: 'hanging-knee-raise',
      name: 'Priťahovanie kolien vo vise',
      note: 'Pokrčené kolená. Použi ho, kým nebude k dispozícii rozsah s vystretými nohami.',
    },
    {
      slug: 'pull-up',
      name: 'Zhyb',
      note: 'Rovnaká hrazda, iná úloha. Kippingové T2B nezapisuj ako zhyby len preto, že si bol na hrazde.',
    },
    { slug: 'dead-hang', name: 'Pasívny vis', note: 'Úchop a stiahnuté ramená, keď netrénuješ zdvih nôh.' },
  ],
  progressions: [
    'Priťahovanie kolien vo vise z pokojného visu s podsadením panvy.',
    'Prednožovanie vo vise, kým stehná dosiahnu trup bez švihu.',
    'Striktné toes-to-bar so skutočným dotykom a kontrolovaným spúšťaním.',
    'Kippingové série iba vtedy, keď ich vyžaduje tréning. Poznač „kip“ a nemiešaj ich do minulého striktného počtu.',
  ],
  programming:
    'Striktné T2B: 3–4 série po 5–10 opakovaní; medzi opakovaniami sa podľa potreby vráť do pokojného visu. Kipping môže zostať pri tomto cviku s poznámkou „kip“ a skutočným časom odpočinku. Ani jednu verziu nepresúvaj na prednožovanie vo vise len preto, že oba cviky používajú hrazdu. Ak ako prvý odíde úchop, rozdeľ prácu pomocou pasívneho visu alebo popruhov a zapíš to.',
  faqs: [
    {
      question: 'Patrí k tomuto cviku striktná alebo kippingová verzia?',
      answer:
        'Môžu tu byť obe. Ak nič nepoznamenáš, predvolená je striktná verzia. Pri kipe zostaň na toes-to-bar a do poznámky série napíš „kip“. Prednožovanie vo vise je striktný vis, pri ktorom sa hrazdy nemusíš dotknúť. Kippingové T2B tam neodkladaj len preto, aby graf prednožovania vyzeral väčší.',
    },
  ],
  relatedSlugs: ['hanging-leg-raise', 'pull-up', 'hanging-knee-raise', 'dead-hang'],
} satisfies ExerciseOverlay
