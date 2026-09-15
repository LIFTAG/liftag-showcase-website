import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'back-extension-hyperextension',
  metaDescription:
    'Hyperextenzia: predklon v bedrách na hyperextenčnej lavici, zakončenie v neutrálnej polohe a poctivé zaznamenávanie oddelene od RDL či good morning.',
  steps: [
    'Nastav podložku do ohybu bedier, nie pod brucho. Stehná majú byť podopreté a členky zaistené. V bedrách sa musíš vedieť predkloniť bez ohýbania v páse.',
    'Začni s dlhým telom: aktivuj sedacie svaly, stiahni rebrá a drž krk v predĺžení chrbtice. Ruky polož na hrudník. Za hlavu ich dávaj až vtedy, keď je táto poloha ľahká.',
    'Predkloň sa, kým sa minie pohyblivosť zadných stehien alebo pevnosť spevnenia. Voľný „handrový“ vis je rozsah navyše, ktorý budeš cestou hore doháňať.',
    'Zatlač boky do podložky a vráť sa do rovnej línie. To je koncová poloha. Prehnutie ako kobra je tlak na driek, nie extra práca sedacích svalov.',
    'Ak cvik zaťažíš, objím kotúč na hrudi. Zapisuj kotúč. Závažie za hlavou príde neskôr, ak vôbec.',
  ],
  mistakes: [
    {
      title: 'Vystieranie za rovnú líniu',
      body: 'Názov hovorí hyperextenzia, ale cvik nevyžaduje prehnutie. Zastav sa pri dlhom rovnom tele. Ak chceš viac práce, spomaľ spúšťanie alebo pridaj kotúč, nie záklon.',
    },
    {
      title: 'Príliš vysoko nastavená podložka, z cviku je sed-ľah',
      body: 'Ak je podložka na bruchu, ohýbaš chrbticu proti opore. Spusť ju k bokom a predkloň sa v bedrách.',
    },
    {
      title: 'Zapisovanie ako good morning alebo RDL',
      body: 'Činka na chrbte alebo v rukách vytvára inú páku. Nechaj tento identifikátor oddelený, aj keď na videu vyzerá predklon podobne.',
    },
    {
      title: 'Trhanie hore so zaguľateným chrbtom',
      body: 'Telo sa zo zaťaženej natiahnutej polohy vytrhne. Dole spevni stred tela a potom sa postav. Ak to nejde, skráť rozsah pohybu.',
    },
  ],
  variations: [
    {
      slug: 'barbell-good-morning',
      name: 'Good morning s veľkou činkou',
      note: 'Rovnaký predklon, činka na chrbte a väčšie axiálne zaťaženie. Ide o iný identifikátor.',
    },
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Ruky držia činku. Pre väčšinu lifterov ide o základný cvik s predklonom.',
    },
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Ťah zo zeme. Hyperextenzia je doplnok, nie náhrada mŕtveho ťahu v denníku.',
    },
    {
      slug: 'glute-bridge',
      name: 'Glute bridge',
      note: 'Vystieranie bedier na podlahe, keď nemáš hyperextenčnú lavicu.',
    },
  ],
  progressions: [
    'Vlastná hmotnosť, ruky na hrudi, zastavenie v dlhej rovnej línii.',
    'Ruky za hlavou až vtedy, keď zostáva koncová poloha neutrálna.',
    'Kotúč na hrudi. Zapisuj skutočný kotúč, nie odhad.',
    'Ak sa poctivý rozsah minie skôr než záťaž, spomaľ spúšťanie.',
  ],
  programming:
    'Doplnkový cvik s predklonom: 3–4 série po 8–15 opakovaní po ťahu alebo v druhý deň zameraný na zadnú stranu tela. Vlastnú hmotnosť zapisuj ako opakovania bez záťaže. Kotúč patrí do poľa pre váhu. Tieto čísla nepridávaj do odhadu 1RM pre RDL ani good morning. Ak minulý týždeň poznámka hovorila o prehnutí hore, tento týždeň je to pokyn, nie dôvod pridať 5 kg.',
  equipmentAlternatives: [
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Základný predklon, keď fitko nemá 45° lavicu ani GHD.',
    },
    {
      slug: 'barbell-good-morning',
      name: 'Good morning s veľkou činkou',
      note: 'Predklon s činkou na chrbte, ak chceš väčšie axiálne zaťaženie.',
    },
    {
      slug: 'glute-bridge',
      name: 'Glute bridge',
      note: 'Vystieranie bedier na podlahe, keď je hyperextenzia obsadená alebo trénuješ doma.',
    },
  ],
  faqs: [
    {
      question: 'Mám sa v hornej polohe zakláňať za neutrálnu líniu?',
      answer:
        'Nie. Koniec je v neutrálnej polohe. Záklon ako kobra zaťaží driek, nie ďalšie sedacie svaly. Ak chceš ťažší cvik, hore zastav, spomaľ spúšťanie alebo objím kotúč. Kotúč zapíš, aby graf zodpovedal vykonanej sérii.',
    },
  ],
  relatedSlugs: [
    'barbell-good-morning',
    'barbell-romanian-deadlift-rdl',
    'conventional-deadlift',
    'nordic-hamstring-curl',
  ],
} satisfies ExerciseOverlay
