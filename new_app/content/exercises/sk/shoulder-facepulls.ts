import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'shoulder-facepulls',
  metaDescription:
    'Face pulls na ramená: lano k tvári, vonkajšia rotácia a zaznamenávanie zadných deltov oddelene od príťahov v sede v LIFTAG.',
  steps: [
    'Nastav lano na kladku do výšky tváre až čela. Ustúp tak, aby sa závažie vznášalo. Kolená nechaj mierne pokrčené a rebrá stiahnuté.',
    'Ťahaj lano k tvári s lakťami vysoko a doširoka. Na konci otoč päste smerom k ušiam alebo spánkom — mal by si sa pozerať cez V lana.',
    'Stiahni zadné delty a hornú časť chrbta, nie trapézy smerom k ušiam. Hlava zostáva pokojná; lano prichádza k tebe.',
    'Vráť lano, až kým sa paže takmer nevystierajú a ramená trochu nedosiahnu dopredu. Nedovoľ závaží stiahnuť ťa do pokrčenia ramien.',
  ],
  mistakes: [
    {
      title: 'Ťaháš lano k hrudnej kosti s lakťami dole',
      body: 'To sú príťahy v sede na kladke s lanom. Ak lakte klesnú, zapíš príťahy. Face pulls zostávajú vysoko.',
    },
    {
      title: 'Hádžeš príliš ťažký blok k tvári',
      body: 'Práca zadných deltov končí, keď sa záťaž zmení na príťah. Ak lano zastaví na dĺžku paží, uber kolík. Zmyslom je ľahká až stredná záťaž.',
    },
    {
      title: 'Vynechávaš vonkajšiu rotáciu',
      body: 'Ruky pri ušiach sú poslednou časťou opakovania. Bez nich robíš vysoký príťah. Ten je tiež užitočný, no ide o tento cvik až po dokončení otočenia.',
    },
    {
      title: 'Používaš ich ako jediný objem ťahov',
      body: 'Face pulls sú korekčný cvik a záver na zadné delty. Nenahradia príťahy v sede, sťahovanie kladky ani zhyby.',
    },
  ],
  variations: [
    {
      slug: 'seated-cable-row',
      name: 'Príťahy v sede na kladke',
      note: 'Skutočný objem horizontálneho ťahu. Pridaj ich k face pulls, nenahrádzaj nimi príťahy.',
    },
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Bočný deltový sval na tom istom kladkovom stĺpe.',
    },
    {
      slug: 'barbell-upright-row',
      name: 'Príťahy veľkej činky k brade',
      note: 'Ťažší vzpriamený ťah, ak ho ramená tolerujú.',
    },
    {
      slug: 'barbell-bent-over-row',
      name: 'Príťahy veľkej činky v predklone',
      note: 'Práca chrbta, ktorou sa face pulls nesnažia stať.',
    },
  ],
  progressions: [
    'Ľahké lano, lakte vysoko, päste k ušiam a dvojsekundové stiahnutie.',
    'Záťaž pridávaj iba vtedy, keď lano stále dosiahne tvár bez predklonu.',
    'Zaraď ich po tlakoch alebo po ťažkých príťahoch v tréningu chrbta.',
  ],
  programming:
    'Vykonaj 2–4 série po 12–20 opakovaní. Toto nie je cvik na rekordy — ak LIFTAG ukazuje veľký skok, pravdepodobne si z lana začal robiť príťah. Záťaž udrž poctivú, poznač si „lano / vysoká kladka“ a skutočný čas odpočinku venuj príťahom alebo sťahovaniu kladky, ktoré boli na rade predtým.',
  equipmentAlternatives: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Ak posilňovňa nemá lano, upažovanie spolu s ľahkými príťahmi stále pokryje ramená. Nie je to rovnaký pohyb.',
    },
    {
      slug: 'seated-cable-row',
      name: 'Príťahy v sede na kladke',
      note: 'Keď potrebuješ prácu chrbta, nie náhradu face pulls.',
    },
  ],
  faqs: [
    {
      question: 'Môžu face pulls nahradiť príťahy na zadné delty?',
      answer:
        'Nie. Face pulls zapájajú zadné delty a vonkajšie rotátory s lakťami vysoko. Príťahy budujú chrbát, ktorým skutočne ťaháš. Rob oba cviky a oba zapisuj.',
    },
  ],
  relatedSlugs: ['cable-lateral-raise', 'seated-cable-row', 'barbell-bent-over-row', 'lat-pulldown'],
} satisfies ExerciseOverlay
