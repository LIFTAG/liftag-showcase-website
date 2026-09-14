import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'smith-machine-squat',
  metaDescription:
    'Drep na Smithovom stroji: poloha chodidiel na pevnej koľajnici, hĺbka a samostatné zaznamenávanie oproti drepu s voľnou osou v LIFTAG.',
  steps: [
    'Nastav bezpečnostné dorazy tesne pod plánovanú hĺbku. Os polož na hornú časť trapézov, nie na krk.',
    'Chodidlá umiestni trochu pred os, aby zvislá koľajnica dovolila drep, nie good morning.',
    'Odomkni os otočením zápästí, spevni stred tela a sadni medzi nohy do rovnakej hĺbky — ak bedrá dovolia, pod úroveň kolien.',
    'Vytlač sa bez padania kolien dovnútra. Na konci os zámerne zahákni späť, nevhadzuj ju do dorazov.',
  ],
  mistakes: [
    {
      title: 'Chodidlá máš pod osou ako pri voľnom drepe',
      body: 'Koľajnica sa s bokmi neposunie dozadu. Začni chodidlami o pár centimetrov vpredu, aby sa na práci podieľali kolená aj trup.',
    },
    {
      title: 'Zapisuješ ho ako drep s veľkou činkou',
      body: 'Nemáš vykročenie ani rovnakú dráhu osi. Drážka aj rekord sú iné, preto zachovaj tento cvik.',
    },
    {
      title: 'Vynechávaš bezpečnostné dorazy',
      body: 'Háky nie sú ochranou v spodnej polohe. Nastav dorazy; vykrúcať sa spod osi je zbytočne nebezpečný deň.',
    },
    {
      title: 'Skracuješ hĺbku, lebo stroj je stabilný',
      body: 'Stabilita nie je povolenie na štvrtinové drepy s obrovskou váhou. Natoč sériu zboku alebo zvoľ hĺbku, ktorú by si uznal v stojane.',
    },
  ],
  variations: [
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Voľná os a vykročenie; verzia, ktorá sa prenáša do súťaže.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Drep na saniach s oporou chrbta a ešte menšími nárokmi na rovnováhu.',
    },
    {
      slug: 'pendulum-squat',
      name: 'Pendulum drep',
      note: 'Oblúková páka, zvyčajne väčší dôraz na kvadricepsy a stále vedený drep.',
    },
    {
      slug: 'belt-squat',
      name: 'Belt squat',
      note: 'Záťaž visí z bokov, keď je limitom chrbtica.',
    },
  ],
  progressions: [
    'Drep s vlastnou váhou do stále rovnakej hĺbky.',
    'Smith drep s prázdnou osou, trojsekundovým klesaním a nastavenými dorazmi.',
    'Pracovné série na RPE 7–8. Pridaj váhu, keď každé opakovanie dosiahne rovnakú hĺbku.',
    'Pauzované opakovania, ak odrážaš spodnú pozíciu a vydávaš to za silu.',
  ],
  programming:
    'Užitočný objemový drep, keď cvičíš sám: tri až štyri série po 6–12. Zapisuj odpočinok — pri ťažkých sériách sú tri minúty stále normálne. Odhadované 1RM zo Smithovho rekordu sa neprenesie na drep s vykročením; neprenášaj ho do dňa voľnej osi.',
  equipmentAlternatives: [
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Základná voľnováhová verzia, keď je stojan voľný.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Najbližší strojový vzor vo väčšine fitiek.',
    },
    {
      slug: 'standard-leg-press',
      name: 'Klasický leg press',
      note: 'Zachovaj objem kvadricepsov, ak chrbtu prekáža aj Smithova os.',
    },
  ],
  faqs: [
    {
      question: 'Je drep na Smithovom stroji podvádzanie?',
      answer:
        'Je to iný drep. Koľajnica preberá rovnováhu aj dráhu osi. Použi ho na objem, rehabilitáciu alebo vo fitku bez voľného stojana a zapisuj ho sem, aby graf voľného drepu zostal čistý.',
    },
  ],
  relatedSlugs: ['barbell-back-squat', 'machine-hack-squat', 'pendulum-squat', 'belt-squat'],
} satisfies ExerciseOverlay
