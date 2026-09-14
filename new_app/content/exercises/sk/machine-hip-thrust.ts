import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-hip-thrust',
  metaDescription:
    'Hip thrust na stroji: výška podložky, úplné otvorenie bokov a samostatné zaznamenávanie práce sedacích svalov oproti hip thrustu s veľkou činkou v LIFTAG-u.',
  steps: [
    'Nastav zadnú podložku tak, aby ťa podopierala pri dolných lopatkách, nie pri krku. Opasok alebo páka má spočívať v záhybe bokov.',
    'Chodidlá polož tak, aby predkolenia boli hore takmer kolmé. Príliš ďaleko vpredu sa cvik zmení na nepríjemný most, príliš blízko preberú prácu kolená.',
    'Spevni stred tela, stiahni rebrá a potom zatlač celým chodidlom, kým sa boky úplne neotvoria a dotiahnutie nevykonajú sedacie svaly.',
    'Pod kontrolou sa spusti. Kotúče alebo blok neodrážaj od dolnej polohy, iba ak ti vyhovujú hlučné série s polovičným rozsahom.',
  ],
  mistakes: [
    {
      title: 'Prílišné prehnutie v krížoch pri dotiahnutí',
      body: 'Pohyb dokončujú sedacie svaly. Ak preberajú prácu kríže, stiahni rebrá a zníž záťaž. Vyššia podložka neznamená lepšie stiahnutie.',
    },
    {
      title: 'Zaznamenávanie ako hip thrust s veľkou činkou',
      body: 'Iné nastavenie, iné zaťaženie a iný osobný rekord. Použi tento identifikátor. Naskenuj štítok stroja, aby sa neotvoril cvik s veľkou činkou.',
    },
    {
      title: 'Chodidlá tak ďaleko, že každé opakovanie preberú zadné stehná',
      body: 'Posuň chodidlá dovnútra, kým nebudú predkolenia hore takmer zvislé. Práca zadných stehien je v poriadku; nechcené RDL na stroji pre sedacie svaly nepatrí do plánu.',
    },
    {
      title: 'Odraz zo spodnej polohy',
      body: 'Ak ťa opasok musí odraziť do ďalšieho opakovania, rozsah je falošný. Zastav centimeter nad dnom alebo uber jeden kotúč.',
    },
  ],
  variations: [
    {
      slug: 'barbell-hip-thrust',
      name: 'Hip thrust s veľkou činkou',
      note: 'Lavička a činka, náročnejšie nastavenie, rovnaký pohybový vzorec.',
    },
    {
      slug: 'glute-bridge',
      name: 'Glute bridge',
      note: 'Varianta na podlahe s kratším rozsahom a bez stroja.',
    },
    {
      slug: 'smith-machine-hip-thrust',
      name: 'Hip thrust na Smithovom stroji',
      note: 'Keď má fitko Smithov stroj a lavičku, ale nemá stanovište na hip thrust.',
    },
    {
      slug: 'cable-pull-through',
      name: 'Predklon s kladkou medzi nohami',
      note: 'Pohyb v bokoch s dôrazom na sedacie svaly zo stoja.',
    },
  ],
  progressions: [
    'Vlastná hmotnosť alebo prázdna páka, kým bude dotiahnutie pevným stiahnutím, nie švihom.',
    'Pracovné série po 8–12 opakovaní so stiahnutými rebrami v hornej polohe.',
    'Pauza pri dotiahnutí a až potom pridaj záťaž.',
    'Jednonožné varianty alebo varianty s gumou až po čistom pohybovom vzorci na oboch nohách; poznač si ich.',
  ],
  programming:
    'Hlavný cvik na sedacie svaly v dňoch so strojmi: 3–4 série po 8–12 opakovaní. Ak v iné dni cvičíš hip thrust s veľkou činkou, ide o iný identifikátor a graf zostane prehľadný. Zaznamenaj blok alebo záťaž kotúčov, ktorú stroj skutočne ukazuje, a jednotku zachovaj z týždňa na týždeň.',
  faqs: [
    {
      question: 'Mám zaznamenať hip thrust na stroji alebo s veľkou činkou?',
      answer:
        'Ten, na ktorom si cvičil. Stroj odstraňuje nastavovanie činky a zvyčajne mení použiteľnú záťaž. Ak ich zmiešaš pod hip thrust s veľkou činkou, oba rekordy stratia význam.',
    },
  ],
  relatedSlugs: ['barbell-hip-thrust', 'glute-bridge', 'smith-machine-hip-thrust', 'cable-pull-through'],
} satisfies ExerciseOverlay
