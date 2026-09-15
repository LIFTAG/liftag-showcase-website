import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'glute-bridge',
  metaDescription:
    'Zdvih panvy na podlahe: päty, poloha rebier a vystretie bokov; kratší rozsah zapisuj oddelene od hip thrustu s činkou či na stroji.',
  steps: [
    'Ľahni si na podlahu a celé chodidlá polož približne na šírku bokov. V hornej polohe majú byť predkolenia takmer zvislé, nie ďaleko pred telom.',
    'Stiahni rebrá a zatlač cez päty, kým sa boky úplne otvoria a vystretie dokončia sedacie svaly.',
    'Hore zastav. Nepridávaj druhé vystretie prehnutím drieku; podlaha určuje rozsah a nie je tu lavička, cez ktorú by si sa preniesol.',
    'Kontrolovane spusti boky, až sa jemne dotknú podlahy. Odraz nie je opakovanie.',
    'Pri záťaži podlož boky a zachovaj rovnaký štart na podlahe. Lavička pod chrbtom už znamená iný cvik.',
  ],
  mistakes: [
    {
      title: 'Prehýbanie krížov v hornej polohe',
      body: 'Pohyb dokončujú sedacie svaly. Ak prácu preberajú kríže, stiahni rebrá nadol a zníž záťaž.',
    },
    {
      title: 'Zapisovanie ako hip thrust',
      body: 'Podlaha skracuje rozsah pohybu. Hip thrust s oporou o lavičku aj hip thrust na stroji sú samostatné cviky. Ich výsledky s týmto cvikom nemiešaj.',
    },
    {
      title: 'Chodidlá príliš vpredu a prevaha zadných stehien',
      body: 'Posuň chodidlá bližšie, aby boli predkolenia hore takmer zvislé. Zapojenie zadných stehien je v poriadku, ale cieľom nie je nechtiac napodobňovať RDL na podlahe.',
    },
    {
      title: 'Chodidlá príliš blízko a prevaha predných stehien',
      body: 'Takéto nastavenie mení zdvih na zvláštny tlak nohami z podlahy. Nájdi polohu, v ktorej pohyb v bokoch dokončujú sedacie svaly, nie kvadricepsy.',
    },
  ],
  variations: [
    {
      slug: 'barbell-hip-thrust',
      name: 'Hip thrust s veľkou činkou',
      note: 'Horná časť chrbta sa opiera o lavičku. Väčší rozsah, vyššia záťaž a samostatný osobný rekord.',
    },
    {
      slug: 'machine-hip-thrust',
      name: 'Hip thrust na stroji',
      note: 'Rovnaký pohyb s väčším rozsahom, pri ktorom záťaž prenáša opasok alebo páka.',
    },
    {
      slug: 'single-leg-glute-bridge',
      name: 'Zdvih panvy na jednej nohe',
      note: 'Rovnaká podlaha, ale iba jedna noha. Náročnejšie aj bez pridávania kotúčov.',
    },
    {
      slug: 'cable-pull-through',
      name: 'Ťah lana cez nohy na kladke',
      note: 'Predklon v bokoch v stoji, keď chceš precvičiť sedacie svaly bez ležania.',
    },
  ],
  progressions: [
    'Zdvihy s vlastnou hmotnosťou, pauzou hore a rebrami stiahnutými nadol.',
    'Prejdi na variant na jednej nohe, ak pri obojnožnom vždy jedna strana pracuje menej.',
    'Záťaž pridaj až vtedy, keď pohyb hore dokončíš pevným stiahnutím sedacích svalov, nie švihom.',
    'Ak chceš väčší rozsah, ktorý umožňuje lavička, prejdi na hip thrust a zmeň aj cvik v denníku.',
  ],
  programming:
    'Doplnkový cvik alebo rozcvičenie sedacích svalov: 3–4 série po 8–15 opakovaní. Aj vlastná hmotnosť je platná záťaž, preto tréning zapíš. Ak počas tréningového bloku podložíš horný chrbát lavičkou, prejdi v denníku na hip thrust s veľkou činkou alebo na stroji. Graf zdvihov z podlahy tak zostane porovnateľný aj o mesiac.',
  equipmentAlternatives: [
    {
      slug: 'barbell-hip-thrust',
      name: 'Hip thrust s veľkou činkou',
      note: 'Ak chceš väčší rozsah a vyššiu záťaž, použi lavičku a zapisuj hip thrust ako samostatný cvik.',
    },
    {
      slug: 'cable-pull-through',
      name: 'Ťah lana cez nohy na kladke',
      note: 'Zachovaj objem cvikov na sedacie svaly cez predklon v bokoch, keď je miesto na podlahe obsadené.',
    },
  ],
  faqs: [
    {
      question: 'Je zdvih panvy iba ľahký hip thrust?',
      answer:
        'Nie. Podlaha zastaví boky skôr. Hip thrust na lavičke dovolí väčšie otvorenie aj vyššiu záťaž. Sú z rovnakej rodiny, no majú iný rozsah a samostatný záznam; číslo z hip thrustu neporovnávaj so zdvihom na podlahe.',
    },
  ],
  relatedSlugs: ['barbell-hip-thrust', 'machine-hip-thrust', 'cable-pull-through', 'single-leg-glute-bridge'],
} satisfies ExerciseOverlay
