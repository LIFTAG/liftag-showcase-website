import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'wide-grip-pull-up',
  metaDescription:
    'Zhyb širokým úchopom: primeraná šírka, úplný vis a dôvod, prečo nejde o rekord v bežných zhyboch v LIFTAG.',
  steps: [
    'Zaves sa nadhmatom s rukami iba mierne širšími než ramená. Extrémne široký úchop skracuje dráhu a dráždi ramená; neznamená „viac latissimusov“.',
    'Nastav lopatky, spevni trup a ťahaj lakte nadol, kým sa horná časť hrudníka približuje k hrazde.',
    'Dostaň bradu zreteľne nad hrazdu bez naťahovania krku. Klesni do pokojného visu; posledný centimeter dolu sa stále počíta.',
    'Nohy nechaj pokojné. Ak sa musíš dostať hore kipom, nejde o tento cvik.',
  ],
  mistakes: [
    {
      title: 'Ruky máš na koncoch hrazdy',
      body: 'Širší úchop skracuje dráhu a môže dráždiť ramená. Zostaň len trochu širšie než pri bežnom zhybe, nie v polohe kríža.',
    },
    {
      title: 'Zapisuješ ich ako bežné zhyby',
      body: 'Sú náročnejšie a zvyčajne urobíš menej opakovaní. Zachovaj tento cvik, inak graf bežných zhybov bude vyzerať, akoby si sa zhoršil.',
    },
    {
      title: 'Bradu prestrčíš iba o dva centimetre a vysunieš krk',
      body: 'Hrudník smeruje k hrazde. Ak sa tam nedostaneš, použi asistenciu alebo užší úchop.',
    },
    {
      title: 'Vynecháš vis, pretože šírka už bolí',
      body: 'Potom je úchop príliš široký. Posuň ruky dovnútra, kým bude úplný vis poctivý.',
    },
  ],
  variations: [
    {
      slug: 'pull-up',
      name: 'Zhyb',
      note: 'Nadhmat približne na šírku ramien, väčší rozsah a zvyčajne viac opakovaní.',
    },
    {
      slug: 'chin-up',
      name: 'Zhyb podhmatom',
      note: 'Podhmat s väčším zapojením bicepsov; často ľahší striktný vertikálny ťah.',
    },
    {
      slug: 'wide-grip-lat-pulldown',
      name: 'Sťahovanie kladky širokým úchopom',
      note: 'Rovnaká myšlienka šírky s možnosťou pridávať malé kroky záťaže.',
    },
    {
      slug: 'assisted-pull-up',
      name: 'Asistovaný zhyb',
      note: 'Použi ho, kým nie sú čisté série širokým úchopom po 4–5 opakovaní.',
    },
  ],
  progressions: [
    'Najprv striktné zhyby s úchopom na šírku ramien. Šírka je variácia, nie východiskový bod.',
    'Asistované zhyby širokým úchopom alebo sťahovanie kladky v rovnakej polohe rúk.',
    'Striktné série širokým úchopom po 4–8 opakovaní.',
    'Opasok pridaj až vtedy, keď vieš opakovane zvládnuť úplný vis aj prestrčenie brady. Pridanú záťaž zapíš.',
  ],
  programming:
    'Ide o náročnejší vertikálny ťah, nie o kúzlo šírky: 3–5 sérií s menším počtom opakovaní než pri bežnom zhybe. V jeden deň neprogramuj ťažké zhyby širokým úchopom aj ťažké bežné zhyby. Zaťaženú verziu stále zapisuj sem s uvedenou kotúčovou záťažou.',
  relatedSlugs: ['pull-up', 'chin-up', 'wide-grip-lat-pulldown', 'assisted-pull-up'],
} satisfies ExerciseOverlay
