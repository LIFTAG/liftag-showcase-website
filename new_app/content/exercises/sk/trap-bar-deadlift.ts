import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'trap-bar-deadlift',
  metaDescription:
    'Mŕtvy ťah s trap barom: vysoké a nízke rukoväte, štartová poloha a zaznamenávanie ťahu s hex osou v LIFTAG bez miešania s klasickým mŕtvym ťahom.',
  steps: [
    'Vstúp do trap baru a umiestni stred chodidiel pod rukoväte. Ak s cvikom začínaš, najprv použi vysoké rukoväte.',
    'Uchop obe rukoväte rovnomerne, nastav chrbát a mysli na „odtlačenie podlahy nohami“ rovnako ako na samotné ťahanie.',
    'Postav sa vzpriamene. Záver je pokojné vystretie, nie pokrčenie ramien.',
    'Spúšťaj s rovnakým predklonom v bedrách, aký si použil na začiatku. V rušnej posilňovni po vystretí nepúšťaj kotúče z výšky.',
  ],
  mistakes: [
    {
      title: 'Vysoké a nízke rukoväte považuješ za rovnaký rekord',
      body: 'Nízke rukoväte predstavujú iný cvik. V LIFTAG si výšku poznač, inak cez noc „stratíš“ 20 kg.',
    },
    {
      title: 'Meníš ho na drep so zaguľateným chrbtom',
      body: 'Trap bar dovolí sadnúť si viac než klasický mŕtvy ťah. Nedovolí však zrútiť driekovú chrbticu.',
    },
  ],
  variations: [
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Rovná os a pre väčšinu ľudí náročnejší štart.',
    },
    {
      slug: 'trap-bar-romanian-deadlift',
      name: 'Rumunský mŕtvy ťah s trap barom',
      note: 'Vzor v predklone s tou istou osou.',
    },
  ],
  progressions: [
    'Trap bar s vysokými rukoväťami.',
    'Nízke rukoväte, keď je štart čistý.',
    'Deficit alebo výskoky až vtedy, keď je základný ťah automatický.',
  ],
  programming:
    'Výborný hlavný ťah pre športovcov aj pre cvičencov, ktorým klasický mŕtvy ťah dráždi chrbát. Zapisuj výšku rukovätí. V ťažké dni urob 3–5 sérií po 3–6 opakovaní, pri objemovom predklone použi viac opakovaní.',
  relatedSlugs: ['conventional-deadlift', 'trap-bar-romanian-deadlift', 'barbell-back-squat'],
} satisfies ExerciseOverlay
