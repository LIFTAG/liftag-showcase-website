import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'conventional-deadlift',
  metaDescription:
    'Klasický mŕtvy ťah: nastavenie, časté chyby a zaznamenávanie ťahov, rekordov a variácií v LIFTAG bez miešania sumo ani RDL.',
  steps: [
    'Postav sa tak, aby bola os nad stredom chodidiel, predkolenia blízko osi a úchop tesne zvonka nôh.',
    'Klesni do predklonu, nastav chrbát a vytiahni vôľu z osi skôr, než sa odlepí od zeme.',
    'Odtlač podlahu. Os zostáva blízko tela a boky s ramenami stúpajú spolu.',
    'Zamkni pohyb vzpriameným postojom a stiahnutím sedacích svalov; nezakláňaj sa do falošného záveru.',
    'Spúšťaj kontrolovane. Pri nácviku štartu resetuj každé opakovanie; dotyk bez položenia používaj len podľa programu.',
  ],
  mistakes: [
    {
      title: 'Trhneš osou skôr, než odstrániš vôľu',
      body: 'Kotúče zacinkajú, os vyskočí a chrbát sa zaokrúhli. Najprv vytiahni vôľu, potom zdvihni váhu.',
    },
    {
      title: 'Boky vystrelia ako prvé',
      body: 'Zo zeme potom vznikne takmer vystretý ťah. Kým os neprejde kolenami, nechaj hrudník a boky stúpať spolu.',
    },
    {
      title: 'Miešaš klasický, sumo a RDL do jedného cviku',
      body: 'Sú to odlišné rekordy. LIFTAG má samostatné cviky v katalógu; používaj ich, inak ťa graf v šiestom týždni oklame.',
    },
    {
      title: 'Používaš trhačky pri každej rozcvičke',
      body: 'Ak práve netrénuješ úchop, šetri trhačky na vrchné série.',
    },
  ],
  variations: [
    {
      slug: 'sumo-deadlift',
      name: 'Sumo mŕtvy ťah',
      note: 'Širší postoj, väčší podiel bokov a kvadricepsov a pre mnohých kratší rozsah.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap bar osou',
      note: 'Neutrálny úchop, šetrnejší pre chrbát a stále ťažký ťah.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Dôraz na predklon bez štartu zo zeme.',
    },
    {
      slug: 'rack-pull',
      name: 'Rack pull',
      note: 'Skrátený rozsah na preťaženie alebo keď štart zo zeme nie je prioritou.',
    },
  ],
  progressions: [
    'Rumunský a kettlebell mŕtvy ťah, kým sa predklon nestane automatickým.',
    'Klasický ťah zo zeme s resetom po každom opakovaní.',
    'Pridaj záťaž, keď štart zostane pevný vo všetkých pracovných sériách.',
    'Deficit alebo pauza pri kolenách, ak je slabým miestom odlepenie zo zeme.',
  ],
  programming:
    'Mŕtve ťahy si vyberajú daň na regenerácii. Väčšine cvičiacich stačí jeden ťažký deň ťahov a jeden ľahší deň predklonov. Zapisuj pracovné série aj odpočinok — tri až päť minút je bežných. Ak LIFTAG ukáže rekord získaný odrazom alebo trhnutím, pridaj poznámku a budúci týždeň ho nesnaž prekonávať rovnakým spôsobom.',
  equipmentAlternatives: [
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap bar osou',
      note: 'Najlepšia výmena, keď klasický ťah dráždi kríže.',
    },
    {
      slug: 'dumbbell-deadlift',
      name: 'Mŕtvy ťah s jednoručkami',
      note: 'Náhrada na doma alebo na cestách.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Zachovaj predklon, keď odľahčuješ ťah zo zeme.',
    },
  ],
  relatedSlugs: [
    'sumo-deadlift',
    'trap-bar-deadlift',
    'barbell-romanian-deadlift-rdl',
    'barbell-back-squat',
    'barbell-power-clean',
  ],
} satisfies ExerciseOverlay
