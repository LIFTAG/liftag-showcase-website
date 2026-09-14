import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-incline-bench-press',
  metaDescription:
    'Tlak s veľkou činkou na šikmej lavičke: uhol lavičky, nastavenie a samostatné zapisovanie tlaku na hornú časť hrudníka od rovnej lavičky v LIFTAGu.',
  steps: [
    'Nastav lavičku medzi 15° a 45°. Pri vyššom sklone preberú väčšinu práce predné delty.',
    'Činku odober s rovnakým stiahnutím lopatiek a zastrčenými ramenami ako pri rovnom tlaku. Oči maj pod osou.',
    'Spúšťaj na hornú časť hrudníka alebo líniu kľúčnych kostí, nie na rovnaké miesto ako pri rovnej lavičke.',
    'Tlač nahor a mierne dozadu do vystretia. Lakte nenechaj padnúť za lavičku.',
  ],
  mistakes: [
    {
      title: 'Použitie 60° ako šikmej lavičky',
      body: 'To už je tlak nad hlavou s operadlom. Ak chceš precvičiť hrudník, sklon zmenši.',
    },
    {
      title: 'Zapisovanie PR zo šikmej lavičky pod rovný tlak',
      body: 'Zachovaj tento cvik. Miešanie uhlov pokazí oba grafy.',
    },
    {
      title: 'Lakte príliš do strán, až činka dopadne na krk',
      body: 'Dotkni sa hornej časti hrudníka. Ak os smeruje ku krku, lakte sú príliš vysoko.',
    },
  ],
  variations: [
    {
      slug: 'incline-dumbbell-press',
      name: 'Tlak s jednoručkami na šikmej lavičke',
      note: 'Väčší rozsah a samostatná práca paží.',
    },
    {
      slug: 'barbell-bench-press',
      name: 'Tlak s veľkou činkou na rovnej lavičke',
      note: 'Rovná verzia rovnakého pohybového vzoru.',
    },
    {
      slug: 'smith-machine-incline-press',
      name: 'Šikmý tlak na smithovom stroji',
      note: 'Pevná dráha, keď trénuješ sám.',
    },
  ],
  progressions: [
    'Tlak s jednoručkami na šikmej lavičke, kým ti uhol nebude prirodzený.',
    'Tlak s prázdnou osou a pauzou na hornej časti hrudníka.',
    'Záťaž pridaj až vtedy, keď všetky pracovné série zostávajú pri rovnakom uhle lavičky.',
  ],
  programming:
    'Šikmý tlak použi ako hlavný tlak v druhý deň hrudníka alebo ako prvý doplnok po rovnej lavičke. Rob 3–4 série po 5–10 opakovaní. Ak má fitko viac sklonov, uhol lavičky si zapíš do poznámky.',
  equipmentAlternatives: [
    {
      slug: 'incline-dumbbell-press',
      name: 'Tlak s jednoručkami na šikmej lavičke',
      note: 'Predvolená náhrada, keď veľká činka dráždi ramená.',
    },
    {
      slug: 'low-to-high-cable-fly',
      name: 'Rozpažovanie na kladkách zdola nahor',
      note: 'Izolačný objem v rovnakej línii ťahu.',
    },
  ],
  relatedSlugs: ['barbell-bench-press', 'incline-dumbbell-press', 'machine-incline-chest-press'],
  faqs: [],
} satisfies ExerciseOverlay
