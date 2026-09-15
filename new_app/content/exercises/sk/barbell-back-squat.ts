import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-back-squat',
  metaDescription:
    'Drep s činkou na chrbte: nastavenie high-bar a low-bar, časté chyby a zaznamenávanie hĺbky, váhy a rekordov v LIFTAG.',
  steps: [
    'Ulož činku na hornú časť trapézov (high-bar) alebo na zadné deltové svaly (low-bar). Vykroč tromi krokmi, spevni stred tela a až potom klesaj.',
    'Súčasne pokrč boky aj kolená. Stred chodidla drž pod činkou a nedovoľ, aby sa hrudník zrútil dopredu.',
    'Klesni do opakovateľnej hĺbky — u väčšiny cvičiacich pod úroveň kolien — a potom sa vytlač nahor bez padania kolien dovnútra.',
    'Postav sa vzpriamene, znova sa nadýchni a spevni pred ďalším opakovaním. Činku odlož do stojana kontrolovane.',
  ],
  mistakes: [
    {
      title: 'S rastúcou váhou skracuješ hĺbku',
      body: 'Ak sú drepy v štvrtom týždni o päť centimetrov vyššie než v prvom, rekord je klamlivý. Natoč sériu zboku alebo si zvoľ rovnaký cieľ hĺbky.',
    },
    {
      title: 'Vystreľuješ zo spodnej pozície bez spevnenia',
      body: 'Pružný odraz je v poriadku, zrútený trup nie. Najprv nádych a spevnenie brucha, potom odraz.',
    },
    {
      title: 'Pri vykročení kráčaš príliš dlho',
      body: 'Stačia tri kroky. Dlhé vykročenie je únava, ktorú si do tréningu nezapisuješ.',
    },
    {
      title: 'Miešaš high-bar a low-bar v jednom progrese',
      body: 'Majú odlišné páky. Vyber jeden ako hlavný cvik v LIFTAG a druhý veď ako variáciu alebo samostatný cvik, ak programuješ oba.',
    },
  ],
  variations: [
    {
      slug: 'barbell-front-squat',
      name: 'Predný drep s veľkou činkou',
      note: 'Vzpriamenejší trup, väčší dôraz na kvadricepsy a vysoká záťaž pre hornú časť chrbta.',
    },
    {
      slug: 'smith-machine-squat',
      name: 'Drep na Smithovom stroji',
      note: 'Vedená dráha, keď chceš objem drepov bez vykračovania s činkou.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Dôraz na kvadricepsy bez nárokov na rovnováhu.',
    },
    {
      slug: 'dumbbell-goblet-squat',
      name: 'Goblet drep s jednoručkou',
      note: 'Výborný učebný drep a zakončenie s vysokým počtom opakovaní.',
    },
  ],
  progressions: [
    'Drep s vlastnou váhou alebo goblet drep do stále rovnakej hĺbky.',
    'Drep s prázdnou osou a trojsekundovým klesaním.',
    'Pracovné série na RPE 7–8. Pridaj váhu, keď každé opakovanie dosiahne rovnakú hĺbku.',
    'Pauzované alebo predné drepy, ak je spodná pozícia slabým miestom.',
  ],
  programming:
    'Pre väčšinu cvičiacich stačia dva až štyri náročné tréningy drepov týždenne, keď poctivo regenerujú. Zapisuj si odpočinok — päť minút medzi ťažkými sériami je bežných. Odhadované 1RM v LIFTAG bude skákať, ak v jednom týždni miešaš pauzované a odrazové opakovania; v hlavný deň drž rovnaký štýl.',
  equipmentAlternatives: [
    {
      slug: 'standard-leg-press',
      name: 'Klasický leg press',
      note: 'Udrž objem pre kvadricepsy, keď je chrbát príliš unavený na drep.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Pre väčšinu fitiek najbližší strojový vzor drepu s činkou na chrbte.',
    },
    {
      slug: 'dumbbell-bulgarian-split-squat',
      name: 'Bulharský drep s jednoručkami',
      note: 'Jednonožná možnosť, ktorá stále výrazne zaťaží kvadricepsy.',
    },
  ],
  relatedSlugs: [
    'barbell-front-squat',
    'standard-leg-press',
    'machine-hack-squat',
    'barbell-romanian-deadlift-rdl',
  ],
} satisfies ExerciseOverlay
