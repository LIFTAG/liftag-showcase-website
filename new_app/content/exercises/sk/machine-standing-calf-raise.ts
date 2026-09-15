import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-standing-calf-raise',
  metaDescription:
    'Výpony v stoji na stroji: výška podložiek, rozsah členka a oddelené zapisovanie práce s vystretými kolenami od výponov v sede v LIFTAGu.',
  steps: [
    'Ramenné podložky nastav tak, aby zaťažili lýtka, ale netlačili na krk. Predné časti chodidiel polož na plošinu a päty nechaj visieť.',
    'Kolená drž vystreté, no nezamykaj ich nasilu. Odisti stroj a spusti päty do natiahnutia, ktoré máš pod kontrolou.',
    'Vytlač sa cez vankúšik pod palcom do úplného vystretia členka a hore zastav. Kolená neodrážaj.',
    'Kontrolovane spusti päty a stroj znovu zaisti rukami na bezpečnostnom mechanizme, nie iba nádejou.',
  ],
  mistakes: [
    {
      title: 'Pokrčenie kolien na kombináciu drepu a výponov',
      body: 'Keď kolená pokrčíš, gastrocnemius preberie menšiu časť práce. Jemne ich povoľ, potom uhol drž rovnaký.',
    },
    {
      title: 'Odraz kvadricepsmi',
      body: 'Ponorenie a odraz je štvrťdrep. Záťaž majú hýbať lýtka, nie odraz od plošiny.',
    },
    {
      title: 'Príliš rýchle natiahnutie',
      body: 'Najťažšia je spodná poloha. Ak päty nikdy neklesnú, trénuješ iba horný centimeter výponu.',
    },
    {
      title: 'Miešanie výponov v stoji a v sede',
      body: 'Vystreté a pokrčené kolená vytvárajú odlišné grafy. Zachovaj tento cvik pre výpony v stoji.',
    },
  ],
  variations: [
    {
      slug: 'seated-calf-raise',
      name: 'Výpony v sede',
      note: 'Práca soleu s pokrčenými kolenami. Zaraď ju spolu, no nezapisuj namiesto tejto verzie.',
    },
    {
      slug: 'standing-dumbbell-calf-raise',
      name: 'Výpony s jednoručkami v stoji',
      note: 'Keď nemáš stroj, drž jednoručky a cvič na hrane schodu.',
    },
    {
      slug: 'bodyweight-calf-raise',
      name: 'Výpony s vlastnou váhou',
      note: 'Odľahčená verzia; natiahnutie zachovaj.',
    },
    {
      slug: 'leg-press-calf-raises',
      name: 'Výpony na leg presse',
      note: 'Verzia na saniach, keď je stroj na výpony v stoji obsadený.',
    },
  ],
  progressions: [
    'Výpony s vlastnou váhou do plného natiahnutia na schode.',
    'Výpony v stoji na stroji s pauzou v oboch krajných polohách.',
    'Záťaž pridaj, keď sa rozsah natiahnutia neskráti počas celej série.',
    'Ak jedna strana stále podvádza vo vystretí, prejdi na výpony na jednej nohe.',
  ],
  programming:
    'Rob 3–4 série po 8–15 opakovaní. Výpony s vystretými kolenami viac zaťažia gastrocnemius než výpony v sede. Pauza je kratšia než pri drepoch — 60–90 sekúnd stačí, ak posledné opakovanie stále obsahuje zastavenie. Nedovoľ, aby sa PR zo stoja preniesol do grafu výponov v sede.',
  equipmentAlternatives: [
    {
      slug: 'standing-dumbbell-calf-raise',
      name: 'Výpony s jednoručkami v stoji',
      note: 'Vhodné doma alebo tam, kde sú k dispozícii iba jednoručky.',
    },
    {
      slug: 'seated-calf-raise',
      name: 'Výpony v sede',
      note: 'Objem pre lýtka zachováš, aj keď stroj na výpony v stoji nefunguje.',
    },
  ],
  relatedSlugs: [
    'seated-calf-raise',
    'standing-dumbbell-calf-raise',
    'bodyweight-calf-raise',
    'leg-press-calf-raises',
  ],
} satisfies ExerciseOverlay
