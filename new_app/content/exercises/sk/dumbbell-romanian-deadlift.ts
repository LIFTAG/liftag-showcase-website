import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-romanian-deadlift',
  metaDescription:
    'Rumunský mŕtvy ťah s jednoručkami: hĺbka predklonu, uhol kolien a samostatné zaznamenávanie oproti RDL s veľkou činkou v LIFTAG.',
  steps: [
    'Postav sa vzpriamene s jednoručkami pred stehnami. Mierne pokrč kolená a tento uhol drž.',
    'Tlač boky dozadu. Jednoručky sa kĺžu popri stehnách a potom predkoleniach; chrbtica zostáva dlhá.',
    'Zastav, keď hamstringy nepustia ďalej — často v polovici predkolenia — nie podľa toho, či sa závažia ešte dostanú k zemi.',
    'Tlač boky dopredu a postav sa. Stiahni sedacie svaly a nekrč ramená.',
  ],
  mistakes: [
    {
      title: 'Drepáš jednoručky nadol',
      body: 'Keď kolená cestujú dopredu, stratil si predklon. Tlač boky, nie kolená.',
    },
    {
      title: 'Pri každom opakovaní naháňaš podlahu',
      body: 'Jednoručky môžu prejsť okolo chodidiel, ale často je to zaoblený chrbát, nie väčší účinok na hamstringy. Zastav pri napätí.',
    },
    {
      title: 'Zapisuješ ho ako RDL s veľkou činkou',
      body: 'Náradie aj rekord sú iné. Zachovaj tento cvik, hoci na videu vyzerá predklon podobne.',
    },
    {
      title: 'Necháš jednoručky odísť dopredu',
      body: 'Keď visia pred špičkami, séria zaťaží chrbát. Drž ich tak blízko, aby sa oblečenia jemne dotýkali.',
    },
  ],
  variations: [
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Väčšia záťaž a os pred nohami; obvyklý ďalší krok.',
    },
    {
      slug: 'barbell-good-morning',
      name: 'Good morning s veľkou činkou',
      note: 'Os na chrbte, ešte väčší predklon a oveľa menšia váha.',
    },
    {
      slug: 'smith-machine-romanian-deadlift',
      name: 'Rumunský mŕtvy ťah na Smithovom stroji',
      note: 'Vedená dráha, keď nechceš vyvažovať dve jednoručky.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic hamstring curl',
      note: 'Hamstringy cez ohyb kolena namiesto predklonu.',
    },
  ],
  progressions: [
    'Predklon v bokoch s palicou pozdĺž chrbtice.',
    'Ľahké jednoručky do opakovateľného zastavenia v polovici predkolenia.',
    'Pridaj záťaž, keď sa uhol chrbta počas série nemení.',
    'Pauza v natiahnutí alebo malý deficit, keď jednoručky už ľahko prejdú popri podlahe.',
  ],
  programming:
    'Hlavný predklon s jednoručkami: tri až štyri série po 6–12. Bude výrazne ľahší než RDL s veľkou činkou, čo je očakávané. Ak LIFTAG kreslí tieto série do grafu veľkej činky, zvolil si nesprávny cvik. Cvik patrí na cesty a domáce tréningy, nie pod klasický mŕtvy ťah.',
  equipmentAlternatives: [
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Použi os, keď jednoručky nemajú dosť váhy.',
    },
    {
      slug: 'kettlebell-deadlift',
      name: 'Kettlebell mŕtvy ťah',
      note: 'Predklon so štartom zo zeme, keď máš iba kettlebell a chceš mŕtvy ťah, nie RDL.',
    },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'barbell-good-morning',
    'nordic-hamstring-curl',
    'conventional-deadlift',
  ],
} satisfies ExerciseOverlay
