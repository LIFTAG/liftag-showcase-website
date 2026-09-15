import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-lunge',
  metaDescription:
    'Výpad s veľkou činkou: nastavenie stojana, rovnováha a dôvod, prečo si máš variant s jednoručkami najprv dokonale osvojiť.',
  steps: [
    'Nastav činku v stojane do výšky pre zadný drep, bezpečnostné dorazy nastav tak, aby si na ne mohol činku odložiť, a uvoľni si dostatok priestoru na krok. Činka patrí na hornú časť chrbta, nie na krk.',
    'Vyjdi zo stojana, spevni stred tela a vykroč dopredu do dĺžky kroku, ktorú už bezpečne zvládaš s jednoručkami. Celé predné chodidlo nechaj na podlahe a koleno veď v smere špičiek.',
    'Spusť obe kolená a potom zatlač predným chodidlom do podlahy, aby si sa vrátil. Činka má zostať nad stredom predného chodidla; ak sa od neho odchýli, sériu ukonči.',
    'Výpad na mieste, či už dopredu alebo dozadu, umožní bezpečnejšie vrátiť činku do stojana než chôdzový výpad s veľkou činkou. Vyber si variant, pri ktorom dokážeš činku bez zakopnutia odložiť.',
  ],
  mistakes: [
    {
      title: 'Pridávanie záťaže na pohyb, ktorý ešte nezvládaš',
      body: 'Ak sa ti výpady s jednoručkami stále kývajú, činka na chrbte problém nevyrieši. Zostaň pri výpadoch s jednoručkami, kým nebude krok úplne istý.',
    },
    {
      title: 'Chôdzové výpady v preplnenej uličke',
      body: 'Zlyhaný krok s činkou je iný problém než zlyhaný krok s jednoručkami. Použi plošinu, stojan alebo cvič na mieste.',
    },
    {
      title: 'Chodidlá v jednej úzkej čiare pod činkou',
      body: 'Dopadaj približne na šírku bokov. Úzky krok spolu s vysoko uloženým ťažiskom môže činku zhodiť do strany.',
    },
    {
      title: 'Zaznamenávanie chôdzových výpadov a výpadov s činkou ako jedného rekordu',
      body: 'Ide o inú pomôcku a inú náročnosť na rovnováhu. Tento identifikátor používaj iba pre veľkú činku.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Variant, ktorý by si mal mať zvládnutý ako prvý.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Variant s presunom; pred veľkou činkou ho cvič s jednoručkami alebo v goblet držaní.',
    },
    {
      slug: 'smith-machine-lunge',
      name: 'Výpad na Smithovom stroji',
      note: 'Vedená činka, keď chceš záťaž výpadu bez vykročenia zo stojana.',
    },
    {
      slug: 'barbell-bulgarian-split-squat',
      name: 'Bulharský drep s veľkou činkou',
      note: 'Zadná noha je vyložená, takže na bezpečný ústup máš ešte menej priestoru. Pokročilý variant.',
    },
  ],
  progressions: [
    'Cvičenie s vlastnou hmotnosťou, potom výpady s jednoručkami s rovnakou dĺžkou kroku, akú použiješ s činkou.',
    'Výpady na mieste s prázdnou činkou v stojane a nastavenými dorazmi.',
    'Pracovné série po 6–10 opakovaní na každú nohu so záťažou, ktorú dokážeš bez tancovania znovu uložiť do stojana.',
    'Smithov stroj alebo delený drep, ak ťa obmedzuje samotná chôdza.',
  ],
  programming:
    'Špecializovaný jednonožný cvik s veľkou činkou, nie začiatočnícky krok v progresii: 3–4 série po 6–10 opakovaní na každú nohu. Záťaž bude oveľa nižšia než pri zadnom drepe. Zaznamenávaj aj oddych, pretože tieto série sa rýchlo nazbierajú. Ak LIFTAG ukáže skok v týždni, keď si začal odrážať zadné koleno od podlahy, za týmto rekordom sa neoplatí naháňať.',
  relatedSlugs: ['dumbbell-lunge', 'walking-lunge', 'split-squat', 'barbell-back-squat'],
} satisfies ExerciseOverlay
