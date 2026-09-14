import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'push-up',
  metaDescription:
    'Klik: nastavenie, jednoduchšie varianty a zaznamenávanie tlaku s vlastnou hmotnosťou v LIFTAG-u, aby sa nestratil vedľa bench pressu.',
  steps: [
    'Ruky polož pod ramená alebo mierne širšie a telo drž v jednej línii od hlavy po päty.',
    'Spúšťaj sa, kým nebude hrudník blízko podlahy a lakte približne 45° od trupu.',
    'Odtlač podlahu od seba bez dvíhania bokov do striešky a bez prehnutia krížov.',
  ],
  mistakes: [
    {
      title: 'Polovičné opakovania hore',
      body: 'Hrudník smeruje k podlahe alebo tak blízko, ako to dokážeš udržať. Čiastočné kliky patria k regresii, nie k falošnému objemu.',
    },
    {
      title: 'Nezaznamenávanie, lebo sú to „iba kliky“',
      body: 'Ak sú v tréningu, patria aj do LIFTAG-u. Aj vlastná hmotnosť sa postupne sčítava.',
    },
  ],
  variations: [
    {
      slug: 'knee-push-up',
      name: 'Klik na kolenách',
      note: 'Regresia, pri ktorej zostane zachovaný úplný rozsah pre hrudník.',
    },
    { slug: 'diamond-push-up', name: 'Diamantový klik', note: 'Užší úchop a väčší dôraz na tricepsy.' },
    {
      slug: 'decline-push-up',
      name: 'Klik s nohami vyššie',
      note: 'Ťažší variant s chodidlami na vyvýšení.',
    },
  ],
  progressions: [
    'Kliky o stenu alebo na kolenách.',
    'Plné kliky v sériách po 8–15 opakovaní.',
    'Deficit, pauza alebo záťažová vesta. Pridanú záťaž zaznamenaj.',
  ],
  programming:
    'Kliky používaj ako hlavný tlak na cestách alebo ako zakončenie po benči. Zaznamenávaj ich. LIFTAG ukáže, či tvoj „ľahký“ objem klikov skutočne klesá.',
  relatedSlugs: ['knee-push-up', 'barbell-bench-press', 'chest-dips'],
} satisfies ExerciseOverlay
