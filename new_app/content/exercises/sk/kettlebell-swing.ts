import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'kettlebell-swing',
  metaDescription:
    'Švih s kettlebellom: nadhodenie medzi nohami, prudké otvorenie bokov a zaznamenávanie ruských švihov v LIFTAG-u bez zámeny za drepy alebo tlaky nad hlavou.',
  steps: [
    'Kettlebell polož približne jednu stopu pred seba. Predkloň sa v bokoch, uchop ho a nadhod ho medzi stehná ako prudký spätný pohyb; nezačínaj drepom.',
    'Predkolenia drž takmer zvislo, päty na podlahe a ruky vystreté. Kettlebell sa pohybuje vysoko pri vnútornej strane stehien, nie pri kolenách.',
    'Postav sa prudko. Boky vymrštia kettlebell, ruky fungujú ako laná. Pri ruskom švihu ide približne do výšky hrudníka alebo tesne pod ramená.',
    'Nechaj ho vyplávať a potom sa predkloň v bokoch, aby sa vrátil medzi stehná. Veď ho rukami; nesadaj do drepu, aby si ho zachytil.',
    'Kettlebell odlož rovnakým spôsobom, akým si ho zdvihol. Po ťažkej sérii sa nad nehybnou pomôckou nehrb.',
  ],
  mistakes: [
    {
      title: 'Drepovanie švihu',
      body: 'Kolená vystreľujú dopredu a kettlebell visí nízko, takže predklon v bokoch si zmenil na zlý goblet drep. Posúvaj boky dozadu, nie nadol.',
    },
    {
      title: 'Zdvihanie kettlebellu rukami ako predpažovanie',
      body: 'Ak cvik vykonávajú ramená, boky sa prudko neotvorili. Použi ľahší kettlebell, výraznejšie otvorenie bokov a pokojnejšie ruky.',
    },
    {
      title: 'Prílišné prehnutie krížov hore',
      body: 'Postav sa vzpriamene. Pohyb v bokoch dokončujú sedacie svaly. Zakláňanie je falošné dotiahnutie a problém pre driek.',
    },
    {
      title: 'Zaznamenávanie amerických švihov nad hlavou bez poznámky',
      body: 'Švih nad hlavu je iná zručnosť aj iná záťaž. Tento identifikátor je predvolene ruský švih do výšky hrudníka. Ak ideš nad hlavu, napíš to do poznámky série, inak budeš naháňať nesprávne číslo.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-swing',
      name: 'Švih s jednoručkou',
      note: 'Rovnaké nadhodenie, keď nemáš kettlebell; drž jednoručku za jeden koniec.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Pomalý predklon v bokoch, ktorý môžeš zaťažiť, keď nie je cieľom výbušnosť.',
    },
    {
      slug: 'cable-pull-through',
      name: 'Predklon s kladkou medzi nohami',
      note: 'Predklon v bokoch s kladkou, keď nemáš kettlebell.',
    },
    {
      slug: 'kettlebell-deadlift',
      name: 'Mŕtvy ťah s kettlebellom',
      note: 'Najprv si osvoj zdvih a predklon, až potom pridaj rýchlosť.',
    },
  ],
  progressions: [
    'Mŕtvy ťah s kettlebellom, kým sa predklon v bokoch nestane automatickým.',
    'Nácvik nadhodenia a švihy v krátkom rozsahu do výšky hrudníka.',
    'Pracovné série po 10–20 opakovaní s vyplávaním hore a pokojným chrbtom.',
    'Ťažší kettlebell alebo EMOM až po odstránení drepového vzorca.',
  ],
  programming:
    'Ide o výbušnosť, nie o pomalé vydretie série. 3–5 sérií po 10–20 opakovaní alebo krátke EMOM bloky, pričom technika hip hinge zostáva čistá aj v poslednom opakovaní. Sériu ukonči, keď sa zmení na drep alebo predpažovanie. Zaznamenaj hmotnosť kettlebellu; pri prechode z ruského švihu na švih nad hlavu potrebuje graf poznámku, inak bude v štvrtom týždni klamať.',
  equipmentAlternatives: [
    {
      slug: 'dumbbell-swing',
      name: 'Švih s jednoručkou',
      note: 'Náhrada na cesty alebo do hotelovej posilňovne. Rovnaké prudké otvorenie bokov.',
    },
    {
      slug: 'cable-pull-through',
      name: 'Predklon s kladkou medzi nohami',
      note: 'Predklon v bokoch zachováš aj pri odľahčení výbušnej práce.',
    },
  ],
  faqs: [
    {
      question: 'Do výšky hrudníka alebo nad hlavu?',
      answer:
        'Predvolený variant tohto identifikátora je ruský švih približne do výšky hrudníka. Americký švih nad hlavu kladie väčšie nároky na ramená a mení použiteľnú záťaž. Môže zostať tu s poznámkou „OH“, no ruské čísla s ním nemiešaj potichu.',
    },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'dumbbell-swing',
    'barbell-hip-thrust',
    'cable-pull-through',
    'conventional-deadlift',
  ],
} satisfies ExerciseOverlay
