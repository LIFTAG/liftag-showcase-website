import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'rack-pull',
  metaDescription:
    'Rack pull: výška dorazov, štartová poloha a samostatné zapisovanie čiastočných mŕtvych ťahov oproti ťahom zo zeme v LIFTAG.',
  steps: [
    'Nastav dorazy do výšky, ktorú budeš opakovať — pod kolená, pri kolená alebo tesne nad ne. Výšku si zapíš.',
    'Os drž nad stredom chodidiel. Predkloň sa, uchop ju, spevni chrbát a vytiahni vôľu skôr, než kotúče opustia dorazy.',
    'Odtlač podlahu. Boky a ramená stúpajú spolu. Vystretie dokonči vzpriamene; nezakláňaj sa do falošného záveru.',
    'Os kontrolovane spusti na dorazy a každé opakovanie resetuj. Toto nie je odraz od ocele.',
  ],
  mistakes: [
    {
      title: 'Meníš výšku dorazov a voláš to rekord',
      body: 'Dve dierky vyššie sú iný cvik. Výšku si poznač v LIFTAG, inak je graf v štvrtom týždni fikcia.',
    },
    {
      title: 'Zapisuješ rack pull ako klasický mŕtvy ťah',
      body: 'Nezačínaš zo zeme. Zachovaj tento cvik, hoci vystretie na videu vyzerá rovnako.',
    },
    {
      title: 'Trhneš osou, keď v systéme zostáva vôľa',
      body: 'Dorazy zacinkajú a trhnutie preberie chrbát. Najprv vytiahni vôľu, potom zdvihni váhu, rovnako ako pri ťahu zo zeme.',
    },
    {
      title: 'Pri vystretí sa zakloníš alebo pomáhaš trhnutím',
      body: 'Postav sa vzpriamene a stiahni sedacie svaly. Zaklonený záver nie je lepšie vystretie, iba iná poloha chrbtice.',
    },
  ],
  variations: [
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Štart zo zeme; práve ten chce rack pull zvyčajne posilniť.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap bar osou',
      note: 'Neutrálny úchop a väčšinou celý rozsah.',
    },
    {
      slug: 'sumo-deadlift',
      name: 'Sumo mŕtvy ťah',
      note: 'Širší postoj, ak je skutočným problémom štart klasického ťahu zo zeme.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Objem predklonu bez sporu o výšku dorazov.',
    },
  ],
  progressions: [
    'Rumunský mŕtvy ťah, kým sa predklon nestane automatickým.',
    'Rack pull v polovici predkolenia s resetom po každom opakovaní.',
    'Dorazy postupne znižuj k zemi, keď štart zostáva pevný.',
    'Preťaženie tesne nad kolenami iba vtedy, ak je cieľom skutočne vystretie, nie dojem vyššej váhy.',
  ],
  programming:
    'Preťaženie alebo slabé miesto v ťahu: tri až päť sérií po 3–6, s odpočinkom ako pri mŕtvom ťahu — tri až päť minút. Do poznámky série uveď výšku dorazov („pod kolená“, „pri kolenách“). Rekord z vysokých dorazov nie je rekord mŕtveho ťahu; neporovnávaj ho s dňom klasického ťahu.',
  equipmentAlternatives: [
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Použi zem, keď ti dorazy iba dávajú falošný pocit sily.',
    },
    {
      slug: 'trap-bar-deadlift',
      name: 'Mŕtvy ťah s trap bar osou',
      note: 'Celý rozsah, ktorý býva pre chrbát ľahší než vysoký rack pull so zaokrúhleným štartom.',
    },
  ],
  faqs: [
    {
      question: 'Buduje rack pull mŕtvy ťah?',
      answer:
        'Môže posilniť vystretie alebo umožniť ťah, keď štart zo zeme nie je prioritou. Nenahrádza však prácu zo zeme. Ak os stále umiera pri odlepení, zníž dorazy alebo sa vráť ku klasickému mŕtvemu ťahu.',
    },
  ],
  relatedSlugs: [
    'conventional-deadlift',
    'trap-bar-deadlift',
    'barbell-romanian-deadlift-rdl',
    'sumo-deadlift',
  ],
} satisfies ExerciseOverlay
