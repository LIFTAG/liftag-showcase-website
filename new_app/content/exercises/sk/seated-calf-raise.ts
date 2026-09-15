import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-calf-raise',
  metaDescription:
    'Výpony v sede: poloha opory, úplné natiahnutie a samostatné zaznamenávanie práce solea s pokrčenými kolenami oproti výponom v stoji v LIFTAG.',
  steps: [
    'Polstrovanie polož na dolnú časť stehien tesne nad kolenami — nie na jabĺčka. Prednú časť chodidiel polož na platformu a päty nechaj voľné.',
    'Odisti stroj a spusti päty do natiahnutia, ktoré dokážeš udržať. Kolená zostávajú pokrčené.',
    'Zatlač cez stranu chodidla pri palci do výrazného vystretia členka. Na chvíľu zastav.',
    'Spúšťaj pomaly. Ak závažia poskakujú, záťaž iba predstiera náročnosť.',
  ],
  mistakes: [
    {
      title: 'Polstrovanie tlačí na jabĺčka',
      body: 'To je kĺb, nie miesto na zaťaženie. Posuň oporu na dolnú časť stehien, aby sila prechádzala cez sval.',
    },
    {
      title: 'Odraz zo spodnej polohy',
      body: 'Výpony v sede sú zámerne pomalé. V natiahnutí zastav alebo uber kolík.',
    },
    {
      title: 'Krátke pumpovacie opakovania s obrovskou záťažou',
      body: 'Pohyb o päť centimetrov nie je výpon. Dosiahni natiahnutie aj vystretie, inak zapisuješ iba šum.',
    },
    {
      title: 'Zapisuješ ich ako výpony v stoji',
      body: 'Pokrčené kolená zvýraznia soleus. Práca s vystretými kolenami má vlastný cvik v katalógu. V LIFTAG ich drž oddelene.',
    },
  ],
  variations: [
    {
      slug: 'machine-standing-calf-raise',
      name: 'Výpony v stoji na stroji',
      note: 'Vystreté kolená, väčší dôraz na gastrocnemius; druhá polovica tréningu lýtok.',
    },
    {
      slug: 'standing-dumbbell-calf-raise',
      name: 'Výpony v stoji s jednoručkami',
      note: 'Keď nemáš stroj na výpony v sede. Stále ide o výpony — zapisuj ich ako samostatný cvik.',
    },
    {
      slug: 'leg-press-calf-raises',
      name: 'Výpony na leg presse',
      note: 'Rovnaký pohyb v členku na saniach, keď je stroj na výpony v sede obsadený.',
    },
    {
      slug: 'bodyweight-calf-raise',
      name: 'Výpony s vlastnou hmotnosťou',
      note: 'Cestovanie a vysoké počty opakovaní s úplným natiahnutím na schode.',
    },
  ],
  progressions: [
    'Ľahké výpony v sede v celom rozsahu s pauzou v dolnej polohe.',
    'V hornej polohe zastav bez preklopenia na vonkajšiu stranu chodidla.',
    'Prejdi na jednu nohu, keď jedna strana vždy podvádza v natiahnutí.',
    'Záťaž pridaj až vtedy, keď má každé pracovné opakovanie stále natiahnutie aj vystretie.',
  ],
  programming:
    'Po drepe alebo cviku v predklone urob 3–4 série po 8–15 opakovaní. Lýtka sa zotavujú rýchlejšie, než si myslí tvoje ego, no odrážané polovičné opakovania sa stále nepočítajú. Ak robíš aj výpony v stoji, ide o druhý cvik — nie o poznámku k tomuto.',
  relatedSlugs: [
    'machine-standing-calf-raise',
    'standing-dumbbell-calf-raise',
    'leg-press-calf-raises',
    'bodyweight-calf-raise',
  ],
} satisfies ExerciseOverlay
