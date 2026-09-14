import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'pull-up',
  metaDescription:
    'Zhyb nadhmatom: úchop, úplný vis a samostatné zaznamenávanie striktných, kippingových a zaťažených zhybov v LIFTAG.',
  steps: [
    'Zaves sa na hrazdu nadhmatom, ruky maj o trochu širšie než ramená. Začni znehybneným visom.',
    'Ťahaj hrudník smerom k hrazde. Lakte smerujú nadol, nie dozadu do pokrčených ramien.',
    'Dostaň bradu zreteľne nad hrazdu a potom klesni do úplného visu. Posledný centimeter v dolnej polohe je začiatok ďalšieho opakovania.',
  ],
  mistakes: [
    {
      title: 'Kipuješ pri zázname striktných zhybov',
      body: 'Kipping je iná zručnosť. Ak je v programe strict, zapisuj strict. Kipy si poznač alebo použi iný príslušný cvik.',
    },
    {
      title: 'Bradu sotva prestrčíš cez hrazdu a naťahuješ krk',
      body: 'Hrudník smerom k hrazde je štandard, ak chceš, aby rekord neskôr niečo znamenal.',
    },
    {
      title: 'Nezaznamenávaš negatívne ani asistované opakovania',
      body: 'Asistovaný zhyb je samostatný cvik. Negatívne opakovania môžeš ponechať tu s poznámkou alebo ich zaradiť pod asistovaný cvik, ak väčšinu práce urobil stroj.',
    },
  ],
  variations: [
    { slug: 'chin-up', name: 'Zhyb podhmatom', note: 'Podhmat, pri ktorom zvyčajne viac pomáhajú bicepsy.' },
    {
      slug: 'wide-grip-pull-up',
      name: 'Zhyb širokým úchopom',
      note: 'Pre mnohých náročnejší a s kratším rozsahom.',
    },
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie kladky na chrbát',
      note: 'Strojová verzia, pri ktorej môžeš pridávať malé kroky záťaže.',
    },
    {
      slug: 'assisted-pull-up',
      name: 'Asistovaný zhyb',
      note: 'Používaj ho, kým nie sú čisté série po 5 striktných opakovaní.',
    },
  ],
  progressions: [
    'Výdrže vo vise a príťahy lopatiek.',
    'Asistované zhyby alebo zhyby s gumou.',
    'Striktné série po 5–8 opakovaní.',
    'Pridaj opasok a zaznamenaj pridanú záťaž.',
  ],
  programming:
    'Je to hlavný cvik pre vertikálny ťah: 3–5 sérií s toľkými čistými opakovaniami, koľko zvládneš, a potom asistované zhyby alebo ľahšie série na kladke. Zaťažené zhyby patria k tomuto cviku s uvedenou kotúčovou záťažou, nie ako záhadný rekord.',
  relatedSlugs: ['chin-up', 'lat-pulldown', 'assisted-pull-up', 'wide-grip-pull-up'],
} satisfies ExerciseOverlay
