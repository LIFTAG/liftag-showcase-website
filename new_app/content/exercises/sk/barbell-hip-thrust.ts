import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-hip-thrust',
  metaDescription:
    'Hip thrust s veľkou činkou: nastavenie lavičky, dotiahnutie pohybu a zaznamenávanie hip thrustov v LIFTAGu bez miešania s glute bridge.',
  steps: [
    'Opri hornú časť chrbta o lavičku. Činku polož cez boky a použi podložku. V hornej polohe majú byť predkolenia takmer kolmé na podlahu.',
    'Spevni stred tela a zatlač pätami do podlahy, kým úplne neotvoríš boky a rebrá zostanú stiahnuté.',
    'Spúšťaj sa pod kontrolou. Kotúče od podlahy neodrážaj; odraz by skrátil rozsah a zmenil cvik.',
  ],
  mistakes: [
    {
      title: 'Prílišné prehnutie v driekovej chrbtici pri dotiahnutí',
      body: 'Pohyb dokončujú sedacie svaly. Ak preberá prácu kríže, stiahni rebrá a zníž záťaž.',
    },
    {
      title: 'Príliš vysoká alebo nízka lavička',
      body: 'Na lavičke má byť horná časť chrbta, nie krk. Nesprávna výška lavičky sťaží každé opakovanie.',
    },
  ],
  variations: [
    {
      slug: 'machine-hip-thrust',
      name: 'Hip thrust na stroji',
      note: 'Rovnaký pohybový vzorec s jednoduchším nastavením.',
    },
    { slug: 'glute-bridge', name: 'Glute bridge', note: 'Varianta na podlahe s kratším rozsahom pohybu.' },
    {
      slug: 'smith-machine-hip-thrust',
      name: 'Hip thrust na Smithovom stroji',
      note: 'Keď nemáš k dispozícii stanovište s podložkou pre voľnú činku.',
    },
  ],
  progressions: [
    'Glute bridge.',
    'Hip thrust s vlastnou hmotnosťou na lavičke.',
    'Veľká činka, keď dotiahnutie zvládneš pevným stiahnutím svalov, nie švihom celého tela.',
  ],
  programming:
    'Hlavný cvik na sedacie svaly: 3–4 série po 6–12 opakovaní. Zaznamenávaj záťaž kotúčov. Ak v iných dňoch používaš stroj na hip thrust, ide o iný cvik a graf tak zostane prehľadný.',
  relatedSlugs: ['machine-hip-thrust', 'glute-bridge', 'barbell-back-squat'],
} satisfies ExerciseOverlay
