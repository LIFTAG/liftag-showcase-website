import type { JournalArticle } from './types'

export const en = {
  slug: 'can-ai-check-exercise-form',
  path: '/journal/can-ai-check-exercise-form',
  titleHtml: 'Can AI check your <span class="lime">exercise form?</span>',
  titleText: 'Can AI check your exercise form?',
  description:
    'FitAQA tests AI on videos of 30 bodyweight exercises. Models still miss important details and struggle to tell exactly when a form error happens.',
  seoTitle: 'Can AI Check Your Exercise Form From Video? | LIFTAG',
  datePublished: '2026-10-07',
  category: 'RESEARCH',
  dateUpdated: '2026-10',
  citations: ['https://arxiv.org/abs/2608.08736'],
  body: '<section><h2>Seeing an exercise is not the same as understanding it</h2><p>Show a video model a squat and it can often name the exercise. Asking whether the squat was performed well is harder. The model must follow the joints from frame to frame, decide which detail matters and explain it without adding an error that is not visible.</p><p>FitAQA, a September 2026 preprint by Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo and Ji Wu, tests each part of that task. A benchmark is a shared test used to compare systems. FitAQA evaluates research models; it is not a coaching app or a trial of real-world training outcomes.</p></section>\n<section><h2>What FitAQA measures</h2><p>The test contains 2,219 videos and 5,512 question-answer instances covering 30 bodyweight exercises. Working with sports-science experts, the authors defined 38 recurring form errors across six dimensions: alignment, symmetry, stability, coordination, tempo and completeness.</p><p>They split the test into three questions: what is visible, whether it is an error for that exercise, and when it happens in a longer video. This separation matters because a model can guess the right verdict for the wrong reason.</p></section>\n<section><h2>Current models miss the visual evidence</h2><p>Most models were only as good as, or a little better than, simple comparison methods at describing what the video showed. None worked well across all six areas. When researchers supplied the correct description of the movement, the models judged it much better. Much of the problem therefore begins with seeing the movement correctly.</p><p>The strongest model correctly described the movement and judged it in 40.1% of paired questions. Some models still produced the right yes-or-no answer after describing the movement incorrectly. A user would see a confident “your form is wrong” even though the system had misunderstood why.</p><p>The test also found poor precision in time. Models often marked a much longer part of the video than the labelled error. They did worse when the test required their chosen time to match the labelled time more closely. More sampled frames did not consistently solve the problem.</p></section>\n<section><h2>What the test does not cover</h2><p>FitAQA covers bodyweight exercise. It does not evaluate a barbell path, grip, load selection, machine setup or the interaction between a person and external equipment. Its long-video subset is smaller and less varied than its short clips.</p><p>The labels compare visible movement with a defined list of form errors. They cannot tell whether a movement causes pain, whether an anatomical variation is appropriate for the person or whether a coach intentionally changed the technique. One camera angle can also flatten depth or hide one body part behind another.</p><p>The authors explicitly position FitAQA for research evaluation. They warn against direct use as automated coaching, clinical rehabilitation or medical decision-making without more validation and human oversight, because incorrect feedback could cause poor guidance or injury.</p></section>\n<section><h2>How to use camera feedback today</h2><p>A video tool can still help with a narrow, visible question. Keep the full set and ask something you can check yourself, such as “did my heels leave the floor?” A second camera angle may reveal that the first one hid. Treat the answer as a reason to review the clip, not as a final grade.</p><p>For loaded lifts, start with stable basics: film from an angle that shows the relevant joints and the implement, keep the whole set, and compare repetitions under the same setup. If pain, injury or rehabilitation is involved, use a qualified professional who can examine context the video does not contain.</p><p>LIFTAG does not claim to grade exercise form from camera footage. Its exercise history can tell you what you logged; it cannot certify how safely you moved. FitAQA suggests that automated form checks may improve, while also showing why a polished explanation is not yet proof of correct perception.</p></section>\n<section><h2>Source and credit</h2><ul><li>Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo and Ji Wu. “FitAQA: A Benchmark of Fitness Action Quality Assessment for Multimodal Large Language Models.” arXiv preprint, first submitted 9 August and revised 17 September 2026: <a href="https://arxiv.org/abs/2608.08736">arxiv.org</a></li></ul><p>Link and version checked 7 October 2026. The paper is a preprint released under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. This article is an independent summary and does not reproduce its figures, dataset media or prose.</p></section>',
  faqs: [
    {
      question: 'Can AI tell if my exercise form is correct from video?',
      answer:
        'It can identify some visible cues, but FitAQA shows that current models often miss the important detail in the video, reach the right verdict for the wrong reason or locate an error imprecisely.',
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


export const sk = {
  slug: 'can-ai-check-exercise-form',
  path: '/journal/can-ai-check-exercise-form',
  titleHtml: 'Dokáže AI skontrolovať <span class="lime">techniku cviku?</span>',
  titleText: 'Dokáže AI skontrolovať techniku cviku?',
  description:
    'FitAQA testuje AI na videách 30 cvikov s vlastnou váhou. Modely stále prehliadajú dôležité detaily a majú problém presne určiť, kedy sa chyba v technike objaví.',
  seoTitle: 'Dokáže AI skontrolovať techniku cviku z videa? | LIFTAG',
  datePublished: '2026-10-07',
  category: 'VÝSKUM',
  dateUpdated: '2026-10',
  citations: ['https://arxiv.org/abs/2608.08736'],
  body: '<section><h2>Vidieť cvik nie je to isté ako mu rozumieť</h2><p>Ukáž video modelu drep a často cvik správne pomenuje. Posúdiť jeho prevedenie je ťažšie. Model musí sledovať kĺby zo snímky na snímku, vybrať podstatný detail a vysvetliť ho bez toho, aby pridal chybu, ktorú na videu nevidno.</p><p>FitAQA, preprint zo septembra 2026 od Kaili Zheng, Kaiwena Wanga, Xuna Zhua, Qingyuana Yanga, Chenyi Guoa a Ji Wua, testuje jednotlivé časti tejto úlohy. Benchmark je spoločný test na porovnanie systémov. FitAQA hodnotí výskumné modely; nie je to trénerská aplikácia ani skúška výsledkov skutočných cvičencov.</p></section>\n<section><h2>Čo FitAQA meria</h2><p>Test obsahuje 2 219 videí a 5 512 otázok s odpoveďami z 30 cvikov s vlastnou váhou. Autori spolu s odborníkmi na športovú vedu definovali 38 opakujúcich sa chýb v šiestich oblastiach: zarovnanie, symetria, stabilita, koordinácia, tempo a úplnosť.</p><p>Test rozdelili na tri otázky: čo je na videu viditeľné, či je to pri danom cviku chyba a kedy sa to v dlhšom videu stane. Rozdelenie je dôležité, pretože model môže uhádnuť správny verdikt z nesprávneho dôvodu.</p></section>\n<section><h2>Dnešné modely míňajú vizuálny dôkaz</h2><p>Väčšina modelov opisovala video iba rovnako dobre alebo o trochu lepšie než jednoduché porovnávacie metódy. Žiadny nefungoval dobre vo všetkých šiestich oblastiach. Keď výskumníci dodali správny opis pohybu, modely ho posúdili oveľa lepšie. Veľká časť problému teda vzniká už pri správnom čítaní obrazu.</p><p>Najlepší model správne opísal pohyb aj ho posúdil v 40,1 % dvojíc otázok. Niektoré modely trafili správnu odpoveď áno alebo nie aj po nesprávnom opise pohybu. Používateľ by dostal sebavedomé „technika je chybná“, hoci systém nepochopil prečo.</p><p>Slabé bolo aj načasovanie. Modely často označili oveľa dlhšiu časť videa než vyznačená chyba. Darilo sa im horšie, keď test vyžadoval presnejšiu zhodu s označeným časom. Ani viac vzoriek snímok problém neriešilo konzistentne.</p></section>\n<section><h2>Čo test nepokrýva</h2><p>FitAQA pokrýva cviky s vlastnou váhou. Nehodnotí dráhu činky, úchop, výber záťaže, nastavenie stroja ani prácu človeka s externým náradím. Dlhých videí je menej a sú menej rozmanité než krátke klipy.</p><p>Značky porovnávajú viditeľný pohyb s vopred určeným zoznamom chýb. Nepovedia, či pohyb spôsobuje bolesť, či je anatomická odchýlka pre človeka vhodná alebo či tréner techniku zmenil zámerne. Jeden uhol kamery môže navyše sploštiť hĺbku alebo skryť jednu časť tela za druhou.</p><p>Autori určujú FitAQA na výskumné hodnotenie. Bez ďalšieho overenia a ľudského dohľadu varujú pred priamym nasadením na automatické tréningové vedenie, klinickú rehabilitáciu alebo medicínske rozhodnutia, pretože chybná spätná väzba môže viesť k zlému odporúčaniu alebo zraneniu.</p></section>\n<section><h2>Ako dnes používať spätnú väzbu z kamery</h2><p>Video nástroj môže pomôcť pri úzkej, viditeľnej otázke. Zachovaj celú sériu a opýtaj sa na niečo, čo vieš overiť aj sám, napríklad „odlepili sa mi päty od podlahy?“. Druhý uhol môže ukázať to, čo prvý skryl. Odpoveď ber ako dôvod znovu si pozrieť video, nie ako konečné hodnotenie.</p><p>Pri cvikoch so záťažou začni stabilnými základmi: natáčaj z uhla, ktorý ukáže podstatné kĺby aj náradie, zachovaj celú sériu a porovnávaj opakovania v rovnakom nastavení. Pri bolesti, zranení alebo rehabilitácii sa obráť na kvalifikovaného odborníka, ktorý pozná kontext chýbajúci vo videu.</p><p>LIFTAG netvrdí, že z kamery hodnotí techniku cviku. História ukáže, čo si zapísal; nepotvrdzuje bezpečnosť pohybu. FitAQA naznačuje ďalšie zlepšenia automatickej kontroly a zároveň ukazuje, prečo uhladené vysvetlenie ešte nedokazuje správne vnímanie.</p></section>\n<section><h2>Zdroj a autori</h2><ul><li>Kaili Zheng, Kaiwen Wang, Xun Zhu, Qingyuan Yang, Chenyi Guo a Ji Wu. „FitAQA: A Benchmark of Fitness Action Quality Assessment for Multimodal Large Language Models.“ Preprint na arXiv, prvýkrát zverejnený 9. augusta a revidovaný 17. septembra 2026: <a href="https://arxiv.org/abs/2608.08736">arxiv.org</a></li></ul><p>Odkaz a verzia overené 7. októbra 2026. Práca je preprint vydaný pod licenciou <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Článok je nezávislé zhrnutie a nepreberá obrázky, videá datasetu ani text práce.</p></section>',
  faqs: [
    {
      question: 'Dokáže AI z videa zistiť, či cvičím správne?',
      answer:
        'Niektoré viditeľné prvky rozozná, no FitAQA ukazuje, že dnešné modely často prehliadnu podstatný detail vo videu, trafia verdikt z nesprávneho dôvodu alebo nepresne určia čas chyby.',
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
