import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-lying-leg-curl',
  metaDescription:
    'Zakopávanie v ľahu na stroji: podložka pri Achillovej šľache, pevná panva, úplné pokrčenie kolien a samostatné zaznamenávanie oproti zakopávaniu v sede v LIFTAG-u.',
  steps: [
    'Ľahni si na brucho. Kĺb kolena zarovnaj s osou stroja. Podložka patrí na spodok Achillovej šľachy, nie do polovice lýtka.',
    'Boky polož na podložku, neudržiavaj ich vo vzduchu. Uchop rukoväte a ak má stroj popruh cez panvu, použi ho.',
    'Pritiahni päty k sedacím svalom bez trhnutia záťažovým blokom a bez odlepenia bokov od lavičky.',
    'V krajnom pokrčení na chvíľu zastav. Pod kontrolou spúšťaj do natiahnutia, ktoré vieš ovládať, a zastav pred nárazom kotúčov.',
    'Panvu nastav pri každom opakovaní znova. Ak sa posunula nahor, posledné zakopnutie bolo iba predklonom v prestrojení.',
  ],
  mistakes: [
    {
      title: 'Odlepovanie bokov od podložky',
      body: 'Zmenil si zakopávanie na zlý kop sedacími svalmi. Zafixuj panvu a ak to nejde, zníž záťaž.',
    },
    {
      title: 'Podložka v strede lýtka',
      body: 'Skracuje páku a zvyšuje nepríjemné zaťaženie v oblasti Achillovej šľachy. Posuň ju nižšie, aby zaťažovala pätu, nie bruško lýtka.',
    },
    {
      title: 'Obrovský blok a minimálny rozsah',
      body: 'Dvojpalcové prikývnutie nie je zakopnutie. Ovládni natiahnutie aj stiahnutie, inak zaznamenávaš iba hluk.',
    },
    {
      title: 'Zaznamenávanie zakopávania v sede sem',
      body: 'Boky vystreté na lavičke nie sú boky pokrčené v sede. Ľah a sed majú dva grafy. Zachovaj ich oddelené.',
    },
  ],
  variations: [
    {
      slug: 'machine-seated-leg-curl',
      name: 'Zakopávanie v sede na stroji',
      note: 'Rovnaké pokrčenie kolena, ale boky sú ohnuté. Zadné stehná sú v dlhšej polohe a rekord je iný.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic curl',
      note: 'Náročné excentrické spúšťanie v dlhej polohe po odložení záťažového bloku.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Pohyb v bokoch pre zadné stehná, ktorý môžeš zaťažiť hneď od prvého dňa.',
    },
    {
      slug: 'glute-ham-raise',
      name: 'Glute ham raise',
      note: 'Variant na GHD, ak chceš skutočné aktívne zdvíhanie nad rámec stroja na zakopávanie.',
    },
  ],
  progressions: [
    'Ľahké zakopávanie v ľahu s úplným rozsahom a bokmi pevne dole.',
    'Pauza v krajnom pokrčení bez zdvíhania panvy.',
    'Jednonožný variant, ak jedna strana vždy zlyhá ako prvá.',
    'Ťažších 8–12 opakovaní až vtedy, keď sú podložka a os stroja rovnaké na každom tréningu.',
  ],
  programming:
    'Izolácia po predklone v bokoch, nie náhrada mŕtveho ťahu: 2–4 série po 8–15 opakovaní. Naskenuj skutočný stroj na zakopávanie v ľahu, aby sa otvoril tento identifikátor, nie zakopávanie v sede. Ak minulý týždeň panva plávala, napíš to do poznámky LIFTAG-u a udrž záťaž poctivú, kým zostane dole.',
  equipmentAlternatives: [
    {
      slug: 'machine-seated-leg-curl',
      name: 'Zakopávanie v sede na stroji',
      note: 'Zachová objem pokrčenia kolien, keď sa na stroj v ľahu čaká.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic curl',
      note: 'Nemáš stroj na zakopávanie. Ukotvi päty a ovládni spúšťanie.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Základná náhrada pohybu v bokoch, ak sú obe stanovištia na zakopávanie obsadené.',
    },
  ],
  faqs: [
    {
      question: 'Zakopávanie v ľahu alebo v sede?',
      answer:
        'V ľahu zostávajú boky vystreté. V sede sú približne v 90° a zadné stehná sa natiahnu viac. Obe možnosti sú poctivá práca v pokrčení kolien, ale nejde o rovnaký cvik. Zaznamenaj ten, na ktorom si skutočne ležal alebo sedel.',
    },
  ],
  relatedSlugs: [
    'nordic-hamstring-curl',
    'barbell-romanian-deadlift-rdl',
    'machine-seated-leg-curl',
    'glute-ham-raise',
  ],
} satisfies ExerciseOverlay
