import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-front-raise',
  metaDescription:
    'Predpažovanie s jednoručkami v stoji: zastavenie vo výške ramien, žiadny švih a samostatné zaznamenávanie izolácie predných deltov mimo grafu tlakovej osi v LIFTAG.',
  steps: [
    'Postav sa vzpriamene s jednoručkou v každej ruke pri stehnách, dlaňami nadol alebo k sebe. Po celý čas drž rovnaké mierne pokrčenie lakťov. Rebrá maj nad panvou, nevytváraj „skracovačku“ v stoji.',
    'Dvíhaj jednu alebo obe jednoručky pred seba približne do výšky ramien. Zápästia zostávajú v línii s predlaktiami. Dráha vedie pred ramenom, nie do strany ako pri upažovaní.',
    'Spúšťaj pomaly. Práve v dolnej polohe ľudia začínajú švihať, aby predstierali ďalšie opakovanie. Nechaj jednoručky upokojiť a potom dvíhaj znova.',
    'Striedanie rúk je v poriadku. Stále ide o jeden cvik. Dorovnaj počet opakovaní a zaostávajúcu stranu si poznač, namiesto rozdeľovania progresu.',
    'Ak musíš zakláňať chrbát alebo podrepnúť, aby si jednoručky dostal hore, zníž pár. Toto nie je tlak s vystretými pažami.',
  ],
  mistakes: [
    {
      title: 'Zakláňaš sa a meníš cvik na skracovačku v stoji',
      body: 'Mierne spevnenie je normálne. Prehnutý chrbát, pri ktorom jednoručky vyletia zotrvačnosťou, nie je predpažovanie. Narovnaj sa a zníž záťaž.',
    },
    {
      title: 'Dvíhaš jednoručky nad hlavu',
      body: 'Po prekročení približne výšky ramien už používaš zvyšok tlaku s veľmi nevýhodnou pákou. Zastav vo výške očí až ramien, ak ti tréner výslovne nenaprogramoval úplný švihový rozsah.',
    },
    {
      title: 'Zapisuješ predpažovanie ako tlak nad hlavou',
      body: 'Iný nástroj znamená iný rekord. Strict press, landmine press a táto izolácia sú samostatné cviky. Ich miešanie vytvorí v štvrtom týždni falošný rekord predných deltov.',
    },
    {
      title: 'Používaš váhu z upažovania',
      body: 'Predpažovanie býva ľahšie. Ak si si zobral rovnaký pár ako pri bočných deltách, začneš švihať. Zapíš skutočné jednoručky, nie tie, ktoré by si chcel použiť.',
    },
  ],
  variations: [
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlak s veľkou činkou nad hlavou v stoji',
      note: 'Komplexný cvik, za ktorým predpažovanie nasleduje. Nenahrádzaj ním hlavný tlak.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine press',
      note: 'Tlak pod uhlom 45°, keď ramenu prekáža zvislé vystretie. Stále je to tlak a stále má vlastný záznam.',
    },
    {
      slug: 'standing-dumbbell-lateral-raise',
      name: 'Upažovanie s jednoručkami v stoji',
      note: 'Bočné delty. Zaraď ich v deň ramien, no nepovažuj ich za rovnaký cvik.',
    },
    {
      slug: 'cable-front-raise',
      name: 'Predpažovanie na kladke',
      note: 'Napätie aj v dolnej polohe. Drž ho mimo grafu jednoručiek.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, dvojsekundové dvíhanie aj spúšťanie a žiadne zakláňanie.',
    'Ak sa trup začne kývať, striedaj ruky.',
    'Záťaž pridaj, keď obe paže stále zastavia vo výške ramien bez trhnutia.',
    'Ak sú predné delty po tlakoch už unavené, vynechaj predpažovanie a venuj sa tlaku.',
  ],
  programming:
    'Predpažovanie je dodatočný objem pre predné delty, nie náhrada tlaku. Po tlakoch nad hlavou alebo na šikmej lavičke urob 2–4 série po 10–15 opakovaní. Zapisuj hmotnosť jednej jednoručky, nie súčet páru. Striedané aj súčasné opakovania patria k tomuto cviku; štýl si poznač do série, aby ťa ďalší týždeň neprekvapil. Predpažovanie na kladke má vlastný graf. Odhadované 1RM v LIFTAG tu nepotrebuješ. Nechaj bežať časovač odpočinku. Ponáhľanie sa zmení cvik na švih.',
  equipmentAlternatives: [
    {
      slug: 'cable-front-raise',
      name: 'Predpažovanie na kladke',
      note: 'Keď chceš, aby kladka ťahala už v dolnej polohe alebo keď sa pri jednoručkách začínaš hojdať.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine press',
      note: 'Ak je cieľom stále tlak, nie predpažovanie. Zapisuj tlak.',
    },
  ],
  faqs: [
    {
      question: 'Potrebujem predpažovanie, keď už robím tlak nad hlavou?',
      answer:
        'Zvyčajne nie. Tlaky už predné delty výrazne zaťažujú. Predpažovanie pridaj, keď chceš po tlakoch ďalšiu izoláciu, nie namiesto nich. Ak máš prednú časť ramena po tlakoch vyčerpanú, vynechaj ho a nechaj v LIFTAG graf cviku, ktorý si skutočne robil.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'landmine-press',
    'standing-dumbbell-lateral-raise',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
