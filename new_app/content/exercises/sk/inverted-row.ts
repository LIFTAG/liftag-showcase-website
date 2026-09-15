import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'inverted-row',
  metaDescription:
    'Obrátený príťah: výška osi, pevná línia tela a progres bez falošných opakovaní s bradou pri osi.',
  steps: [
    'Os nastav v stojane približne do výšky pása; podobnú výšku môžu mať kruhy alebo TRX. Ľahni si pod ňu a uchop ju nadhmatom alebo neutrálnym úchopom.',
    'Vytvor dlhú líniu od hlavy po päty, pri ľahšej regresii od hlavy po kolená. Ťahaj hrudník k osi vedením lakťov dozadu.',
    'Hrudníkom sa dotkni osi, nie bradou. Spúšťaj sa, kým sú paže dlhé a lopatky dosiahnu prirodzený rozsah.',
    'Ak chceš ľahšiu verziu, os zdvihni a pokrč kolená. Ak chceš ťažšiu, os zníž, vystri nohy alebo zdvihni chodidlá. Nastavenie si zapíš.',
  ],
  mistakes: [
    {
      title: 'Prepadávanie bokov',
      body: 'Vystrčený alebo prehnutý trup nie je príťah. Zatni sedacie svaly a stiahni rebrá, alebo zdvihni os.',
    },
    {
      title: 'Naťahovanie brady',
      body: 'Cieľom je hrudník k osi. Opakovanie s vystreleným krkom sa nepočíta len preto, že sa tvár priblížila.',
    },
    {
      title: 'Nezaistená os',
      body: 'Iba háky, bez uzáverov a navyše otáčajúca sa os: najprv oprav stanovište, až potom sa pod ňu zaves.',
    },
    {
      title: 'Zmena výšky osi bez poznámky',
      body: 'Nižšia os znamená ťažší cvik. Ak LIFTAG ukáže PR po zdvihnutí osi, ide o inú verziu a treba ju zapísať správne.',
    },
  ],
  variations: [
    {
      slug: 'seated-cable-row',
      name: 'Veslovanie na kladke v sede',
      note: 'Zaťažiteľná verzia rovnakého horizontálneho ťahu.',
    },
    {
      slug: 'pull-up',
      name: 'Zhyb',
      note: 'Vertikálny ďalší krok, keď sú obrátené príťahy pri nízkej osi ľahké.',
    },
    {
      slug: 'single-arm-dumbbell-row',
      name: 'Príťah jednoručky jednou rukou',
      note: 'Voľná záťaž, keď už dokážeš pridať viac než vlastnú váhu.',
    },
  ],
  progressions: [
    'Obrátené príťahy s pokrčenými kolenami pri vyššej osi.',
    'Príťahy s vystretými nohami, dotykom hrudníka a sériami po 8–12.',
    'Zdvihni chodidlá alebo pridaj pauzu pri hrudníku.',
    'Pridaj kotúč na boky alebo vestu a zapíš dodatočnú záťaž.',
  ],
  programming:
    'Horizontálny ťah, ktorý zvládneš v každom stojane: 3–4 série po 6–12. Použi ho ako hlavný príťah, kým sú zhyby ešte s asistenciou, alebo ako ľahší cvik po ťažkej práci s veľkou činkou. Dodatočnú záťaž zapisuj; aj verzia s vlastnou váhou patrí do tréningu, aby objem zostal skutočný.',
  faqs: [
    {
      question: 'Kruhy alebo os?',
      answer:
        'Obe možnosti patria pod tento cvik, ak zachováš líniu tela a štandard hrudník k rukoväti. Pri kruhoch napíš „kruhy“ do poznámky — nárok na stabilitu sa líši aj pri rovnakej výške.',
    },
  ],
  relatedSlugs: ['pull-up', 'seated-cable-row', 'barbell-bent-over-row', 'assisted-pull-up'],
} satisfies ExerciseOverlay
