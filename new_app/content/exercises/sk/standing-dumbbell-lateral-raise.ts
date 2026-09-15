import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'standing-dumbbell-lateral-raise',
  metaDescription:
    'Upažovanie s jednoručkami v stoji: vedenie lakťami, bez trhania a samostatné zaznamenávanie objemu bočných deltových svalov oproti kladke alebo stroju v LIFTAG-u.',
  steps: [
    'Stoj s jednoručkami pri stehnách, kolená mierne uvoľni a počas celého pohybu zachovaj rovnaké malé pokrčenie lakťov. Zápästia drž v jednej línii s predlaktiami, nepretáčaj palce nadol.',
    'Dvíhaj ruky do strán a trochu pred seba, nie do úplne striktného tvaru T. Vedenie začína lakeť. Ak jednoručky cestujú pred hrudník, robíš predpažovanie.',
    'Zastav, keď bude nadlaktie približne rovnobežne s podlahou. Vyššie pracujú najmä horné trapézy. Krátka pauza je lepšia než švih cez hornú polohu.',
    'Spúšťaj, kým majú deltové svaly stále čo robiť. Úplné položenie rúk pri stehnách je oddych, nie natiahnutie. Pred ďalším opakovaním sa znovu nastav.',
    'Ak na dokončenie potrebuješ trhnutie trupom alebo pokrčenie kolien, dvojica jednoručiek je príliš ťažká. Uber sériu a osvoj si čisté upaženie.',
  ],
  mistakes: [
    {
      title: 'Odraz jednoručiek od bokov',
      body: 'Vystrelenie bokov nie je upažovanie. Ak je prvá tretina pohybu prázdna, záťaž sa hýbe ako kyvadlo. Použi ľahšie jednoručky a začni pomalšie.',
    },
    {
      title: 'Dvíhanie až k ušiam',
      body: 'Nad približne výškou ramien ide u väčšiny cvičiacich najmä o horné trapézy. Zastav pri rovnobežnej polohe, ak nechceš práve krčiť ramená. Na trapézy zaznamenaj krčenie s jednoručkami.',
    },
    {
      title: 'Pretáčanie palcov nadol',
      body: 'Otočenie ako pri vylievaní plechovky presúva prácu do akromioklavikulárneho kĺbu. Kĺby prstov smerujú hore a malíčky nie sú vyššie než palce. Lakeť stále vedie.',
    },
    {
      title: 'Zaznamenávanie kladky alebo stroja sem',
      body: 'Iná krivka odporu znamená iný osobný rekord. Použi tento identifikátor. Upažovanie na kladke a na stroji majú vlastné grafy, nemiešaj ich do jedného.',
    },
  ],
  variations: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Napätie v dolnej polohe, ktoré jednoručky nevedia predstierať. Má vlastný identifikátor.',
    },
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Podložky na lakťoch, obe ruky naraz a jednoduchšie nastavenie.',
    },
    {
      slug: 'standing-dumbbell-front-raise',
      name: 'Predpažovanie s jednoručkami v stoji',
      note: 'Predné rameno, nie bočné. Zaraď vedľa tlaku, nie ako bezmyšlienkovú náhradu.',
    },
    {
      slug: 'barbell-upright-row',
      name: 'Príťah veľkej činky k brade',
      note: 'Väčšia záťaž, viac trapézov a podobná oblasť pohybu, ak to ramená znášajú.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, dvojsekundové zdvihnutie aj spustenie a bez náklonu.',
    'Záťaž pridaj, keď dokážeš zastaviť v rovnobežnej polohe bez trhnutia.',
    'Jednoručne s voľnou rukou na stojane, ak sa pri posledných opakovaniach začínaš kývať.',
    'Upažovanie používaj po tlaku, nie ako falošný hlavný cvik s veľkým náklonom.',
  ],
  programming:
    'Bočné ramená potrebujú objem. Tri až štyri série po 10–15 opakovaní po tlaku, nie namiesto jedného tlakového cviku. Zaznamenávaj skutočnú hmotnosť jednej jednoručky, nie súčet dvojice, a zachovaj rovnaký spôsob zaznamenávania, aby graf niečo znamenal. Upažovanie na kladke a stroji má vlastné identifikátory. Odhadované 1RM v LIFTAG-u tu nepotrebuješ. Naháňaj čisté opakovania, pri cvičení v sede napíš do poznámky „v sede“ a nechaj bežať časovač oddychu. Ponáhľanie sa pri upažovaní z neho iba urobí krčenie ramien.',
  equipmentAlternatives: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Základná náhrada, keď chceš napätie v dolnej polohe alebo sa jednoručky začínajú kývať.',
    },
    {
      slug: 'machine-lateral-raise',
      name: 'Upažovanie na stroji',
      note: 'Keď chceš obe ruky naraz bez premýšľania o kyvadle.',
    },
  ],
  faqs: [
    {
      question: 'Mám dvíhať k uchu alebo zastaviť pri ramene?',
      answer:
        'Väčšine cvičiacich stačí výška ramien. Vyššie ide zvyčajne o krčenie trapézov. Ak chceš trapézy, zaznamenaj krčenie s jednoručkami. Ak chceš bočné ramená, zastav približne v rovnobežnej polohe a používaj tento identifikátor.',
    },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'machine-lateral-raise',
    'seated-dumbbell-shoulder-press',
    'standing-dumbbell-front-raise',
  ],
} satisfies ExerciseOverlay
