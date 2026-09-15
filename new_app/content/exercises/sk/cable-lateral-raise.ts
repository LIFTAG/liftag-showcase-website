import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'cable-lateral-raise',
  metaDescription:
    'Upažovanie na kladke: výška kladky, vedenie lakťa a objem pre bočné ramená, ktorý zostane na kladke aj v LIFTAG.',
  steps: [
    'Nastav D-rukoväť na spodnú kladku vo výške členka až polovice predkolenia. Postav sa bokom, aby kábel viedol cez telo, a pracovná ruka začínala pri opačnom boku.',
    'Lakte drž mierne pokrčené a uhol nemen. Zdvíhaj, kým je paža približne rovnobežne so zemou. Veď pohyb lakťom, nie švihom vystretej ruky.',
    'Kábel drž mierne za bokom, aby ťah zostal na bočnom delte. Keď rukoväť putuje pred telo, robíš predpažovanie.',
    'Spúšťaj, kým deltový sval stále drží napätie. Výhodou kladky je, že dole nevznikne mŕtvy záves ako pri jednoručke.',
  ],
  mistakes: [
    {
      title: 'Nakláňaš sa tak, že vznikne krčenie ramien',
      body: 'Mierny náklon pomáha udržať napätie. Veľký náklon a dvíhanie ramena je už cvik na trapézy. Narovnaj sa a uber kolík.',
    },
    {
      title: 'Dvíhaš rukoväť k uchu',
      body: 'Nad úrovňou ramien pracuje väčšina cvičiacich hlavne horným trapézom. Zastav približne v rovnobežke, ak nechceš krčiť ramená.',
    },
    {
      title: 'Kladku nastavíš do výšky hrudníka',
      body: 'Prvá polovica pohybu je potom bez záťaže a hore sa krčíš. Použi spodnú kladku; ak prvých 30° necítiš, stojíš príliš nad zásobníkom.',
    },
    {
      title: 'Každú ruku zapisuješ ako samostatný cvik',
      body: 'Je to jeden cvik. Striedaj ruky alebo cvič obe naraz. Slabšiu stranu si poznač, ale nerozdeľuj progres.',
    },
  ],
  variations: [
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Opora pod lakťami, menej nastavovania a obe ruky naraz.',
    },
    {
      slug: 'barbell-upright-row',
      name: 'Príťah veľkej činky k brade',
      note: 'Viac záťaže aj trapézov; podobná oblasť, ak ramenám pohyb vyhovuje.',
    },
    {
      slug: 'shoulder-facepulls',
      name: 'Face pull na ramená',
      note: 'Zadné ramená a vonkajšia rotácia, nie bočné ramená — skôr doplň než slepo nahraď.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami v sede',
      note: 'Komplexný cvik, za ktorým upažovanie nasleduje.',
    },
  ],
  progressions: [
    'Ľahká kladka, dve sekundy hore, dve sekundy dole, bez náklonu.',
    'Pridaj záťaž, keď stále zastavíš v rovnobežke bez trhnutia.',
    'Ak rukoväť dráždi zápästie alebo lakeť, použi manžetu nad lakťom.',
    'Upažovanie rob po tlakoch, nie ako falošný hlavný cvik s veľkým náklonom.',
  ],
  programming:
    'Bočné ramená sú objemová práca. Po tlakoch urob tri až štyri série po 10–15, nie namiesto nich. Kladka prekonáva švihanie jednoručiek, pretože dole stále ťahá. Odhadované 1RM v LIFTAG tu nepotrebuješ; sleduj čisté opakovania a poznámku, ak si zmenil manžetu za rukoväť.',
  equipmentAlternatives: [
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Keď sú všetky spodné kladky obsadené alebo chceš obe ruky naraz.',
    },
    {
      slug: 'barbell-upright-row',
      name: 'Príťah veľkej činky k brade',
      note: 'Len ak ramenám tento vzor vyhovuje; pri pichaní prestaň.',
    },
  ],
  faqs: [
    {
      question: 'Mám dvíhať k uchu alebo po úroveň ramien?',
      answer:
        'Väčšine cvičiacich stačí výška ramien. Vyššie vzniká najmä krčenie trapézov. Ak chceš trapézy, zapisuj krčenie s jednoručkami; ak bočné ramená, zastav v rovnobežke.',
    },
  ],
  relatedSlugs: [
    'standing-dumbbell-lateral-raise',
    'machine-lateral-raise',
    'shoulder-facepulls',
    'barbell-upright-row',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
