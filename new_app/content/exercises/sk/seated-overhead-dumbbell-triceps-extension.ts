import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-overhead-dumbbell-triceps-extension',
  metaDescription:
    'Tricepsová extenzia s jednoručkou nad hlavou v sede: dráha lakťov, natiahnutie a zaznamenávanie dlhej hlavy tricepsu v LIFTAG-u oddelene od francúzskych tlakov a stláčania lana.',
  steps: [
    'Sadni si na lavičku s operadlom, ak ho máš. Jednu jednoručku drž oboma rukami za vnútorný kotúč alebo rukoväť a začni s ňou uzamknutou nad temenom.',
    'Spúšťaj ju za hlavu pokrčením lakťov. Nadlaktia drž pri ušiach, neroztváraj ich do tvaru písmena T a neposúvaj ich do polohy na stláčanie kladky.',
    'Zastav sa v natiahnutí, ktoré vieš ovládať. Jednoručku nepúšťaj na trapézy. Rebrá zostávajú dole; vystieranie v krížoch nie je dĺžka tricepsu.',
    'Vystreľ lakte do úplného uzamknutia. Posledná tretina patrí tricepsom. Ramená nemajú jednoručku krčením dostať späť do štartu.',
  ],
  mistakes: [
    {
      title: 'Zaznamenávanie ako francúzsky tlak',
      body: 'Práca v ľahu s EZ-činkou patrí k francúzskemu tlaku s EZ-činkou. Toto je tricepsová extenzia s jednoručkou nad hlavou v sede. Iné natiahnutie aj záťaž, preto používaj tento identifikátor. LIFTAG sleduje jeden pohybový vzorec.',
    },
    {
      title: 'Vytáčanie lakťov, aby bolo natiahnutie menšie',
      body: 'Potom prácu prevzali ramená a dlhá hlava tricepsu sa vytratila. Nadlaktia drž v koridore pri hlave alebo zníž jednoručku.',
    },
    {
      title: 'Vytláčanie rebier na predstieranie rozsahu',
      body: 'Veľký oblúk nie je hlbšie natiahnutie tricepsu. Spevni stred tela, rebrá drž nad panvou a využívaj rozsah, ktorý dovolia ramená.',
    },
    {
      title: 'Dve jednoručky ako jedna bez poznámky',
      body: 'Predvolená je jedna jednoručka držaná oboma rukami. Dve jednoručky znamenajú inú sériu a zvyčajne aj inú záťaž. Uveď to v poznámke, inak sa budúci týždeň nebude dať porovnať.',
    },
  ],
  variations: [
    {
      slug: 'overhead-cable-triceps-extension',
      name: 'Tricepsová extenzia nad hlavou na kladke',
      note: 'Stále napätie, šetrnejšie k mnohým lakťom a stále nad hlavou.',
    },
    {
      slug: 'ez-bar-skullcrusher',
      name: 'Francúzsky tlak s EZ-činkou',
      note: 'Izolácia v ľahu. Tlaky nad hlavou nezaznamenávaj pod tento identifikátor.',
    },
    {
      slug: 'lying-dumbbell-triceps-extension',
      name: 'Tricepsová extenzia s jednoručkami v ľahu',
      note: 'Rovnaké jednoručky na chrbte a menšia náročnosť nad hlavou.',
    },
    {
      slug: 'cable-triceps-pushdown',
      name: 'Stláčanie lana na tricepsy',
      note: 'Lakte pri rebrách namiesto pri ušiach.',
    },
  ],
  progressions: [
    'Ľahká jednoručka, pokojné rebrá a natiahnutie, ktoré zvládneš v sede.',
    'Pracovné série po 10–15 opakovaní s rovnakou voľbou jednej alebo dvoch jednoručiek.',
    'V natiahnutí pridaj pauzu a až potom naháňaj ťažšiu jednoručku.',
    'Tricepsová extenzia nad hlavou na kladke, ak jednoručka dráždi lakte. Zaznamenaj ju pod vlastným identifikátorom.',
  ],
  programming:
    'Doplnok pre dlhú hlavu tricepsu: 3–4 série po 10–15 opakovaní po tlaku alebo stláčaní kladky; oba ťažké tlaky nad hlavou nerob v ten istý deň. Zaznamenaj jednoručku v rukách. Jedna jednoručka držaná oboma rukami je stále jedna záťaž. Tieto opakovania nezaraďuj k francúzskemu tlaku s EZ-činkou ani k stláčaniu lana. Oddychuj tak dlho, aby uzamknutie zostalo nad hlavou a nezmenilo sa na švih.',
  equipmentAlternatives: [
    {
      slug: 'overhead-cable-triceps-extension',
      name: 'Tricepsová extenzia nad hlavou na kladke',
      note: 'Keď chceš blok a stále napätie namiesto voľnej jednoručky.',
    },
    {
      slug: 'lying-dumbbell-triceps-extension',
      name: 'Tricepsová extenzia s jednoručkami v ľahu',
      note: 'Ak ramenám prekáža poloha nad hlavou, ale jednoručky máš k dispozícii.',
    },
  ],
  faqs: [
    {
      question: 'Jedna jednoručka alebo dve?',
      answer:
        'Predvolený variant je jedna jednoručka držaná oboma rukami. Dve jednoručky umožnia každej ruke vlastnú dráhu a zvyčajne znamenajú nižšiu záťaž. Na celý blok si vyber jednu možnosť a pri zmene napíš „dve jednoručky“. Číslo z dvoch jednoručiek neporovnávaj s jednou jednoručkou z budúceho týždňa.',
    },
  ],
  relatedSlugs: [
    'overhead-cable-triceps-extension',
    'ez-bar-skullcrusher',
    'lying-dumbbell-triceps-extension',
    'cable-triceps-pushdown',
  ],
} satisfies ExerciseOverlay
