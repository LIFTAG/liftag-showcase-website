import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'diamond-push-up',
  metaDescription:
    'Diamantový klik: poloha rúk, dráha lakťov a zaznamenávanie klikov s úzkym úchopom ako práce tricepsov v LIFTAG-u oddelene od bežných klikov.',
  steps: [
    'Začni vo vzpore ležmo. Ruky polož bližšie než pri bežnom kliku; palce a ukazováky môžu vytvoriť voľný diamant, ak to zápästia znášajú.',
    'Spevni telo tak, aby tvorilo rovnú líniu od hlavy po päty. Lakte veď dozadu popri rebrách, nie do strán v uhle 90°.',
    'Spúšťaj sa, kým nebude hrudník blízko rúk. Diamant je menší cieľ, preto si osvoj dolnú polohu namiesto vznášania sa nad ňou.',
    'Odtlač podlahu od seba bez vystreľovania bokov nahor alebo vyťahovania ramien k ušiam pri dotiahnutí.',
  ],
  mistakes: [
    {
      title: 'Ruky tak blízko, že sa zápästia lámu',
      body: 'Spojené palce nie sú povinné. Úzky a pohodlný úchop je lepší než pekný tvar, ktorý podráždi zápästia.',
    },
    {
      title: 'Aj tak vytláčaš lakte do strán',
      body: 'Ak lakte vyzerajú ako pri širokom kliku, úzkym úchopom si nič nezískal. Drž ich pri trupe.',
    },
    {
      title: 'Zaznamenávanie ako bežné kliky',
      body: 'Urobíš menej opakovaní. Použi tento identifikátor, aby bol objem pre tricepsy viditeľný a rekord v klikoch zostal poctivý.',
    },
    {
      title: 'Polovičné opakovania v hornej polohe',
      body: 'Hrudník smeruje k rukám a hore nasleduje úplné vystretie. Čiastočné diamantové kliky patria k regresii, nie k falošnému objemu.',
    },
  ],
  variations: [
    {
      slug: 'push-up',
      name: 'Klik',
      note: 'Širšie ruky, väčší dôraz na hrudník a základný pohybový vzorec.',
    },
    {
      slug: 'close-grip-bench-press',
      name: 'Bench press s úzkym úchopom',
      note: 'Varianta s pridanou záťažou a rovnakou dráhou lakťov.',
    },
    {
      slug: 'knee-push-up',
      name: 'Klik na kolenách',
      note: 'Jednoduchšia verzia, pri ktorej môžeš zachovať úzky úchop.',
    },
    {
      slug: 'parallel-bar-triceps-dip',
      name: 'Tricepsový dip na bradlách',
      note: 'Vzpriamený úzky tlak, keď je podlaha príliš ľahká.',
    },
  ],
  progressions: [
    'Kliky na kolenách s úzkym úchopom, kým budú zápästia aj vystretie lakťov úplne isté.',
    'Plné diamantové kliky v sériách po 6–12 opakovaní.',
    'Pauza na hrudi alebo ruky položené na jednoručkách, ak zápästia potrebujú neutrálny úchop.',
    'Závažná vesta alebo kotúč na chrbte. Pridanú záťaž zaznamenaj.',
  ],
  programming:
    'Doplnok na tricepsy po tlaku alebo hlavný tlak na cestách. 3–4 série, skonči 2–3 opakovania pred tým, než sa boky začnú dvíhať. Zaznamenávaj ich. LIFTAG ukáže, či tvoj „ľahký“ objem úzkych klikov skutočne klesá.',
  faqs: [
    {
      question: 'Musia ruky vytvoriť dokonalý diamant?',
      answer:
        'Nie. Názov v katalógu opisuje tvar, nie povinnosť pre kĺby. Cvikom je poloha rúk vnútri šírky ramien s lakťami pri tele. Ak pravý diamant bolí zápästia, zachovaj úzky úchop a vynechaj akrobaciu končekmi prstov.',
    },
  ],
  relatedSlugs: ['push-up', 'close-grip-bench-press', 'chest-dips', 'parallel-bar-triceps-dip'],
} satisfies ExerciseOverlay
