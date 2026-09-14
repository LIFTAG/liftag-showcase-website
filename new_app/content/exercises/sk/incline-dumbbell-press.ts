import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'incline-dumbbell-press',
  metaDescription:
    'Tlak s jednoručkami na šikmej lavičke: uhol lavičky, rozsah a zapisovanie práce hornej časti hrudníka v LIFTAGu.',
  steps: [
    'Nastav nízky až stredný sklon. Jednoručky dostaň do pozície rovnakým spôsobom ako pri tlaku na rovnej lavičke.',
    'Začni nad hornou časťou hrudníka. Spúšťaj, kým sú rukoväte vedľa horných prsných svalov, nie pri ušiach.',
    'Tlač nahor a mierne k sebe. Nedovoľ, aby výrazný most v krížoch zmenil šikmú lavičku na rovnú.',
  ],
  mistakes: [
    {
      title: 'Príliš strmý sklon a veľké jednoručky',
      body: 'Predné delty preberú prácu a vykopnutie sa stane nebezpečným. Zníž sklon alebo záťaž.',
    },
    {
      title: 'Zrútenie zápästí',
      body: 'Kĺby prstov smeruj k stropu. Zalomené zápästie v spodnej polohe je spôsob, ako tento cvik ukončiť predčasne.',
    },
  ],
  variations: [
    {
      slug: 'barbell-incline-bench-press',
      name: 'Barbell incline bench press',
      note: 'Väčšia záťaž a menší rozsah pohybu.',
    },
    {
      slug: 'flat-dumbbell-bench-press',
      name: 'Flat dumbbell bench press',
      note: 'Rovnaký vzor pri 0°.',
    },
    {
      slug: 'incline-dumbbell-fly',
      name: 'Incline dumbbell fly',
      note: 'Izolácia na rovnakom uhle.',
    },
  ],
  progressions: [
    'Ľahké tlaky na šikmej lavičke, ktoré dokážeš vykopnúť bez spottera.',
    'Pred pridaním záťaže pridaj pauzu v spodnej polohe.',
  ],
  programming:
    'Spáruj s rovným tlakom alebo fly, nie s ďalším strmým incline cvikom. Rob 3–4 série po 8–12 opakovaní. Ak sklony v posilňovni nie sú označené, číslo otvoru lavičky si zapíš do poznámky.',
  relatedSlugs: [
    'barbell-incline-bench-press',
    'flat-dumbbell-bench-press',
    'incline-dumbbell-fly',
    'high-to-low-cable-fly',
  ],
} satisfies ExerciseOverlay
