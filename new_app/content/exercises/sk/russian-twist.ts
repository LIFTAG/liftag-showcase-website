import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'russian-twist',
  metaDescription:
    'Ruský twist: rotácia v sede, pokojná panva a zapisovanie ľavej a pravej strany bez miešania so skracovačkami či zdvíhaním nôh vo vise v LIFTAGu.',
  steps: [
    'Sadni si, mierne sa zakloň, aby sa zapojilo brucho, a drž dlhý chrbát. Začni s pätami na zemi; zrútený driek nie je nastavenie.',
    'Ruky spoj pri hrudníku alebo tam drž ľahký kotúč. Dlhé paže s kotúčom na konci páky prenášajú prácu na ramená.',
    'Rotuj hrudným košom a panvu nechaj približne čelnú. Dotkni sa podlahy vedľa boku iba vtedy, keď sa otočil celý trup.',
    'Kontrolovane prejdi stredom a otoč sa na opačnú stranu. Neodrážaj sa zo strany na stranu cez zrútený driek.',
    'Dýchaj a ešte pred sériou si vyber pravidlo: každý dotyk alebo ľavá–pravá dvojica ako jedno opakovanie. Budúci týždeň ho nemen.',
  ],
  mistakes: [
    {
      title: 'Švihanie kotúčom pri nehybnom trupe',
      body: 'Ak paže kreslia stierač a rebrá sa neotáčajú, nie je to twist. Skráť páku, drž ruky pri hrudníku a spomaľ.',
    },
    {
      title: 'Zaguľatenie do skracovačky',
      body: 'Zbalená odrážaná skracovačka s dotykom do strany je stále skracovačka. Zakloň sa, predĺž chrbticu a rotuj; ak to nejde, sadni vyššie a odlož kotúč.',
    },
    {
      title: 'Počítanie strán ako dvoch cvikov',
      body: 'Vyber dotyky alebo dvojice a napíš to do prvej poznámky. Zmena počítania uprostred bloku vytvorí falošný objemový rekord v LIFTAGu.',
    },
    {
      title: 'Nohy lietajú a fungujú ako kyvadlo',
      body: 'Päty nechaj dole, kým panva zostane pokojná. Päty hore sú náročnejšie spevnenie, nie spôsob, ako rotáciu oklamať kopnutím.',
    },
  ],
  variations: [
    {
      slug: 'plank',
      name: 'Plank',
      note: 'Antirotačné spevnenie, keď sa twist rozpadá.',
    },
    {
      slug: 'crunch',
      name: 'Skracovačky',
      note: 'Pohyb vpred-vzad; twist pod ne nezapisuj len preto, že oba cviky cítiš v bruchu.',
    },
    {
      slug: 'hanging-leg-raise',
      name: 'Zdvíhanie nôh vo vise',
      note: 'Flexia vo vise, keď chceš hýbať nohami namiesto rotácie.',
    },
    {
      slug: 'machine-ab-crunch',
      name: 'Skracovačky na stroji',
      note: 'Zaťažené zohnutie bez rotácie, keď cieľom nie je twist.',
    },
  ],
  progressions: [
    'Vlastná váha, päty na zemi, pomalé otočenia a pauza na každej strane.',
    'Ľahký kotúč pri hrudníku pridaj, keď panva zostáva na mieste.',
    'Päty zdvihni až vtedy, keď udržíš spevnenie celú sériu.',
    'Záťaž pridávaj pomaly; rotácia nepotrebuje 20 kg kotúč, aby sa počítala.',
  ],
  programming:
    'Doplnková rotácia: 3 série po 10–16 celkových dotykoch alebo 8–12 na stranu. Poznač si, ktoré počítanie používaš, a zapíš kotúč, ak ho držíš. Nepresúvaj cvik na skracovačky, plank alebo zdvíhanie nôh vo vise len preto, že brucho páli; odpočívaj tak, aby sa ďalšia séria otáčala rebrami, nie pažami.',
  faqs: [
    {
      question: 'Počítam každú stranu ako opakovanie?',
      answer:
        'Obe pravidlá sú v poriadku, ak ich nemeníš: každý dotyk podlahy alebo dvojica ľavá–pravá ako jedno opakovanie. Pravidlo zapíš do prvej série v LIFTAGu a uprostred bloku ho nemeň len preto, aby číslo vyzeralo väčšie.',
    },
  ],
  relatedSlugs: ['plank', 'hanging-leg-raise', 'machine-ab-crunch', 'crunch'],
} satisfies ExerciseOverlay
