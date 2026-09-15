import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'overhead-cable-triceps-extension',
  metaDescription:
    'Tricepsové extenzie nad hlavou na kladke: nastavenie lana, poloha lakťov a zaznamenávanie práce dlhej hlavy tricepsu v LIFTAG bez zámeny za stláčanie kladky.',
  steps: [
    'Pripni lano na spodnú alebo strednú kladku, postav sa k nej chrbtom a vykroč do rozkročeného postoja, až kým sa lano napne.',
    'Priveď lano za hlavu s pokrčenými lakťami smerujúcimi dopredu, nie do strán. Rebrá zostávajú stiahnuté.',
    'Vystieraj lakte, kým sa konce lana v hornej polohe mierne neoddelia. Nadlaktia sa takmer nepohybujú.',
    'Vráť sa do polohy, v ktorej cítiš natiahnutie dlhej hlavy tricepsu, nie až kým kotúče narazia alebo lakte neklesnú do polohy pri stláčaní kladky.',
  ],
  mistakes: [
    {
      title: 'V polovici série z toho urobíš stláčanie kladky',
      body: 'Ak lakte klesnú k rebrám, už necvičíš nad hlavou. Vráť nadlaktia k ušiam alebo uber kolík.',
    },
    {
      title: 'Vypínaš rebrá, aby si predstieral natiahnutie',
      body: 'Vystretie v driekovej chrbtici nepredĺži triceps. Spevni sa, drž rebrá nad panvou a používaj rozsah, ktorý ramená dovolia.',
    },
    {
      title: 'Zapisuješ cvik ako stláčanie kladky na triceps',
      body: 'Poloha nad hlavou a poloha pri stláčaní kladky zaťažujú dlhú hlavu inak a používajú inú záťaž. Zachovaj tento cvik. Jednoručná extenzia nad hlavou je samostatný cvik.',
    },
    {
      title: 'Zamykáš lakte trhnutím a pokrčením ramien',
      body: 'Vystretie lakťa dokončuje triceps. Ak ramená vyskočia, záťaž je príliš veľká.',
    },
  ],
  variations: [
    {
      slug: 'seated-overhead-dumbbell-triceps-extension',
      name: 'Tricepsová extenzia s jednoručkou v sede nad hlavou',
      note: 'Vzor s voľnou váhou nad hlavou a menším napätím v celom rozsahu.',
    },
    {
      slug: 'single-arm-overhead-cable-triceps-extension',
      name: 'Jednoručná tricepsová extenzia nad hlavou na kladke',
      note: 'Pomôže vyrovnať rozdiel medzi stranami; zapisuj ju samostatne.',
    },
    {
      slug: 'cable-triceps-pushdown',
      name: 'Stláčanie lana na triceps',
      note: 'Lakte sú pri rebrách, nie pri ušiach.',
    },
    {
      slug: 'ez-bar-skullcrusher',
      name: 'Francúzsky tlak s EZ-činkou',
      note: 'Izolácia v ľahu, keď je kladková veža obsadená.',
    },
  ],
  progressions: [
    'Ľahké lano, úplné natiahnutie a pokojné rebrá.',
    'Pridaj záťaž, až keď každé vystretie zostáva nad hlavou a neprechádza do stláčania kladky.',
    'Pred honbou za ťažším kolíkom zastav v natiahnutej polohe.',
    'Na jednoručnú verziu prejdi až vtedy, keď je obojručný pohyb automatický.',
  ],
  programming:
    'Doplnkový cvik na dlhú hlavu tricepsu: 3–4 série po 10–15 po tlakoch alebo stláčaní kladky; v ten istý deň nerob oba ťažké cviky nad hlavou. Ak má posilňovňa označený vysoký alebo nízky kladkový stĺp, naskenuj jeho štítok — má otvoriť tento cvik, nie stláčanie. Odpočívaj tak dlho, aby sa natiahnutie nezmenilo na trhanie.',
  faqs: [
    {
      question: 'Lano alebo tyč pri tricepsových extenziách nad hlavou na kladke?',
      answer:
        'Lano zvyčajne dovolí zápästiam a lakťom nájsť pohodlnejšiu dráhu a v hornej polohe sa jeho konce môžu oddeliť. Tyč je v poriadku, ak je na kladke práve tá. Pri výmene nástavca si ho poznač; záťaž sa nebude zhodovať.',
    },
  ],
  relatedSlugs: [
    'cable-triceps-pushdown',
    'seated-overhead-dumbbell-triceps-extension',
    'ez-bar-skullcrusher',
    'close-grip-bench-press',
  ],
} satisfies ExerciseOverlay
