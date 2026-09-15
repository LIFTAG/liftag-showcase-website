import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-curl',
  metaDescription:
    'Zdvih s veľkou činkou: postoj, poloha lakťov a zapisovanie striktných zdvihov v LIFTAGu bez miešania EZ činky či cheat zdvihov do rovnakého grafu.',
  steps: [
    'Postav sa vzpriamene, uchop činku podhmatom na šírku ramien a nechaj ju visieť vo vystretých pažiach. Rebrá drž dole a sedacie svaly zľahka spevni.',
    'Lakte drž pri trupe. Môžu sa posunúť o pár centimetrov, nesmú však odštartovať švih.',
    'Zdvihni činku k ramenám, kým sa bicepsy úplne skrátia. Zápästia zostávajú v jednej línii a nelámu sa dozadu.',
    'Kontrolovane spúšťaj do plného visu. Spodná poloha je natiahnutie, nie odraz od stehien.',
  ],
  mistakes: [
    {
      title: 'Premena každého opakovania na švih bokmi',
      body: 'Mierna pomoc telom pri skutočne poslednom opakovaní je jedna vec. Séria švihov je nadhod s podhmatom. Zníž záťaž alebo poznamenaj „cheat“, aby bol PR poctivý.',
    },
    {
      title: 'Zapisovanie EZ zdvihov ako zdvihov s veľkou činkou',
      body: 'Zahnutie EZ činky väčšine zápästí uľaví a zvyčajne dovolí väčšiu záťaž. Druhý cvik v katalógu je ez-bar-curl — použi ho.',
    },
    {
      title: 'Skrátenie spodnej polovice pohybu',
      body: 'Ak činka nikdy nedosiahne dlhé paže, trénuješ iba kontrakciu. Využi celý vis.',
    },
    {
      title: 'Zakláňanie, až kým cvik nevyzerá ako príťah',
      body: 'Len čo zmeníš uhol trupu, do série sa zapoja predné ramená a driek. Narovnaj sa alebo uber.',
    },
  ],
  variations: [
    {
      slug: 'ez-bar-curl',
      name: 'Zdvih s EZ činkou',
      note: 'Šetrnejší k zápästiam, stále ide o zdvih v stoji.',
    },
    {
      slug: 'incline-dumbbell-curl',
      name: 'Zdvih jednoručiek na šikmej lavičke',
      note: 'Biceps je v predĺženej polohe, bez činky.',
    },
    {
      slug: 'standing-cable-bicep-curl',
      name: 'Bicepsový zdvih na kladke v stoji',
      note: 'Stále napätie a jednoduché pridávanie malých kotúčov.',
    },
    {
      slug: 'hammer-curls',
      name: 'Kladivové zdvihy',
      note: 'Neutrálny úchop, väčší dôraz na brachialis a predlaktie.',
    },
  ],
  progressions: [
    'Prázdna alebo ľahká činka, striktné tempo a plný vis.',
    'Pracovné série po 6–10 opakovaní, pri ktorých pohyb nezačína trup.',
    'Záťaž pridaj, až keď každá pracovná séria zostane striktná.',
    'Cheat alebo pauzu v natiahnutí používaj iba v naplánovanej poslednej sérii a uveď ju v poznámke.',
  ],
  programming:
    'Hlavný bicepsový cvik: 3–4 série po 6–10 opakovaní, nie nadhod s premiestnením. Ak je činka skutočne ťažká, odpočívaj 90–120 sekúnd. Zhyby už bicepsy zaťažujú; ak v ten deň robíš aj ťažké zdvihy, jeden cvik nechaj skôr na prekrvenie. Frekvenčný prehľad LIFTAGu ukáže, či oba cviky stále vrstvíš.',
  faqs: [
    {
      question: 'Mám používať cheat zdvih?',
      answer:
        'Nie ako predvolenú verziu. Striktné zdvihy patria k tomuto cviku. Ak naplánuješ cheat sériu, naďalej používaj barbell-curl a do poznámky série napíš „cheat“, aby si jej číslo neporovnával so striktným týždňom.',
    },
  ],
  relatedSlugs: [
    'ez-bar-curl',
    'incline-dumbbell-curl',
    'chin-up',
    'standing-dumbbell-bicep-curl',
    'hammer-curls',
  ],
} satisfies ExerciseOverlay
