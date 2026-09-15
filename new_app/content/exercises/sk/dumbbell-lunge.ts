import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-lunge',
  metaDescription:
    'Výpad s jednoručkami: krok dopredu, dráha kolena a oddelenie spätných či chôdzových výpadov v LIFTAGu.',
  steps: [
    'Postav sa s jednoručkami pri bokoch, hánky smerujú dopredu a ramená sú stabilné. Vykroč dopredu do postoja, v ktorom dokážeš ticho pristáť.',
    'Zníž obe kolená. Predné chodidlo zostáva celé na podlahe, koleno sleduje špičku a trup drž nad panvou, nie zložený k prednej holeni.',
    'Vytlač sa predným chodidlom späť alebo pokračuj v chôdzi, ak je to zámer série. Jednoručky zostávajú pokojné; ak sa hojdajú, do kroku padáš.',
    'Kratší krok viac zaťaží koleno, dlhší bok. Nehľadaj presný obraz 90°; drž opakovateľnú hĺbku, ktorá nedráždi predné koleno.',
  ],
  mistakes: [
    {
      title: 'Hojdanie jednoručiek ako metronómov',
      body: 'Ruky zostávajú pokojné. Hojdajúca sa jednoručka znamená, že trup zaostáva. Dole zastav alebo zníž váhu.',
    },
    {
      title: 'Vpadávanie predného kolena pri návrate',
      body: 'Koleno veď v smere špičky. Ak sa klenba zosype, skráť krok alebo uber, kým koleno zostane v línii.',
    },
    {
      title: 'Zapisovanie spätných výpadov sem',
      body: 'Krok dozadu má iný dopad a často aj inú záťaž. Použi dumbbell-reverse-lunge.',
    },
    {
      title: 'Skrátenie hĺbky, keď sú jednoručky ťažšie',
      body: 'Ak sa v štvrtom týždni výpad zmení na uklonenie, rekord je falošný. Natoč si jednu stranu alebo si urč cieľ pre zadné koleno.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-reverse-lunge',
      name: 'Spätný výpad s jednoručkami',
      note: 'Krok dozadu býva šetrnejší k prednému kolenu a dopadu.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Pokračuješ vpred, čo vyžaduje viac rovnováhy a unaví celé telo.',
    },
    {
      slug: 'split-squat',
      name: 'Split drep',
      note: 'Chodidlá zostávajú na mieste; vhodné, keď je problémom samotný krok.',
    },
    {
      slug: 'dumbbell-bulgarian-split-squat',
      name: 'Bulharský drep s jednoručkami',
      note: 'Zadná noha je vyvýšená; cvik je náročnejší a horšie sa v ňom skrýva slabá technika.',
    },
  ],
  progressions: [
    'Výpady s vlastnou váhou alebo split drepy, kým bude dopad tichý.',
    'Ľahké jednoručky na mieste, 8–12 opakovaní na každú nohu.',
    'Záťaž pridaj, keď obe strany dosahujú rovnakú hĺbku a jednoručky sa nehýbu.',
    'Na spätné, chôdzové alebo bulharské drepy prejdi až vtedy, keď základný krok nie je limitom.',
  ],
  programming:
    'Predvolený zaťažený výpad: 3–4 série po 8–12 opakovaní na každú nohu po drepe. Zapisuj pár jednoručiek, nie všeobecné „výpady“. Ak v polovici bloku prejdeš na spätné výpady, zmeň cvik v katalógu, inak odhadované 1RM mieša dva odlišné dopady.',
  faqs: [
    {
      question: 'Sú pri bolesti kolena lepšie výpady dopredu alebo dozadu?',
      answer:
        'Najprv skús spätný výpad: predné chodidlo zostáva na mieste a nedostávaš sa prudko do uhla prednej holene. Ak je spätný čistý a predný nie, naplánuj spätný a tento cvik si nechaj na neskôr. Bolestivý krok dopredu nepretláčaj len preto, aby si „odcvičil výpady“.',
    },
  ],
  relatedSlugs: ['walking-lunge', 'dumbbell-reverse-lunge', 'split-squat', 'dumbbell-goblet-squat'],
} satisfies ExerciseOverlay
