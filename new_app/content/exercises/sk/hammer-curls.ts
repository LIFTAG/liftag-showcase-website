import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'hammer-curls',
  metaDescription:
    'Kladivové zdvihy: neutrálny úchop s palcami hore, stabilné lakte a zapisovanie striktnej práce brachialisu oddelene od zdvihov s jednoručkami či veľkou činkou v LIFTAGu.',
  steps: [
    'Postav sa s jednoručkou v každej ruke, palce smerujú hore a paže sú dlhé. Neutrálny úchop drž počas celého pohybu; ak sa malíčky otočia, zmenil si cvik.',
    'Lakte drž pri trupe. Jednoručky putujú popri tele, nie pred ním ako pri predpažení.',
    'Zdvihni ich k ramenám, kým sa bicepsy a brachialis skrátia. Zápästia zostávajú nad lakťami a rukoväť v osi s predlaktím.',
    'Kontrolovane spusti do plného visu. Paže môžeš striedať alebo dvíhať naraz, no palce musia pri každom opakovaní smerovať hore.',
  ],
  mistakes: [
    {
      title: 'Otočenie dlaní hore a zápis ako rovnaký cvik',
      body: 'Len čo sa malíčky otočia hore, ide o bicepsový zdvih s jednoručkami v stoji s pridaným pohybom. Dokonči striktné kladivové zdvihy alebo vyber iný cvik; záznamy nemiešaj.',
    },
    {
      title: 'Zapisovanie ako bicepsové zdvihy s jednoručkami v stoji',
      body: 'Dlane hore a palce hore znamenajú inú záťaž aj inú prácu paže. Zachovaj hammer-curls; LIFTAG úchopy automaticky nezlúči.',
    },
    {
      title: 'Únik jednoručiek do predpaženia',
      body: 'Keď lakte odídu od rebier, cvik sa zmení na ramená. Horné paže prilep k trupu a ak nedržia, uber.',
    },
    {
      title: 'Vyhadzovanie jednoručiek zo stehien',
      body: 'Švih nie je práca brachialisu. Ak potrebuješ pohon, zvoľ menšiu váhu. Ťažký úchop si nechaj na dumbbell-farmers-walk.',
    },
  ],
  variations: [
    {
      slug: 'standing-dumbbell-bicep-curl',
      name: 'Bicepsový zdvih s jednoručkami v stoji',
      note: 'Protistrana s dlaňami hore, väčší dôraz na biceps pri rovnakom postoji.',
    },
    {
      slug: 'barbell-curl',
      name: 'Zdvih s veľkou činkou',
      note: 'Podhmat s jednou záťažou, keď chceš menšie skoky váhy.',
    },
    {
      slug: 'incline-dumbbell-curl',
      name: 'Zdvih jednoručiek na šikmej lavičke',
      note: 'Na šikmej lavičke môžeš začať neutrálne a využiť natiahnutie.',
    },
    {
      slug: 'dumbbell-farmers-walk',
      name: 'Chôdza s jednoručkami',
      note: 'Rovnaký úchop s palcami hore, no ide o nosenie namiesto zdvihu.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, palce hore počas celého opakovania a bez pohybu trupu.',
    'Pracovné série po 8–12 opakovaní so stabilnými lakťami.',
    'Pauzu v spodnej polohe pridaj skôr, než zvýšiš záťaž.',
    'Na zdvih cez telo prejdi až po zvládnutí priamej dráhy; úpravu uveď v poznámke.',
  ],
  programming:
    'Práca pre brachialis a predlaktie: 3–4 série po 8–12 opakovaní po zdvihoch s dlaňami hore. Tieto striktné zdvihy pod ne nezapisuj. Zapisuj hmotnosť jednej jednoručky. Zdvih cez telo patrí k tomuto cviku iba s palcami hore; dráhu uveď v poznámke. Úchop, ktorý tu zlyhá, zaťaží aj chôdza s jednoručkami, preto oba cviky nerob ťažko v rovnakej hodine, ak to nie je zámer.',
  faqs: [
    {
      question: 'Mám robiť zdvih cez telo?',
      answer:
        'Predvolená je priama dráha nahor. Zdvih smerom k opačnému prsnému svalu je stále kladivový, ak palec zostane hore, no záťaž sa nebude zhodovať. Vyber jednu verziu pre blok a druhú uveď v poznámke; číslo z krížovej dráhy neporovnávaj so striktným týždňom.',
    },
  ],
  relatedSlugs: [
    'barbell-curl',
    'standing-dumbbell-bicep-curl',
    'dumbbell-farmers-walk',
    'incline-dumbbell-curl',
  ],
} satisfies ExerciseOverlay
