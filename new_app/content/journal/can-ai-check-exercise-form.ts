import type { JournalArticle } from './types'

const enBase = {
  slug: 'can-ai-check-exercise-form',
  path: '/journal/can-ai-check-exercise-form',
  titleHtml: 'Can AI check your <span class="lime">exercise form?</span>',
  titleText: 'Can AI check your exercise form?',
  description:
    'FitAQA tests whether video AI can see, judge and time form errors across 30 bodyweight exercises. The results show why fluent feedback is still not the same as reliable coaching.',
  seoTitle: 'Can AI Check Your Exercise Form From Video? | LIFTAG',
  datePublished: '2026-10-07',
  category: 'RESEARCH',
  dateUpdated: '2026-10',
  citations: ['https://arxiv.org/abs/2608.08736'],
  body: '<section><h2>Seeing an exercise is not the same as understanding it</h2><p>Point a camera at a squat and a modern video model can usually name the movement. Checking its quality is a much harder job. The system must notice small joint positions, follow them through time, compare what it sees with an exercise standard and explain the important error without inventing one.</p><p>FitAQA, a September 2026 preprint by Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo and Ji Wu, is designed to expose where that chain breaks. It is a benchmark, not a coaching app, and its results are a useful antidote to demos that show only a model\'s best answer.</p></section>\n<section><h2>What FitAQA measures</h2><p>The benchmark contains 2,219 videos and 5,512 question-answer instances covering 30 bodyweight exercises. Working with sports-science experts, the authors defined 38 recurring form errors across six dimensions: alignment, symmetry, stability, coordination, tempo and completeness.</p><p>They then split form assessment into three tasks. Perception asks what is visibly happening. Judgement asks whether that observation counts as an error for the exercise. Temporal grounding asks when the error occurs in a longer video. This separation matters because a model can guess the right verdict for the wrong reason.</p></section>\n<section><h2>Current models miss the visual evidence</h2><p>Most evaluated models performed near or only modestly above simple baselines on perception, and none was consistently strong across all six quality dimensions. When the researchers gave models the correct perceptual evidence, judgement improved substantially. That points to vision, rather than wording alone, as a central bottleneck.</p><p>The strongest model in the paired analysis answered both the perception and judgement question correctly on 40.1% of pairs. Some models reached a correct binary verdict after describing the visual state incorrectly. A user would see a confident “your form is wrong” even though the system had misunderstood why.</p><p>The benchmark also found poor precision in time. Models often marked an interval much longer than the annotated error, and performance dropped under stricter overlap thresholds. More sampled frames did not consistently solve the problem.</p></section>\n<section><h2>The benchmark has clear boundaries</h2><p>FitAQA covers bodyweight exercise. It does not evaluate a barbell path, grip, load selection, machine setup or the interaction between a person and external equipment. Its long-video subset is smaller and less varied than its short clips.</p><p>The labels describe observable execution against a taxonomy. They cannot tell whether a movement causes pain, whether an anatomical variation is appropriate for the person or whether a coach intentionally changed the technique. A single camera angle can also hide depth and occlusion.</p><p>The authors explicitly position FitAQA for research evaluation. They warn against direct use as automated coaching, clinical rehabilitation or medical decision-making without more validation and human oversight, because incorrect feedback could cause poor guidance or injury.</p></section>\n<section><h2>How to use camera feedback today</h2><p>A video model can still be a useful second look if its role stays narrow. Ask about one observable cue, keep the full clip, compare the answer with another angle and treat the result as a prompt for review. “Did my heels rise?” is more auditable than “fix my squat.”</p><p>For loaded lifts, start with stable basics: film from an angle that shows the relevant joints and the implement, keep the whole set, and compare repetitions under the same setup. If pain, injury or rehabilitation is involved, use a qualified professional who can examine context the video does not contain.</p><p>LIFTAG does not claim to grade exercise form from camera footage. Its exercise history can tell you what you logged; it cannot certify how safely you moved. FitAQA suggests that automated form checks may improve, while also showing why a polished explanation is not yet proof of correct perception.</p></section>\n<section><h2>Source and credit</h2><ul><li>Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo and Ji Wu. “FitAQA: A Benchmark of Fitness Action Quality Assessment for Multimodal Large Language Models.” arXiv preprint, first submitted 9 August and revised 17 September 2026: <a href="https://arxiv.org/abs/2608.08736">arxiv.org</a></li></ul><p>Link and version checked 7 October 2026. The paper is a preprint released under CC BY 4.0. This article is an independent summary and does not reproduce its figures, dataset media or prose.</p></section>',
  faqs: [
    {
      question: 'Can AI tell if my exercise form is correct from video?',
      answer:
        'It can identify some visible cues, but FitAQA shows that current models often miss the relevant visual state, reach the right verdict for the wrong reason or locate an error imprecisely.',
    },
    {
      question: 'Does FitAQA test barbell and machine exercises?',
      answer:
        'No. It covers 30 bodyweight exercises. It does not test grip, external load, equipment setup or the path of a barbell or machine.',
    },
    {
      question: 'Can an AI form check replace a coach or physiotherapist?',
      answer:
        'No. A video lacks pain, injury history, anatomy and programming context. The FitAQA authors explicitly advise against direct coaching, rehabilitation or medical use without further validation and human oversight.',
    },
    {
      question: 'Does LIFTAG grade exercise form from video?',
      answer:
        'No. LIFTAG does not currently claim camera-based form assessment. It records the training details you enter and does not certify movement safety.',
    },
  ],
  ctaPath: '/',
  ctaLabel: 'Get LIFTAG free',
  secondaryPath: '/journal/what-is-rpe-lifting',
  secondaryLabel: 'Learn how to use RPE',
} satisfies JournalArticle

