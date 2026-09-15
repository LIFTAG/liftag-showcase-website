import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bulgarian-split-squat',
  metaDescription:
    'Bulharský drep s veľkou činkou: výška zadnej nohy, činka na chrbte a zapisovanie každej nohy v LIFTAGu bez miešania jednoručiek či split drepov.',
  steps: [
    'Ulož činku do stojana vo výške pre drep a nastav bezpečnostné dorazy tak, aby si ju mohol odhodiť. Nárt zadnej nohy polož na lavičku vo výške kolena, nie špičku na vysoký box.',
    'Predné chodidlo posuň dosť dopredu, aby holeň zostala naspodku približne zvislá. Činku polož na hornú časť chrbta, nie na krk.',
    'Spevni stred tela a spúšťaj zadné koleno k podlahe. Predné koleno sleduje stred chodidla. Činka zostáva nad stredom predného chodidla a neposúva sa k lavičke.',
    'Vytlač sa cez pätu a stred chodidla. Dokonči sériu na jednej nohe, potom vymeň stranu. Pod činkou nestriedaj nohy pri každom opakovaní.',
    'Činku vráť do stojana ako pri drepe. Nevydarený bulharský drep s činkou nevyriešiš pokrčením ramien a odhodením.',
  ],
  mistakes: [
    {
      title: 'Zaťaženie postoja, ktorý ešte nezvládaš s jednoručkami',
      body: 'Ak sa pri verzii s jednoručkami stále kýveš, činka na chrbte to neopraví. Zostaň pri dumbbell-bulgarian-split-squat, kým bude krok stabilný.',
    },
    {
      title: 'Príliš vysoko položená zadná noha',
      body: 'Box nad kolenom zmení cvik na naťahovanie ohýbačov bedra s činkou na chrbte. Začni vo výške kolena alebo nižšie.',
    },
    {
      title: 'Zapisovanie ako bulharský drep s jednoručkami alebo split drep',
      body: 'Činka na chrbte, zadná noha hore a chodidlá na mieste znamenajú tri odlišné PR. Zachovaj tento cvik a zapisuj každú nohu.',
    },
    {
      title: 'Odraz zadným kolenom od podlahy',
      body: 'Najťažšia je spodná poloha. Podlahy sa len zľahka dotkni alebo zostaň tesne nad ňou. Pod činkou nepoužívaj podlahu ako trampolínu.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-bulgarian-split-squat',
      name: 'Bulharský drep s jednoručkami',
      note: 'Rovnaké nastavenie zadnej nohy, jednoduchšie odhodenie záťaže. Najprv si tu vybuduj istotu pre činku.',
    },
    {
      slug: 'split-squat',
      name: 'Split drep',
      note: 'Zadná noha zostáva na podlahe. Postoj si osvojíš bez lavičky a činky.',
    },
    {
      slug: 'barbell-lunge',
      name: 'Výpad s veľkou činkou',
      note: 'Verzia s krokom a činkou. Iný dopad, stále axiálne zaťaženie.',
    },
    {
      slug: 'smith-machine-split-squat',
      name: 'Split drep na smithovom stroji',
      note: 'Pevná dráha, keď rovnováha a nie nohy predstavuje limit.',
    },
  ],
  progressions: [
    'Split drep, potom bulharský drep s vlastnou váhou, kým bude hĺbka zadnej nohy automatická.',
    'Bulharský drep s jednoručkami. Záťaž pridaj, keď obe nohy dosiahnu rovnakú hĺbku vo všetkých pracovných sériách.',
    'Prázdna činka v stojane s dorazmi. Potom pracovné série po 6–10 opakovaní na každú nohu.',
    'Pauzu v spodnej polohe pridaj až vtedy, keď dokážeš činku bezpečne vrátiť do stojana bez tanca.',
  ],
  programming:
    'Špecializovaný jednonožný cvik s činkou, nie začiatočnícka progresia: 3–4 série po 6–10 opakovaní na každú nohu po hlavnom drepe. Záťaž bude oveľa nižšia než pri zadnom drepe. V LIFTAGu zapisuj každú nohu. Ak nepoužívaš lavičku, prejdi na split-squat. Ak vymeníš činku za jednoručky, vyber iný cvik v katalógu, aby graf činky zostal grafom činky.',
  equipmentAlternatives: [
    {
      slug: 'dumbbell-bulgarian-split-squat',
      name: 'Bulharský drep s jednoručkami',
      note: 'Predvolená voľba, keď nechceš činku na chrbte alebo je stojan obsadený.',
    },
    {
      slug: 'split-squat',
      name: 'Split drep',
      note: 'Bez lavičky. Rovnaký jednonožný vzor s menším natiahnutím.',
    },
    {
      slug: 'barbell-lunge',
      name: 'Výpad s veľkou činkou',
      note: 'Činku si nechaj, lavičku za zadnou nohou vynechaj.',
    },
  ],
  faqs: [
    {
      question: 'Činka alebo jednoručky na bulharské drepy?',
      answer:
        'Jednoručky používaj dovtedy, kým bude postoj stabilný. Činka pridáva axiálnu záťaž a ťažšie sa bezpečne odhadzuje. Ak je jedna strana stále o dve opakovania pozadu, zostaň pri jednoručkách a zapisuj každú nohu. Rozdiel nezakrývaj chôdzou s činkou.',
    },
  ],
  relatedSlugs: [
    'dumbbell-bulgarian-split-squat',
    'split-squat',
    'barbell-lunge',
    'bodyweight-bulgarian-split-squat',
  ],
} satisfies ExerciseOverlay
