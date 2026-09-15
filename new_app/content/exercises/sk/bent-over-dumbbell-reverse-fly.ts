import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'bent-over-dumbbell-reverse-fly',
  metaDescription:
    'Rozpažovanie s jednoručkami v predklone: drž hip hinge, veď pohyb lakťami a zapisuj objem zadných deltov oddelene od face pulls, príťahov a pec decku v LIFTAGu.',
  steps: [
    'Vezmi ľahké jednoručky, predkloň sa v bedrách s dlhým chrbtom a nechaj paže visieť pod ramenami. Lakte mierne pokrč a tento uhol počas pohybu nemen.',
    'Rozpaž paže do strán a mierne dozadu, kým sa nedostanú približne do úrovne trupu. Veď pohyb hornou časťou paží, nie švihom zápästia.',
    'Ramená drž ďalej od uší. Stiahni zadné delty a potom pomaly spúšťaj jednoručky, až kým nevisia bez odrazu.',
    'Trup sa pri zdvíhaní jednoručiek nesmie narovnávať. Ak sa dvíha hrudník, zmenil si rozpažovanie na shrug-row.',
    'Ak ťa pri predklone limituje spodný chrbát, opri hrudník o šikmú lavičku. Je to stále rovnaký cvik; do poznámky uveď „chest-supported“.',
  ],
  mistakes: [
    {
      title: 'Narovnávanie sa spolu so zdvihom jednoručiek',
      body: 'To je pomoc bokmi, nie zadný deltový sval. Zostaň v predklone. Ak to nejde, pár jednoručiek je príliš ťažký alebo hip hinge ešte nie je dostatočne stabilný.',
    },
    {
      title: 'Pokrčenie lakťov do príťahu',
      body: 'Ak jednoručky putujú k bedrám, zapísal si nesprávny vzor. Lakte drž mäkké a takmer bez pohybu. Zaznamenaj ho ako príťah jednoručky jednou rukou.',
    },
    {
      title: 'Použitie páru, s ktorým robíš lateral raise',
      body: 'Reverse fly býva pre väčšinu ľudí ľahší než upažovanie. Ak musíš jednoručky vyhadzovať, nerozpažuješ. Zníž váhu.',
    },
    {
      title: 'Zapisovanie ako face pulls',
      body: 'Face pull je káblový cvik s vysokými lakťami a vonkajšou rotáciou. Toto je horizontálne rozpažovanie z predklonu. Slugy nechaj oddelené, inak budú oba grafy vymyslené.',
    },
  ],
  variations: [
    {
      slug: 'machine-rear-delt-fly',
      name: 'Machine rear delt fly',
      note: 'Hrudník je na vankúši, predklon odpadá, no stále pracuje podobná oblasť. Samostatný cvik a vlastný graf.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Shoulder face pulls',
      note: 'Zadný deltový sval spolu s vonkajšou rotáciou. Ide o doplnok, nie slepú zámenu.',
    },
    {
      slug: 'cable-reverse-fly',
      name: 'Cable reverse fly',
      note: 'Napätie zostáva aj v natiahnutej polohe. Nehádž ho do záznamu s jednoručkami.',
    },
    {
      slug: 'standing-dumbbell-lateral-raise',
      name: 'Standing dumbbell lateral raise',
      note: 'Bočný deltový sval v stoji. Iná časť ramena a iný cvik.',
    },
  ],
  progressions: [
    'Veľmi ľahké jednoručky: dve sekundy do strán, dve sekundy späť a predklon bez pohybu.',
    'Opri hrudník o šikmú lavičku, ak ako prvý zlyháva spodný chrbát. Poznač si to.',
    'Pridávaj váhu iba dovtedy, kým zostávajú lakte mäkké a trup pevný.',
    'Face pulls alebo stroj na zadné delty, keď chceš viac záťaže bez držania hip hinge.',
  ],
  programming:
    'Tréning zadných deltov je objemová práca, nie cvik na rekord 1RM. Rob 3–4 série po 12–20 opakovaní po tlakoch alebo príťahoch. Zapisuj hmotnosť jednej jednoručky, nie súčet páru. Chest-supported aj predklonená verzia patria k tomuto cviku; poznámka ti ich pomôže rozoznať budúci týždeň. Face pulls a machine rear delt fly majú vlastné grafy. Odhadované 1RM v LIFTAGu tu nepotrebuješ. Nechaj bežať časovač odpočinku. Keď sa ponáhľaš, z cviku sa stane príťah, ktorý sa snažíš prehliadnuť.',
  equipmentAlternatives: [
    {
      slug: 'machine-rear-delt-fly',
      name: 'Machine rear delt fly',
      note: 'Keď je problémom predklon alebo chceš mať hrudník opretý o vankúš.',
    },
    {
      slug: 'cable-reverse-fly',
      name: 'Cable reverse fly',
      note: 'Kladky použi, keď sú jednoručky v dolnej polohe bez napätia.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Shoulder face pulls',
      note: 'Práca zadných deltov s vysokými lakťami a pre mnohé ramená príjemnejšou koncovou polohou.',
    },
  ],
  faqs: [
    {
      question: 'Je reverse fly iba ľahký príťah?',
      answer:
        'Nie. Pri príťahu ohýbaš lakeť a vedieš záťaž k bedru alebo rebrám. Pri reverse fly zostáva lakeť mäkký, takmer pevný, a paža sa otvára do strany. Ak jednoručky skončia pri vreckách, zapíš príťah. Ak skončia do strán, patrí to sem.',
    },
  ],
  relatedSlugs: [
    'shoulder-facepulls',
    'machine-rear-delt-fly',
    'cable-reverse-fly',
    'standing-dumbbell-lateral-raise',
  ],
} satisfies ExerciseOverlay
