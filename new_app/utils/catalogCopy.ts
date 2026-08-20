import type { CatalogLocale } from './catalogLocale'

export interface CatalogChrome {
  searchPlaceholder: string
  searchAria: string
  clearSearchAria: string
  cancel: string
  all: string
  browseMusclesAria: string
  resultsAria: string
  loadError: string
  tryAgain: string
  thisFilter: string
  clearSearch: string
  showMore: (remaining: number) => string
  statExercises: (n: number) => string
  statMachines: (n: number) => string
  statMuscles: (n: number) => string
  indexEyebrow: string
  indexTitleLine1: string
  indexTitleLime: string
  indexLead: string
  indexSeoTitle: string
  indexSeoDescription: string
  indexWebPageName: string
  indexCta: string
  noMatchLead: string
  breadcrumbExercises: string
  inTheApp: string
  getLiftag: string
  logCopy: (name: string) => string
  machinesHeading: string
  machinesAria: string
  howToAria: string
  howToHeading: (name: string) => string
  faqsHeading: string
  faqsAria: string
  relatedAria: string
  relatedHeading: (muscle: string) => string
  ctaTrack: (name: string) => string
  libraryCrumb: string
  videoName: (name: string) => string
  howToName: (name: string) => string
  machineAlt: (machine: string, exercise: string) => string
  musclesAria: string
  stepName: (index: number) => string
  compound: string
  isolation: string
  weightReps: string
  time: string
  calories: string
}

const EN: CatalogChrome = {
  searchPlaceholder: 'Search exercises…',
  searchAria: 'Search exercises',
  clearSearchAria: 'Clear search',
  cancel: 'Cancel',
  all: 'All',
  browseMusclesAria: 'Browse by muscle group',
  resultsAria: 'Exercises',
  loadError: 'The exercise library did not load.',
  tryAgain: 'Try again',
  thisFilter: 'this filter',
  clearSearch: 'Clear search',
  showMore: remaining => `Show more (${remaining} left)`,
  statExercises: n => `${n} exercises`,
  statMachines: n => `${n} machines`,
  statMuscles: n => `${n} muscle groups`,
  indexEyebrow: 'EXERCISE LIBRARY · LIFTAG',
  indexTitleLine1: 'Every machine.',
  indexTitleLime: 'Every lift.',
  indexLead:
    'The same exercise catalog that powers the LIFTAG app: setup photos, instruction videos, and the muscles behind every movement.',
  indexSeoTitle: 'Exercise Library | Gym Exercises by Muscle & Machine | LIFTAG',
  indexSeoDescription:
    'Browse the LIFTAG exercise library: gym exercises by muscle group and machine, with setup photos, instruction videos, and the muscles each lift works.',
  indexWebPageName: 'LIFTAG Exercise Library',
  indexCta: 'Track any of these exercises',
  noMatchLead: 'No exercises match',
  breadcrumbExercises: 'EXERCISES',
  inTheApp: 'IN THE APP',
  getLiftag: 'Get LIFTAG free',
  logCopy: name =>
    `Scan the machine's QR tag and this exercise opens ready to log: sets, rest timer, PRs, and your whole progression for ${name}.`,
  machinesHeading: 'FOUND ON THESE MACHINES',
  machinesAria: 'Machines for this exercise',
  howToAria: 'How to perform',
  howToHeading: name => `HOW TO DO ${name.toUpperCase()}`,
  faqsHeading: 'FREQUENTLY ASKED QUESTIONS',
  faqsAria: 'Frequently asked questions',
  relatedAria: 'Related exercises',
  relatedHeading: muscle => `MORE ${muscle.toUpperCase()} EXERCISES`,
  ctaTrack: name => `Track ${name}`,
  libraryCrumb: 'Exercise Library',
  videoName: name => `${name} instructions`,
  howToName: name => `How to do ${name}`,
  machineAlt: (machine, exercise) => `${machine} — gym machine for ${exercise}`,
  musclesAria: 'Muscles worked',
  stepName: index => `Step ${index + 1}`,
  compound: 'Compound',
  isolation: 'Isolation',
  weightReps: 'Weight × reps',
  time: 'Time',
  calories: 'Calories',
}

const SK: CatalogChrome = {
  searchPlaceholder: 'Hľadať cviky…',
  searchAria: 'Hľadať cviky',
  clearSearchAria: 'Vymazať hľadanie',
  cancel: 'Zrušiť',
  all: 'Všetko',
  browseMusclesAria: 'Prehliadať podľa svalovej partie',
  resultsAria: 'Cviky',
  loadError: 'Knižnica cvikov sa nenačítala.',
  tryAgain: 'Skúsiť znova',
  thisFilter: 'tento filter',
  clearSearch: 'Vymazať hľadanie',
  showMore: remaining => `Zobraziť ďalšie (zostáva ${remaining})`,
  statExercises: n => `${n} cvikov`,
  statMachines: n => `${n} strojov`,
  statMuscles: n => `${n} svalových partií`,
  indexEyebrow: 'KNIŽNICA CVIKOV · LIFTAG',
  indexTitleLine1: 'Každý stroj.',
  indexTitleLime: 'Každý cvik.',
  indexLead:
    'Rovnaký katalóg cvikov ako v aplikácii LIFTAG: fotky nastavenia, inštruktážne videá a svaly za každým pohybom.',
  indexSeoTitle: 'Knižnica cvikov | Cviky podľa svalu a stroja | LIFTAG',
  indexSeoDescription:
    'Prehliadaj knižnicu cvikov LIFTAG: posilňovňové cviky podľa svalovej partie a stroja, s fotografiami nastavenia, inštruktážnymi videami a svalmi, ktoré každý cvik zapája.',
  indexWebPageName: 'Knižnica cvikov LIFTAG',
  indexCta: 'Sleduj ktorýkoľvek z týchto cvikov',
  noMatchLead: 'Žiadne cviky nesedia na',
  breadcrumbExercises: 'CVIKY',
  inTheApp: 'V APLIKÁCII',
  getLiftag: 'Stiahnuť LIFTAG zadarmo',
  logCopy: name =>
    `Naskenuj QR tag na stroji a tento cvik sa otvorí pripravený na logovanie: série, časovač odpočinku, osobné rekordy a celý progres pre ${name}.`,
  machinesHeading: 'NÁJDEŠ NA TÝCHTO STROJOCH',
  machinesAria: 'Stroje pre tento cvik',
  howToAria: 'Ako cvičiť',
  howToHeading: name => `AKO CVIČIŤ ${name.toLocaleUpperCase('sk')}`,
  faqsHeading: 'ČASTO KLADENÉ OTÁZKY',
  faqsAria: 'Často kladené otázky',
  relatedAria: 'Súvisiace cviky',
  relatedHeading: muscle => `ĎALŠIE CVIKY — ${muscle.toLocaleUpperCase('sk')}`,
  ctaTrack: name => `Sleduj ${name}`,
  libraryCrumb: 'Knižnica cvikov',
  videoName: name => `Inštrukcie: ${name}`,
  howToName: name => `Ako cvičiť ${name}`,
  machineAlt: (machine, exercise) => `${machine} — stroj pre ${exercise}`,
  musclesAria: 'Zapojené svaly',
  stepName: index => `Krok ${index + 1}`,
  compound: 'Komplexný',
  isolation: 'Izolačný',
  weightReps: 'Váha × opakovania',
  time: 'Čas',
  calories: 'Kalórie',
}

export function catalogChrome(locale: CatalogLocale): CatalogChrome {
  return locale === 'sk' ? SK : EN
}