export const en = {
  ...enBase,
  body: enBase.body + '<section><h2>License</h2><p>FitAQA is licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. We credit the authors and primary paper above; this independent article paraphrases the research and reproduces no figures, dataset videos or paper text.</p></section>',
} satisfies JournalArticle

const skBase = {
  slug: 'can-ai-check-exercise-form',
  path: '/journal/can-ai-check-exercise-form',
  titleHtml: 'Dokáže AI skontrolovať <span class="lime">techniku cviku?</span>',
  titleText: 'Dokáže AI skontrolovať techniku cviku?',
  description:
    'FitAQA testuje, či video AI vidí, posúdi a časovo lokalizuje chyby pri 30 cvikoch s vlastnou váhou. Výsledky ukazujú, prečo plynulá spätná väzba ešte nie je spoľahlivý coaching.',
  seoTitle: 'Dokáže AI skontrolovať techniku cviku z videa? | LIFTAG',
  datePublished: '2026-10-07',
  category: 'VÝSKUM',
  dateUpdated: '2026-10',
  citations: ['https://arxiv.org/abs/2608.08736'],
  body: '<section><h2>Vidieť cvik nie je to isté ako mu rozumieť</h2><p>Namier kameru na drep a moderný video model pohyb zvyčajne pomenuje. Posúdenie kvality je oveľa ťažšie. Systém musí zachytiť malé zmeny polohy kĺbov, sledovať ich v čase, porovnať ich so štandardom cviku a vysvetliť podstatnú chybu bez toho, aby si nejakú vymyslel.</p><p>FitAQA, preprint zo septembra 2026 od Kaili Zheng, Kaiwena Wanga, Xuna Zhua, Qingyuana Yanga, Chenyi Guoa a Ji Wua, odhaľuje, kde sa tento reťazec láme. Je to benchmark, nie trénerská aplikácia. Jeho výsledky sú dobrým protikladom k ukážkam, ktoré prezentujú iba najlepšiu odpoveď modelu.</p></section>\n<section><h2>Čo FitAQA meria</h2><p>Benchmark obsahuje 2 219 videí a 5 512 otázok s odpoveďami z 30 cvikov s vlastnou váhou. Autori spolu s odborníkmi na športovú vedu definovali 38 opakujúcich sa chýb v šiestich oblastiach: zarovnanie, symetria, stabilita, koordinácia, tempo a úplnosť.</p><p>Hodnotenie rozdelili na tri úlohy. Perception sa pýta, čo je na videu viditeľné. Judgement skúma, či je tento jav chybou pri danom cviku. Temporal grounding hľadá, kedy sa chyba v dlhšom videu objaví. Rozdelenie je dôležité, pretože model môže uhádnuť správny verdikt z nesprávneho dôvodu.</p></section>\n<section><h2>Dnešné modely míňajú vizuálny dôkaz</h2><p>Väčšina testovaných modelov bola pri vizuálnom vnímaní na úrovni jednoduchých baseline alebo iba mierne nad nimi. Žiadny nebol konzistentne silný vo všetkých šiestich oblastiach. Keď výskumníci dodali správny opis toho, čo je vidieť, posúdenie sa výrazne zlepšilo. Úzkym miestom je teda samotné videnie, nie iba formulácia odpovede.</p><p>Najlepší model v párovej analýze správne odpovedal na otázku o vnímaní aj posúdení v 40,1 % dvojíc. Niektoré modely trafili binárny verdikt aj po nesprávnom opise vizuálneho stavu. Používateľ by dostal sebavedomé „technika je chybná“, hoci systém nepochopil prečo.</p><p>Slabé bolo aj načasovanie. Modely často označili oveľa dlhší interval než anotovaná chyba a pri prísnejšom časovom prekrytí výkon klesal. Ani viac vzoriek snímok problém neriešilo konzistentne.</p></section>\n<section><h2>Benchmark má jasné hranice</h2><p>FitAQA pokrýva cviky s vlastnou váhou. Nehodnotí dráhu činky, úchop, výber záťaže, nastavenie stroja ani prácu človeka s externým náradím. Dlhých videí je menej a sú menej rozmanité než krátke klipy.</p><p>Značky opisujú viditeľné prevedenie podľa taxonómie. Nepovedia, či pohyb spôsobuje bolesť, či je anatomická odchýlka pre človeka vhodná alebo či tréner techniku zmenil zámerne. Jeden uhol kamery môže navyše skryť hĺbku alebo časť tela.</p><p>Autori určujú FitAQA na výskumné hodnotenie. Bez ďalšieho overenia a ľudského dohľadu varujú pred priamym nasadením na automatický coaching, klinickú rehabilitáciu alebo medicínske rozhodnutia, pretože chybná spätná väzba môže viesť k zlému odporúčaniu alebo zraneniu.</p></section>\n<section><h2>Ako dnes používať spätnú väzbu z kamery</h2><p>Video model môže poslúžiť ako druhý pohľad, ak má úzku úlohu. Pýtaj sa na jeden viditeľný jav, uchovaj celý klip, porovnaj odpoveď s druhým uhlom a výsledok ber ako podnet na kontrolu. Otázka „zdvihli sa mi päty?“ sa overuje ľahšie než „oprav môj drep“.</p><p>Pri cvikoch so záťažou začni stabilnými základmi: natáčaj z uhla, ktorý ukáže podstatné kĺby aj náradie, zachovaj celú sériu a porovnávaj opakovania v rovnakom nastavení. Pri bolesti, zranení alebo rehabilitácii sa obráť na kvalifikovaného odborníka, ktorý pozná kontext chýbajúci vo videu.</p><p>LIFTAG netvrdí, že z kamery hodnotí techniku cviku. História ukáže, čo si zapísal; nepotvrdzuje bezpečnosť pohybu. FitAQA naznačuje ďalšie zlepšenia automatickej kontroly a zároveň ukazuje, prečo uhladené vysvetlenie ešte nedokazuje správne vnímanie.</p></section>\n<section><h2>Zdroj a autori</h2><ul><li>Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo a Ji Wu. „FitAQA: A Benchmark of Fitness Action Quality Assessment for Multimodal Large Language Models.“ Preprint na arXiv, prvýkrát zverejnený 9. augusta a revidovaný 17. septembra 2026: <a href="https://arxiv.org/abs/2608.08736">arxiv.org</a></li></ul><p>Odkaz a verzia overené 7. októbra 2026. Práca je preprint vydaný pod CC BY 4.0. Článok je nezávislé zhrnutie a nepreberá obrázky, videá datasetu ani text práce.</p></section>',
  faqs: [
    {
      question: 'Dokáže AI z videa zistiť, či cvičím správne?',
      answer:
        'Niektoré viditeľné prvky rozozná, no FitAQA ukazuje, že dnešné modely často prehliadnu podstatný stav, trafia verdikt z nesprávneho dôvodu alebo nepresne určia čas chyby.',
    },
    {
      question: 'Testuje FitAQA cviky s činkou a na strojoch?',
      answer:
        'Nie. Pokrýva 30 cvikov s vlastnou váhou. Netestuje úchop, externú záťaž, nastavenie náradia ani dráhu činky či stroja.',
    },
    {
      question: 'Nahradí AI kontrola techniky trénera alebo fyzioterapeuta?',
      answer:
        'Nie. Video neobsahuje bolesť, históriu zranení, anatómiu ani kontext programu. Autori FitAQA výslovne neodporúčajú priame trénerské, rehabilitačné alebo medicínske použitie bez ďalšieho overenia a dohľadu človeka.',
    },
    {
      question: 'Hodnotí LIFTAG techniku cviku z videa?',
      answer:
        'Nie. LIFTAG v súčasnosti netvrdí, že hodnotí techniku z kamery. Zaznamenáva tréningové údaje, ktoré zadáš, a nepotvrdzuje bezpečnosť pohybu.',
    },
  ],
  ctaPath: '/',
  ctaLabel: 'Stiahnuť LIFTAG zadarmo',
  secondaryPath: '/journal/what-is-rpe-lifting',
  secondaryLabel: 'Ako používať RPE',
} satisfies JournalArticle

export const sk = {
  ...skBase,
  body: skBase.body + '<section><h2>Licencia</h2><p>FitAQA má licenciu <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Autorov aj primárnu prácu uvádzame vyššie; tento nezávislý článok výskum parafrázuje a nepreberá obrázky, videá datasetu ani text práce.</p></section>',
} satisfies typeof en
