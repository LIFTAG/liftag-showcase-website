import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'nordic-hamstring-curl',
  metaDescription:
    'Nordic hamstring curl: poloha bokov, kontrola excentrickej fázy a zaznamenávanie asistovaných aj neasistovaných opakovaní v LIFTAG.',
  steps: [
    'Zaisti päty — na Nordic podložke, pod naloženou osou alebo pomocou partnera, ktorý ich nepustí. Kľakni si vzpriamene na podložku.',
    'Stiahni sedacie svaly, aby boky zostali otvorené. Ruky maj pripravené na zachytenie.',
    'Spúšťaj sa k podlahe predlžovaním hamstringov. Ak sa boky zlomia, vykonávaš skôr predklon v bedrách než Nordic.',
    'Zachyť sa rukami a odtlač sa len natoľko, aby si zmenil smer — alebo sa vytiahni späť, ak už zvládaš koncentrickú fázu.',
    'Sériu ukonči, keď sa kontrolované spúšťanie zmení na pád.',
  ],
  mistakes: [
    {
      title: 'Lámanie v bokoch',
      body: 'Sadanie smerom k pätám zmení cvik na zlý good morning. Boky zostávajú vystreté; pracujú kolená.',
    },
    {
      title: 'Ovládaš iba hornú štvrtinu pohybu',
      body: 'Pohyb o dva palce nie je Nordic. Predĺž excentrickú fázu, aj keby si sa na návrat musel odtlačiť od podlahy.',
    },
    {
      title: 'Nemáš plán, ako sa zachytiť',
      body: 'Ruky idú na podlahu skôr než tvár. Pýcha nie je progresia.',
    },
    {
      title: 'Asistované opakovania s gumou zapisuješ ako neasistované',
      body: 'Do poznámky série v LIFTAG napíš „guma“ alebo „odraz“. Falošný neasistovaný rekord je dôvod, prečo bude ďalší týždeň príliš ťažký.',
    },
  ],
  variations: [
    {
      slug: 'glute-ham-raise',
      name: 'Glute ham raise',
      note: 'Verzia na GHD s koncentrickou fázou, ktorú môžeš skutočne trénovať.',
    },
    {
      slug: 'machine-lying-leg-curl',
      name: 'Zakopávanie v ľahu na stroji',
      note: 'Zaťažiteľná flexia kolena, keď ešte nie si pripravený padať smerom k podlahe.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Práca hamstringov v predklone, ktorú môžeš zaťažiť od prvého dňa.',
    },
    {
      slug: 'machine-seated-leg-curl',
      name: 'Zakopávanie v sede na stroji',
      note: 'Flexia kolena v sede, ktorú sa dávkuje ľahšie než Nordicy.',
    },
  ],
  progressions: [
    'Dlhé excentrické fázy s dopomocou odtlačením sa rukami od podlahy.',
    'Guma okolo hrudníka alebo mierne klesajúca podložka, kým dokážeš spúšťanie za uhol 45°.',
    'Neasistované excentrické opakovania so zachytením rukami.',
    'Celé Nordicy s koncentrickou fázou. To je dlhodobý cieľ, nie úloha na druhý týždeň.',
  ],
  programming:
    'Ber ho ako náročný doplnkový cvik: 2–4 série po 3–6 poctivých opakovaní, nie 12 nečistých. Zaraď ho po hlavnom cviku v predklone alebo na druhý hamstringový deň. Svalovica môže trvať dlho — ak si si minulý týždeň zapísal „nevedel som chodiť“, nepridávaj sériu.',
  equipmentAlternatives: [
    {
      slug: 'glute-ham-raise',
      name: 'Glute ham raise',
      note: 'Použi GHD, ak ho posilňovňa má a chceš skutočnú koncentrickú fázu.',
    },
    {
      slug: 'machine-lying-leg-curl',
      name: 'Zakopávanie v ľahu na stroji',
      note: 'Predvolená náhrada, keď nemáš oporu pre päty ani partnera.',
    },
  ],
  faqs: [
    {
      question: 'Nahrádzajú Nordicy zakopávanie?',
      answer:
        'Nie. Nordicy sú náročná excentrická záťaž hamstringov v dlhej svalovej dĺžke. Zakopávanie umožňuje dávkovať flexiu kolena bez pádu. Mnohé programy používajú oba cviky; zapisuj ich ako odlišné cviky.',
    },
    {
      question: 'Ako mám zapísať Nordic s odrazom?',
      answer:
        'Použi rovnaký cvik a poznač „odraz“ alebo „guma“. Keď sa dokážeš vytiahnuť späť bez pomoci rúk, vtedy máš rekord — nie pri prvom prežitom excentrickom opakovaní s odrazom.',
    },
  ],
  relatedSlugs: [
    'glute-ham-raise',
    'barbell-romanian-deadlift-rdl',
    'machine-lying-leg-curl',
    'machine-seated-leg-curl',
    'barbell-good-morning',
  ],
} satisfies ExerciseOverlay
