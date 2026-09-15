import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-step-up',
  metaDescription:
    'Výstup s jednoručkami: výška debny, tlak pracovnej nohy a zapisovanie výstupov v LIFTAGu bez zamieňania za výpady, split squaty alebo odraz zadnou nohou.',
  steps: [
    'Vyber debnu približne od polovice predkolenia po koleno. Celé chodidlo pracovnej nohy polož na debnu, nie iba špičky presahujúce cez okraj.',
    'Jednoručky drž pri bokoch. Postav sa tak blízko, aby si vykročil nahor, nie skočil dopredu. Spevni stred tela.',
    'Zatlač cez pätu pracovnej nohy. Zadná noha je batožina, nie pružina. Ak sa musíš silno odrážať od podlahy, debna je privysoká alebo je záťaž iba na efekt.',
    'Na debne sa úplne vzpriam. Nevyhadzuj boky do lockoutu. Kontrolovane zostúp tou istou pracovnou nohou alebo striedaj nohy podľa naprogramovanej série.',
    'Panvu drž vodorovne. Vyťahovanie boku je výstup, ktorý si nezapisuješ poctivo.',
  ],
  mistakes: [
    {
      title: 'Odraz zadnou nohou',
      body: 'To je skok s jednoručkami. Pri niekoľkých opakovaniach podrž špičky zadnej nohy centimeter nad podlahou. Ak to nedokážeš, zníž debnu alebo jednoručky.',
    },
    {
      title: 'Príliš vysoká debna',
      body: 'Keď je stehno na začiatku výrazne nad rovnobežkou, z výstupu sa stáva zápas o rovnováhu. Polovica predkolenia až koleno úplne stačí. Vyššia debna neznamená lepší cvik.',
    },
    {
      title: 'Zapisovanie ako výpad alebo split squat',
      body: 'Vystúpil si na debnu. Je to iný vzor aj iný rekord. Zachovaj tento cvik. Box-step-up je nezaťažený príbuzný, nie táto verzia s jednoručkami.',
    },
    {
      title: 'Použitie ohýbajúcej sa stohovateľnej dosky ako debny',
      body: 'Ak sa povrch hýbe, hýbe sa aj chodidlo. Použi debnu, pevnú lavičku, ktorej dôveruješ, alebo cvik vynechaj.',
    },
  ],
  variations: [
    {
      slug: 'box-step-up',
      name: 'Box step-up',
      note: 'Variant s vlastnou hmotnosťou. Rovnaký tlak pracovnej nohy, bez jednoručiek, stále nejde o výpad.',
    },
    {
      slug: 'dumbbell-lunge',
      name: 'Dumbbell lunge',
      note: 'Krok dopredu na podlahe, keď nemáš debnu.',
    },
    {
      slug: 'split-squat',
      name: 'Split squat',
      note: 'Chodidlá zostávajú na mieste. Použi ho, keď výstup znamená iba boj o rovnováhu bez práce nôh.',
    },
    {
      slug: 'dumbbell-reverse-lunge',
      name: 'Dumbbell reverse lunge',
      note: 'Jednonožný cvik na podlahe, pri ktorom vykračuješ dozadu namiesto nahor.',
    },
  ],
  progressions: [
    'Výstupy s vlastnou hmotnosťou na debnu do polovice predkolenia, pričom zadná noha zostáva pokojná.',
    'Ľahké jednoručky, 8–12 opakovaní na každú nohu a rovnaká výška debny na oboch stranách.',
    'Pridaj záťaž, keď dokážeš pri začiatku tlaku podržať zadnú nohu mimo podlahy.',
    'Mierne vyššiu debnu použi až po odstránení odrazu. Výšku si zapíš do LIFTAGu.',
  ],
  programming:
    'Doplnok po drepoch: 3–4 série po 6–12 opakovaní na každú nohu. Do poznámky série zapíš pár jednoručiek aj výšku debny. „Rekord“ z nižšej debny nie je rekord. Ak debnu odložíš a začneš robiť výpady, zmeň cvik v katalógu, aby graf zostal výstupom.',
  equipmentAlternatives: [
    {
      slug: 'box-step-up',
      name: 'Box step-up',
      note: 'Nemáš jednoručky. Zachovaj pohybový vzor a túto položku nechaj bez záťaže.',
    },
    {
      slug: 'split-squat',
      name: 'Split squat',
      note: 'Nemáš pevnú debnu. Stále ide o cvik na jednu nohu, chodidlá však zostávajú na mieste.',
    },
    {
      slug: 'dumbbell-lunge',
      name: 'Dumbbell lunge',
      note: 'Jednoručky si nechaj, debnu vynechaj.',
    },
  ],
  faqs: [
    {
      question: 'Aká vysoká má byť debna?',
      answer:
        'Dostatočne vysoká na to, aby bolo pracovné stehno na začiatku približne rovnobežne s podlahou, nie ako pri lezení po stene. Ak ťa musí zadná noha vystreliť nahor, debna vyhrala. Zníž ju, zapíš výšku a nechaj pracovať prednú nohu. Vyššia debna budúci mesiac je zmena v poznámke, nie potichu nový cvik.',
    },
  ],
  relatedSlugs: ['dumbbell-lunge', 'split-squat', 'box-step-up', 'dumbbell-reverse-lunge'],
} satisfies ExerciseOverlay
