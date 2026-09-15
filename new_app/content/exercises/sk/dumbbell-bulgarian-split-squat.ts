import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'dumbbell-bulgarian-split-squat',
  metaDescription:
    'Bulharský drep s jednoručkami: výška zadnej nohy, uhol predného predkolenia a zaznamenávanie každej nohy v LIFTAG.',
  steps: [
    'Postav sa dlhý krok pred lavičku vo výške kolena. Šnúrky zadnej nohy polož na podložku, nie špičku natlačenú na vysokú debnu.',
    'Jednoručky drž pri bokoch. Predné chodidlo umiestni tak ďaleko, aby predkolenie dole ostalo približne zvislé.',
    'Spúšťaj zadné koleno k podlahe. Predné koleno sleduje stred chodidla; mierny predklon je v poriadku, zrútenie nie.',
    'Tlač cez pätu a stred predného chodidla do stoja. Dokonči sériu na jednej nohe a potom vymeň stranu.',
    'Zadný bok nenechaj otvárať sa do rotácie. Ak sa dvíha predná päta, postoj je príliš krátky.',
  ],
  mistakes: [
    {
      title: 'Zadnú nohu máš príliš vysoko',
      body: 'Debna nad kolenom zmení cvik na naťahovanie ohýbačov bedra s jednoručkami. Začni vo výške kolena alebo nižšie.',
    },
    {
      title: 'Predné chodidlo je príliš blízko',
      body: 'Dvíha sa päta, koleno ide ďaleko za prsty a zadný bok padá. Predĺž krok, kým sa predkolenie upokojí.',
    },
    {
      title: 'Odrazíš zadné koleno od zeme',
      body: 'Náročná je spodná poloha. Podlahy sa dotkni alebo sa tesne zastav, nepouži ju ako trampolínu.',
    },
    {
      title: 'Zapisuješ ho ako split squat alebo výpad',
      body: 'Vyzdvihnutá zadná noha znamená iný rozsah a rekord. Zachovaj tento cvik a zapisuj každú nohu.',
    },
  ],
  variations: [
    {
      slug: 'split-squat',
      name: 'Split squat',
      note: 'Rovnaký vzor so zadným chodidlom na zemi. Najprv sa na ňom nauč postoj.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Kroková verzia, keď chceš chôdzu a väčší rozsah.',
    },
    {
      slug: 'dumbbell-lunge',
      name: 'Výpad s jednoručkami',
      note: 'Na mieste alebo s krokom, stále dve jednoručky bez lavičky.',
    },
    {
      slug: 'smith-machine-split-squat',
      name: 'Bulharský drep na Smithovom stroji',
      note: 'Vedená os, keď limitom nie sú jednoručky, ale rovnováha.',
    },
  ],
  progressions: [
    'Split squat s vlastnou váhou, kým je postoj istý.',
    'Bulharský drep s vlastnou váhou do rovnakej hĺbky.',
    'Pridaj jednoručky, keď obe nohy dosiahnu rovnakú hĺbku vo všetkých sériách.',
    'Pauza dole alebo nižšia zadná podložka, keď sa kvadricepsy zastavia.',
  ],
  programming:
    'Doplnok po hlavnom drepe: tri až štyri série po 6–12 na každú nohu. Medzi nohami odpočívaj, ak sa druhá strana vždy rozpadne. V LIFTAG zapisuj každú nohu — práve rozdiel strán je pointa, nie spoločný súčet „24 opakovaní“. Keď vynecháš lavičku, prepni na split squat, aby bol budúci graf pravdivý.',
  equipmentAlternatives: [
    {
      slug: 'split-squat',
      name: 'Split squat',
      note: 'Bez lavičky; rovnaký jednonožný vzor s menším natiahnutím.',
    },
    {
      slug: 'walking-lunge',
      name: 'Chôdzový výpad',
      note: 'Zachovaj prácu v rozkročenom postoji, keď sú všetky lavičky obsadené.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Obojstranný objem pre kvadricepsy, ak limitom je zadná noha.',
    },
  ],
  faqs: [
    {
      question: 'Mám sa nakláňať dopredu alebo zostať vzpriamene?',
      answer:
        'Mierny predklon viac zaťaží sedacie svaly a boky, vzpriamený trup viac kvadricepsy. Vyber jeden spôsob a opakuj ho. Každý týždeň iný náklon je nový cvik, ktorý nezapisuješ.',
    },
    {
      question: 'Mám obe nohy zapísať ako jednu sériu?',
      answer:
        'Zapisuj každú nohu. Ak má LIFTAG iba jeden riadok, uveď slabšiu stranu vo váhe a opakovaniach a silnejšiu dopíš do poznámky. Rekord z ľahšej strany skrýva nerovnováhu.',
    },
  ],
  relatedSlugs: [
    'split-squat',
    'walking-lunge',
    'dumbbell-lunge',
    'barbell-bulgarian-split-squat',
    'barbell-back-squat',
  ],
} satisfies ExerciseOverlay
