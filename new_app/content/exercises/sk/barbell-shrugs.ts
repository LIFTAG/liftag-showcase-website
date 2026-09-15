import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-shrugs',
  metaDescription:
    'Krčenie ramien s veľkou činkou: priamy pohyb nahor, výdrž v hornej polohe a zaznamenávanie v LIFTAGu bez miešania s jednoručkami alebo trap barom.',
  steps: [
    'Stoj s činkou pri stehnách, nadhmatom alebo zmiešaným úchopom, ako pri dotiahnutí mŕtveho ťahu. Hrudník drž hore a krk predĺž. Predklon v páse by z toho urobil príťah.',
    'Zdvihni ramená priamo smerom k ušiam. Nekrúž nimi. V hornej polohe chvíľu zotrvaj, aby skutočne pracovali trapézy; kotúče pritom iba neodrážaj.',
    'Spúšťaj ramená, kým sa trapézy nenatiahnu a činka nebude voľne visieť. Táto predĺžená poloha je začiatkom ďalšieho opakovania, nie oddychom s pokrčenými lakťami.',
    'Ruky zostávajú vystreté. Ak činka škriabe nahor po stehnách a lakte sa pokrčia, robíš príťah veľkej činky k brade.',
    'Popruhy použi, keď zlyháva úchop a cieľom sú trapézy. Do poznámky uveď „popruhy“, aby graf zodpovedal skutočnosti.',
  ],
  mistakes: [
    {
      title: 'Krúženie ramenami',
      body: 'Krčenie ramien v kruhu dopredu je iba divadlo a spoľahlivý spôsob, ako podráždiť akromioklavikulárny kĺb. Hore, podrž, dole. Trapézy ramená zdvíhajú, neobiehajú.',
    },
    {
      title: 'Zaznamenávanie krčenia s jednoručkami alebo trap barom sem',
      body: 'Jednoručky po bokoch umožnia väčšie natiahnutie. Trap bar je iná pomôcka a zvyčajne aj iná záťaž. Pre oba varianty existujú samostatné identifikátory, použi ich.',
    },
    {
      title: 'Premena cviku na príťah k brade',
      body: 'Pokrčené lakte a činka, ktorá cestuje po tele nahor, znamenajú iný cvik. Pri krčení zostávajú ruky dlhé. Ak chceš tento príťah, zaznamenaj ho ako príťah veľkej činky k brade.',
    },
    {
      title: 'Odraz ťažkej činky pri trojiciach',
      body: 'Falošné 1RM bez výdrže nie je rekord trapézov. Zníž záťaž, kým dokážeš v hornej polohe zotrvať. LIFTAG odraz uloží, ak ho zaznamenáš, ale na budúci týždeň sa za ním nežeň.',
    },
  ],
  variations: [
    {
      slug: 'dumbbell-shrug',
      name: 'Krčenie ramien s jednoručkami',
      note: 'Jednoručky po bokoch zvyčajne umožnia väčšie natiahnutie. Iný identifikátor, iný graf.',
    },
    {
      slug: 'trap-bar-shrug',
      name: 'Krčenie ramien s trap barom',
      note: 'Neutrálny úchop a menšie obtieranie o stehná, často sa dá naložiť viac. Stále nejde o túto veľkú činku.',
    },
    {
      slug: 'cable-shrug',
      name: 'Krčenie ramien na kladke',
      note: 'Plynulé napätie, keď činka zvádza k odrážaniu.',
    },
    {
      slug: 'dumbbell-farmers-walk',
      name: 'Chôdza farmára s jednoručkami',
      note: 'Chôdza so záťažou, ak je krčenie iba doplnkom k tréningu chôdze.',
    },
  ],
  progressions: [
    'Ľahká činka, dvojsekundová výdrž hore a úplné natiahnutie dole.',
    'Záťaž pridaj, keď výdrž zostáva zachovaná a lakte ostávajú vystreté.',
    'Popruhy použi, keď ťa obmedzuje úchop, a poznač si ich.',
    'Činku za chrbát dávaj iba vtedy, ak chceš práve túto dráhu. Do poznámky série napíš „za chrbtom“. Stále ide o tento identifikátor.',
  ],
  programming:
    'Doplnkový cvik po ťahových cvikoch: 3–4 série po 8–15 opakovaní. Zaznamenávaj hmotnosť činky, nie súčet dvojice jednoručiek. Nie je to krčenie s jednoručkami ani s trap barom. Rekord v LIFTAGu má význam iba vtedy, ak si udržal výdrž hore. Oddychuj tak dlho, aby ďalšia séria nebola súťažou v úchope, ak práve to nie je cieľ.',
  equipmentAlternatives: [
    {
      slug: 'dumbbell-shrug',
      name: 'Krčenie ramien s jednoručkami',
      note: 'Bežná náhrada, keď nemáš veľkú činku alebo chceš väčšie natiahnutie v dolnej polohe.',
    },
    {
      slug: 'trap-bar-shrug',
      name: 'Krčenie ramien s trap barom',
      note: 'Použi hexagonálnu os, keď rovná činka škriabe po stehnách alebo ti vyhovuje neutrálny úchop.',
    },
    {
      slug: 'cable-shrug',
      name: 'Krčenie ramien na kladke',
      note: 'Zachová pohybový vzorec, keď nie sú k dispozícii kotúče ani jednoručky.',
    },
  ],
  faqs: [
    {
      question: 'Záleží grafu na veľkej činke, jednoručkách alebo trap bare?',
      answer:
        'Áno. Činka vpredu má menší rozsah než jednoručky po bokoch. Trap bar je praktický kompromis. Krčenie s veľkou činkou, jednoručkami a trap barom veď pod samostatnými identifikátormi, aby zmena pomôcky nevyzerala ako záhadný rekord.',
    },
  ],
  relatedSlugs: ['dumbbell-shrug', 'dumbbell-farmers-walk', 'trap-bar-shrug', 'barbell-upright-row'],
} satisfies ExerciseOverlay
