import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'hanging-leg-raise',
  metaDescription:
    'Zdvih nôh vo vise: aktívny vis, podsadenie panvy a samostatné zaznamenávanie zdvihov vystretých nôh oproti zdvihom kolien v LIFTAG-u.',
  steps: [
    'Zaves sa na hrazdu nadhmatom a ramená drž aktívne, stiahnuté nadol, nie vytiahnuté k ušiam v pasívnom vise. Nohy sú dlhé, kolená mierne uvoľnené, nie násilne uzamknuté.',
    'Spevni stred tela, zdvihni nohy ohnutím v bedrách a zároveň podsad panvu smerom k rebrám. Cieľom sú stehná pri trupe, nie kopnutie do výšky hlavy.',
    'V hornej polohe na chvíľu zastav a nepouži švih na to, aby si tam zostal.',
    'Pod kontrolou spusti nohy do nehybného visu. Pred ďalším opakovaním zastav kyvadlo; pohyblivý vis nie je štartová poloha.',
  ],
  mistakes: [
    {
      title: 'Rozhúpnutie a počítanie oblúka',
      body: 'Ak musíš bokmi vyhadzovať nohy nahor, používaš kipping. Vráť sa do nehybného visu alebo prejdi na zdvih kolien vo vise.',
    },
    {
      title: 'Zdvih vystretých nôh bez podsadenia panvy',
      body: 'Takmer celú prácu odvedú ohýbače bedier a vznikne pokus o L-sit vo vise. Hore podsadíš kostrč smerom k hrazde, inak si brucho vynechal.',
    },
    {
      title: 'Zaznamenávanie zdvihov kolien ako zdvihov nôh vo vise',
      body: 'Pokrčené kolená sú jednoduchšia regresia a iný identifikátor. Veď ich oddelene, inak je „rekord“ iba výsledkom kratších pák.',
    },
    {
      title: 'Pasívny vis s ramenami pri ušiach',
      body: 'Uvoľnené ramená zmenia cvik na test krku a úchopu. Najprv nastav lopatky; ak zlyhá úchop, použi popruhy alebo stoličku kapitána a uveď to v poznámke.',
    },
  ],
  variations: [
    {
      slug: 'hanging-knee-raise',
      name: 'Zdvih kolien vo vise',
      note: 'Pokrčené kolená, často na stoličke kapitána; poctivá regresia.',
    },
    {
      slug: 'toes-to-bar',
      name: 'Toes-to-bar',
      note: 'Väčší rozsah. Použi tento identifikátor, ak používaš kipping alebo sa skutočne dotkneš hrazdy.',
    },
    {
      slug: 'lying-leg-raise',
      name: 'Zdvih nôh v ľahu',
      note: 'Varianta na podlahe, keď ťa obmedzuje vis na hrazde.',
    },
    { slug: 'machine-ab-crunch', name: 'Skracovačka na stroji', note: 'Zrolovanie so záťažou bez visu.' },
  ],
  progressions: [
    'Zdvihy kolien vo vise s nehybným visom a podsadením panvy.',
    'Kontrolované zdvihy vystretých nôh približne do rovnobežnej polohy s podlahou.',
    'Plné zdvihy s pauzou hore a bez švihu.',
    'Toes-to-bar alebo ľahká jednoručka medzi chodidlami až po odstránení švihu. Pridanú záťaž zaznamenaj.',
  ],
  programming:
    '3–4 série po 6–12 striktných opakovaní, nie neprerušovaná séria v štýle CrossFitu. Ak ťa obmedzuje úchop alebo švih, cvič zdvih kolien vo vise alebo zdvih nôh v ľahu, aby brucho stále dostalo kvalitnú sériu. Oddychuj dostatočne dlho, aby ďalšia séria začala z nehybného visu.',
  faqs: [
    {
      question: 'Sú zdvihy na stoličke kapitána rovnaký cvik?',
      answer:
        'Stolička odľahčí úchop a často používa pokrčené kolená, čo je v tomto katalógu zdvih kolien vo vise. Zdvih nôh vo vise používaj pri vise na hrazde s dlhými nohami. Ak máš iba stoličku, zaznamenaj jej identifikátor, aby graf zodpovedal pomôcke.',
    },
  ],
  relatedSlugs: ['hanging-knee-raise', 'toes-to-bar', 'machine-ab-crunch', 'plank'],
} satisfies ExerciseOverlay
