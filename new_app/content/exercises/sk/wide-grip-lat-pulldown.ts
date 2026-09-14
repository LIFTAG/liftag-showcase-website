import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'wide-grip-lat-pulldown',
  metaDescription:
    'Sťahovanie kladky širokým úchopom: poloha rúk, kratší rozsah a samostatné rekordy oproti bežnému sťahovaniu v LIFTAG.',
  steps: [
    'Nastav sedadlo a oporu stehien ako pri bežnom sťahovaní kladky. Ruky daj k ohybom dlhej osi, nie úplne na konce, ak by to ničilo zápästia.',
    'Začni s dlhými rukami. Široký úchop už skracuje rozsah, preto ho ďalej neskracuj pokrčenými lakťami v hornej polohe.',
    'Ťahaj os k hornej časti hrudníka s lakťami von a nadol. Rovnaké pritiahnutie ako pri úzkom úchope nedosiahneš; je to v poriadku.',
    'Ak os bez náklonu 45° nedostaneš k hrudníku, úchop je príliš široký alebo zásobník príliš ťažký. Oprav jedno z toho, nie záznam.',
  ],
  mistakes: [
    {
      title: 'Ruky dáš na objímky a trhneš',
      body: 'Extra široký a ťažký variant dráždi rameno, nie je lepším cvikom na latissimá. Posuň úchop dovnútra a ovládni dráhu.',
    },
    {
      title: 'Zapisuješ ho ako bežné sťahovanie kladky',
      body: 'Na grafe širokého úchopu budeš vyzerať silnejší a na cviku, ktorý skutočne sleduješ, slabší. Zachovaj tento cvik.',
    },
    {
      title: 'Meníš ho na široký ťah za krk',
      body: 'Široký úchop a ťah za krk sú dva stresory naraz. Ťahaj k hrudníku, ak naozaj nemáš konkrétny dôvod a potrebnú pohyblivosť.',
    },
    {
      title: 'Hore robíš polovičné opakovania, lebo natiahnutie je slabé',
      body: 'Široký úchop už rozsah skracuje. Využi aj natiahnutie, ktoré zostalo. Odpočívať s lakťami v 90° je iba pauzovaný cheat.',
    },
  ],
  variations: [
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie kladky na chrbát',
      note: 'Úchop približne na šírku ramien, väčší rozsah a základná verzia.',
    },
    {
      slug: 'close-grip-lat-pulldown',
      name: 'Sťahovanie kladky úzkym úchopom',
      note: 'Druhý extrém úchopu; v jednom grafe medzi nimi neskáč.',
    },
    {
      slug: 'wide-grip-pull-up',
      name: 'Zhyb širokým úchopom',
      note: 'Verzia na hrazde, náročnejšia, ale s rovnakou myšlienkou.',
    },
    {
      slug: 'pull-up',
      name: 'Zhyb',
      note: 'Bežný zhyb nadhmatom, ak je široký úchop na hrazde priveľký.',
    },
  ],
  progressions: [
    'Bežné sťahovanie kladky, kým sa dotyk hrudníka nestane istým.',
    'Široký úchop s ľahším kolíkom než pri bežnom sťahovaní; plné natiahnutie a os k hrudníku.',
    'Pridaj váhu, keď na dokončenie už nepotrebuješ náklon.',
    'Zhyby širokým úchopom, ak je skutočným cieľom hrazda, nie rekord na zásobníku.',
  ],
  programming:
    'Široký úchop používaj ako druhý zvislý ťah, nie ako nečakanú výmenu v hlavný deň sťahovania. Urob tri až štyri série po 8–12 s menšou váhou než pri bežnom úchope. Ak LIFTAG ukáže rekord získaný užším úchopom, zapísal si nesprávny cvik.',
  equipmentAlternatives: [
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie kladky na chrbát',
      note: 'Základná voľba, keď široký úchop dráždi ramená alebo zápästia.',
    },
    {
      slug: 'wide-grip-pull-up',
      name: 'Zhyb širokým úchopom',
      note: 'Prejdi na hrazdu, keď je sťahovanie kladky ľahké.',
    },
  ],
  relatedSlugs: ['lat-pulldown', 'close-grip-lat-pulldown', 'wide-grip-pull-up', 'pull-up'],
} satisfies ExerciseOverlay
