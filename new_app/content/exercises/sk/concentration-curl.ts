import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'concentration-curl',
  metaDescription:
    'Koncentrovaný bicepsový zdvih: lakeť opretý o stehno, bez hojdania a samostatné zaznamenávanie jednoručnej izolácie v LIFTAGu oproti zdvihom s jednoručkami v stoji.',
  steps: [
    'Sadni si s nohami naširoko. Lakeť pracovnej ruky opri o vnútornú stranu stehna tesne nad kolenom. Druhou rukou sa môžeš oprieť o druhé koleno.',
    'Nechaj jednoručku visieť dlaňou nahor v úplne vystretej ruke. Nadlaktie je pevný bod a nesmie sa odlepiť od stehna.',
    'Zdvihni jednoručku k plecu, kým sa biceps úplne neskráti. Zápästie drž v jednej línii. Neťahaj jednoručku cez telo do kladivového úchopu.',
    'Spusť ju do úplného vystretia a na chvíľu zastav. Vymeň ruky a obe strany zaznamenaj ako jeden cvik.',
  ],
  mistakes: [
    {
      title: 'Odlepenie lakťa od stehna',
      body: 'Potom ide o zdvih v sede s pridaným divadlom. Lakeť drž na mieste. Ak tam nezostane, jednoručka je príliš ťažká.',
    },
    {
      title: 'Zaznamenávanie ako bicepsový zdvih s jednoručkami v stoji',
      body: 'V tomto cviku zdvihneš menej. Práve o to ide. Použi koncentrovaný zdvih, aby sa izolačná práca nestratila v silnejšom grafe zdvihov v stoji.',
    },
    {
      title: 'Pomoc druhou rukou pri každom opakovaní',
      body: 'Dopomoc pri skutočne poslednom opakovaní je v poriadku. Druhá ruka na zápästí od prvého opakovania však znamená iný cvik. Ak ju potrebuješ, do poznámky napíš „s dopomocou“.',
    },
    {
      title: 'Otáčanie trupu pri dokončení pohybu',
      body: 'Zakláňanie a rotácia, ktorými jednoručku vytiahneš nahor, sú podvádzaný zdvih v stoji vykonaný v sede. Seď pokojne alebo zníž záťaž.',
    },
  ],
  variations: [
    {
      slug: 'incline-dumbbell-curl',
      name: 'Bicepsový zdvih s jednoručkami na šikmej lavičke',
      note: 'Variant v predĺženej polohe, ak chceš natiahnutie, nielen stiahnutie.',
    },
    {
      slug: 'standing-dumbbell-bicep-curl',
      name: 'Bicepsový zdvih s jednoručkami v stoji',
      note: 'Väčšia záťaž, viac priestoru na podvádzanie a obe ruky naraz.',
    },
    {
      slug: 'ez-bar-preacher-curl',
      name: 'Bicepsový zdvih s EZ-činkou na Scottovej lavičke',
      note: 'Podopretý obojručný zdvih, keď chceš namiesto stehna použiť opierku.',
    },
    {
      slug: 'hammer-curls',
      name: 'Kladivové zdvihy',
      note: 'Neutrálny úchop, ak ti podhmat vo vystretej polohe dráždi zápästie.',
    },
  ],
  progressions: [
    'Ľahká jednoručka, lakeť pevne na mieste a úplné vystretie, ktoré zvládneš v sede.',
    'Pracovné série po 10–15 opakovaní na každú ruku s rovnakou polohou lakťa.',
    'V hornej polohe pridaj sekundové stiahnutie a až potom zvyšuj záťaž.',
    'Scottova alebo šikmá lavička ako hlavný bicepsový cvik; tento variant si nechaj na pomalé zakončenie.',
  ],
  programming:
    'Zakončovacia izolácia, nie hlavný bicepsový cvik: 2–4 série po 10–15 opakovaní na každú ruku. Zaznamenaj jednu jednoručku a obe ruky veď ako jeden cvik. Čísla sa nikdy nevyrovnajú zdvihom v stoji, preto používaj tento identifikátor. Pomalé spúšťanie patrí do poznámky série, nie k inému cviku. Oddychuj tak dlho, aby sa druhá ruka nepremenila na hojdanie.',
  faqs: [
    {
      question: 'Môžem si druhou rukou oprieť pracovné zápästie?',
      answer:
        'Nie ako bežný spôsob. Zmyslom je jedna ruka bez pomoci. Ak posledné dve opakovania potrebujú malú dopomoc, dokonči ich a napíš „s dopomocou“, aby si na budúci týždeň nenaháňal takéto číslo. Celá séria s dvoma rukami nie je tento cvik.',
    },
  ],
  relatedSlugs: [
    'incline-dumbbell-curl',
    'standing-dumbbell-bicep-curl',
    'ez-bar-preacher-curl',
    'hammer-curls',
  ],
} satisfies ExerciseOverlay
