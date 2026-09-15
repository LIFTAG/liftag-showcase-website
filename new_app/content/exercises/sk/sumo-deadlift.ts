import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'sumo-deadlift',
  metaDescription:
    'Sumo mŕtvy ťah: postoj, štartová poloha a samostatné zaznamenávanie tohto ťahu v LIFTAG bez miešania s klasickým mŕtvym ťahom.',
  steps: [
    'Zaujmi široký postoj tak, aby paže viseli medzi kolenami. Špičky vytoč natoľko, aby kolená sledovali smer chodidiel.',
    'Sadni si do bokov, nastav chrbát a odstráň vôľu z osi. Osa má byť už pri predkoleniach.',
    'Roztlač podlahu chodidlami a dokonči pohyb vo vzpriamenom stoji. Nevyhadzuj boky dopredu s povoleným chrbtom.',
  ],
  mistakes: [
    {
      title: '„Sumo“ postoj je iba o trochu širší než klasický',
      body: 'Ak paže stále zostávajú vonku od kolien, nejde o sumo. Rozšír postoj alebo vyber iný cvik.',
    },
    {
      title: 'Rekord v sumo zapisuješ ku klasickému mŕtvemu ťahu',
      body: 'Iný postoj znamená iný rekord. Zachovaj tento cvik.',
    },
  ],
  variations: [
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Užší postoj a pre väčšinu ľudí väčší dôraz na chrbát.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap barom',
      note: 'Neutrálny úchop, keď sú boky pri sumo podráždené.',
    },
  ],
  progressions: [
    'Mŕtvy ťah s kettlebellom v širokom postoji.',
    'Sumo z podlahy s resetom po každom opakovaní.',
    'Záťaž pridaj, keď štart vychádza z bokov, nie z krížov.',
  ],
  programming:
    'Ako súťažný štýl ťahu si vyber klasický alebo sumo a druhý používaj ako doplnok. Ak ich každý týždeň striedaš bez plánu, 1RM v LIFTAG bude vyzerať ako šum.',
  relatedSlugs: ['conventional-deadlift', 'trap-bar-deadlift', 'barbell-romanian-deadlift-rdl'],
} satisfies ExerciseOverlay
