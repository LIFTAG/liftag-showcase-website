import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'kneeling-ab-rollout',
  metaDescription:
    'Rozvíjanie brucha z kľaku: koliesko, pevný stred tela a samostatné zaznamenávanie rozvíjania z kľaku v LIFTAG-u oproti variante zo stoja a výdrži v planku.',
  steps: [
    'Kľakni si na podložku. Ruky polož na koliesko pod ramená. Zatni sedacie svaly, stiahni rebrá a predĺž krk. Je to pohyblivý plank, nie skok dopredu.',
    'Odvaľuj koliesko dopredu a vystieraj ruky. Boky sa pohybujú spolu s trupom. Prehnutie krížov na získanie ďalšieho rozsahu znamená koniec série, nie rekord.',
    'Zastav sa ešte vtedy, keď sa dokážeš pritiahnuť späť. Podlaha nie je cieľ. Dlhá línia, ktorú ovládaš, je lepšia než zrútené natiahnutie, z ktorého sa nevieš vrátiť.',
    'Širokými chrbtovými svalmi a bruchom pritiahni koliesko späť pod ramená. Neodliepaj sa z kolien a neťahaj ho domov švihom.',
    'Ak nemáš koliesko, rovnaký cvik môžeš vykonať s veľkou činkou a okrúhlymi kotúčmi. Stále používaj tento identifikátor.',
  ],
  mistakes: [
    {
      title: 'Prehnutie v krížoch v krajnej polohe',
      body: 'Základom cviku je spevnenie. Keď klesnú boky a rebrá sa roztvoria, visíš na chrbtici. Skráť odvalenie a rozsah si znovu zaslúž.',
    },
    {
      title: 'Zdvihanie bokov na uľahčenie návratu',
      body: 'Vystrelenie bokov nahor odľahčí brucho a zmení návrat na predklon. Zachovaj líniu. Ak to nedokážeš, odvalil si sa príliš ďaleko.',
    },
    {
      title: 'Zaznamenávanie variantu zo stoja sem',
      body: 'Rozvíjanie brucha zo stoja je iný identifikátor aj iná náročnosť. Rovnaké koliesko znamená iný graf. Cvik z kľaku zostáva tu.',
    },
    {
      title: 'Naháňanie podlahy pri každom opakovaní podľa videa',
      body: 'Úplný rozsah je ten, z ktorého sa dokážeš vrátiť bez prehnutia. Dotknúť sa podlahy v pokazenej línii neznamená dokončiť cvik.',
    },
  ],
  variations: [
    {
      slug: 'standing-ab-rollout',
      name: 'Rozvíjanie brucha zo stoja',
      note: 'Rovnaké koliesko zo stoja. Oveľa ťažší variant a iný identifikátor.',
    },
    {
      slug: 'plank',
      name: 'Plank',
      note: 'Spevnenie, ktoré sa tento cvik snaží rozhýbať. Použi ho, ak ťa koliesko stále zloží.',
    },
    {
      slug: 'machine-ab-crunch',
      name: 'Skracovačka na stroji',
      note: 'Ohýbanie so záťažou, keď chceš zrolovanie namiesto odolávania vystretiu.',
    },
    {
      slug: 'crunch',
      name: 'Skracovačka',
      note: 'Zrolovanie na podlahe, keď fitko nemá koliesko ani kladku.',
    },
  ],
  progressions: [
    'Krátky rozsah z kľaku s pevným stredom tela a pokojnými krížami.',
    'Odvalenie predlžuj iba vtedy, keď zostáva návrat čistý.',
    'V dlhej polohe zastav a až potom sa snaž dostať ďalej.',
    'Variant zo stoja až vtedy, keď je kľak ľahký. Zaznamenávaj ho pod vlastným identifikátorom.',
  ],
  programming:
    'Náročný cvik na stred tela: 3 série po 6–12 opakovaní. Sériu ukonči pri prvom prehnutí. Zaznamenaj variant z kľaku aj vtedy, keď si namiesto kolieska použil veľkú činku. Cvik zo stoja patrí pod jeho vlastný identifikátor. Ak minulý týždeň poznámka LIFTAG-u hovorí, že v polovici rozsahu prevzali prácu kríže, tento týždeň zostaň pri tomto rozsahu a nepridávaj opakovania.',
  equipmentAlternatives: [
    {
      slug: 'plank',
      name: 'Plank',
      note: 'Bez kolieska a veľkej činky trénuj spevnenie, ktoré by si inak odvaľoval.',
    },
    {
      slug: 'machine-ab-crunch',
      name: 'Skracovačka na stroji',
      note: 'Zaťažené brucho bez nároku na zručnosť odolávania vystretiu.',
    },
    {
      slug: 'standing-ab-rollout',
      name: 'Rozvíjanie brucha zo stoja',
      note: 'Iba keď je kľak skutočne ľahký. Nie je to náhrada za slabú sériu z kľaku.',
    },
  ],
  faqs: [
    {
      question: 'Kedy mám prejsť na rozvíjanie zo stoja?',
      answer:
        'Keď sú série z kľaku dlhé, bez prehnutia a návrat je úplne istý. Variant zo stoja má vlastný identifikátor. Nezaznamenávaj ho sem iba preto, že si použil rovnaké koliesko.',
    },
  ],
  relatedSlugs: ['plank', 'machine-ab-crunch', 'standing-ab-rollout', 'crunch'],
} satisfies ExerciseOverlay
