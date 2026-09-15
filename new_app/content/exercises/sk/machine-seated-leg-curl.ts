import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-seated-leg-curl',
  metaDescription:
    'Zakopávanie v sede na stroji: nastavenie pri pokrčenom bedre, zarovnanie kolena s vačkou a zapisovanie seated curls v LIFTAGu mimo tabuľky pre lying curl.',
  steps: [
    'Sadni si tak, aby kolená boli v osi s vačkou stroja. Zaisti stehenný vankúš. Valec má ležať na spodnej časti Achillovej šľachy, nie v strede lýtka.',
    'Boky drž vzadu v sedadle a uchop držadlá. Ak si sa posunul dopredu, už si prišiel o natiahnutie.',
    'Priťahuj päty pod seba, až kým sa kolená výrazne nepokrčia. Nevykopávaj záťažový blok z kolíkov.',
    'Kontrolovane spúšťaj nohy do natiahnutia, pričom bedrá zostávajú pokrčené. Zastav skôr, než kotúče narazia alebo ti záťaž prudko vystrie kolená.',
    'Chrbát nechaj opretý o vankúš. Odlepovanie zo sedadla je cheating, nie ďalšia práca hamstringov.',
  ],
  mistakes: [
    {
      title: 'Posúvanie bokov dopredu',
      body: 'Hamstring si zámerne skrátil. Seated curl existuje pre zaťaženie vo veľkej dĺžke s pokrčenými bedrami. Sadni si dozadu alebo zvoľ iný cvik.',
    },
    {
      title: 'Osa otáčania nie je v kolene',
      body: 'Ak je vačka za kĺbom alebo pred ním, každé opakovanie zbytočne namáha koleno. Posúvaj sedadlo, kým sa osi nezarovnajú.',
    },
    {
      title: 'Vyhadzovanie záťaže švihom',
      body: 'Kopnutie skryje najťažšiu časť rozsahu. Spomaľ posledných 30° alebo zníž kolík.',
    },
    {
      title: 'Zapisovanie lying curls ako samostatného cviku',
      body: 'Zakopávanie v ľahu a v sede majú iný uhol v bedre a iné rekordy. Naskenuj seated jednotku, aby LIFTAG neotvoril tabuľku pre lying curl.',
    },
  ],
  variations: [
    {
      slug: 'machine-lying-leg-curl',
      name: 'Machine lying leg curl',
      note: 'Bedrá sú vystreté na lavičke. Rovnaký kĺb, kratšia dĺžka hamstringov.',
    },
    {
      slug: 'machine-leg-extension',
      name: 'Machine leg extension',
      note: 'Izolácia kvadricepsov ako antagonistický cvik, ak ich páruješ na tom istom stroji.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic hamstring curl',
      note: 'Náročná excentrická fáza, keď ťa pri zakopávaní neobmedzuje sedadlo.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Barbell Romanian deadlift',
      note: 'Zaťažený hip hinge, ak chceš precvičiť hamstringy bez stroja na zakopávanie.',
    },
  ],
  progressions: [
    'Ľahké seated curls v plnom rozsahu s bokmi pevne vzadu.',
    'Na chvíľu zastav v maximálnom pokrčení bez odlepenia zo sedadla.',
    'Prejdi na jednu nohu, ak jedna strana vždy opustí vankúš ako prvá.',
    'Ťažších 8–12 opakovaní pridaj až vtedy, keď sedadlo a vačka zostávajú v rovnakej polohe z tréningu na tréning.',
  ],
  programming:
    'Ako finisher alebo druhý hamstringový deň: 2–4 série po 8–15 opakovaní. Ak chceš, spáruj cvik s leg extensions, ale zapisuj ich ako dva cviky. Naskenuj seated stroj. Ak si pre rad prešiel uprostred bloku na lying curl, zmeň cvik v katalógu, inak sa z odhadovaného 1RM stanú dva uhly v bedre vydávajúce sa za jeden cvik.',
  equipmentAlternatives: [
    {
      slug: 'machine-lying-leg-curl',
      name: 'Machine lying leg curl',
      note: 'Zachováš flexiu kolena, keď je seated stroj obsadený.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic hamstring curl',
      note: 'Nemáš voľný stroj na zakopávanie. Ukotvi nohy a spúšťaj sa kontrolovane.',
    },
  ],
  faqs: [
    {
      question: 'Prečo je seated curl pri rovnakom kolíku ťažší?',
      answer:
        'Pokrčené bedrá natiahnu hamstringy ešte pred pohybom kolena. Číslo zo stroja na lying curl sa preto neprenesie. Práve o to pri tomto cviku ide. Ak konkrétne sedadlo vždy bolí v zadnej časti kolena, skontroluj vačku, mierne skráť natiahnutie a nesnaž sa dobehnúť záťaž z lying curlu.',
    },
  ],
  relatedSlugs: [
    'machine-lying-leg-curl',
    'machine-leg-extension',
    'nordic-hamstring-curl',
    'barbell-romanian-deadlift-rdl',
  ],
} satisfies ExerciseOverlay
