export interface OneRmGuideFaq {
  question: string
  answer: string
}
export interface OneRmGuideCopy {
  whatIntro: string
  whatDetail: string
  weight: string
  pick: string
  failure: string
  exerciseSourcesSummary: string
  exerciseSourcesNote: string
  faqs: OneRmGuideFaq[]
  methodIntro: string
  methodDetails: string
  percentileIntro: string
  percentileAnchors: string
  percentileLimits: string
  equipment: string
  formulasIntro: string
  formulaExample: string
  wrong: string[]
  testing: string[]
  appIntro: string
  appGetLabel: string
  appGetTail: string
  epleyHeading: string
  epleyBody: string
  brzyckiHeading: string
  brzyckiBody: string
  familyHeading: string
  familyBody: string
  liftsIntro: string
  liftsProgram: string
  trueMaxIntro: string
  sourcesIntro: string
  sourcesFacts: string
  sourcesQuestions: string
  sourceLabels: string[]
}

export const en: OneRmGuideCopy = {
  whatIntro:
    'A one-rep max is the most you can lift once, with the standard you actually compete or train with. A PR is any personal record: a 5-rep bench, a paused squat, a volume day. People search “PR calculator” when they mean this tool. It estimates a 1RM. LIFTAG stores both.',
  whatDetail:
    'You do not need a meet to use the number. You need a hard set of a few reps, a named formula, and a log that does not invent a second max next week.',
  weight:
    'Type the load and the clean reps. Switch kg or lb; the physical weight stays put. The result updates as you type. No submit button, no email gate, no app wall in front of the number.',
  pick: 'In See where you stand, search from {count} common gym exercises with strength benchmarks, across barbell, dumbbell, cable, and machine lifts. Choose a lift, enter your bodyweight, and select a comparison group to see an approximate “stronger than X% of lifters” ranking. Exercise selection changes the comparison, not the 1RM equation.',
  failure:
    'Prediction error grows as the set gets longer. A hard 5 is the sweet spot. A 20-rep set measures how long you can last, not what you could unrack once. If you only have a high-rep set, do a heavier one. Then come back.',
  exerciseSourcesSummary: 'All {count} exercise benchmarks and sources',
  exerciseSourcesNote: 'Strength Level standards, reviewed 9 September 2026.',
  methodIntro:
    'LIFTAG estimates 1RM with the Epley formula for sets of 1–10 reps near failure. A single is stored as the weight you lifted, not as 3% extra. The website uses the same estimator as the app. Optional RPE is context on the set, not a second formula.',
  methodDetails:
    'The formula, assumptions, and worked example are also available in a plain Markdown version. Core tracking is free; pricing is the dated fact sheet.',
  percentileIntro:
    'Your estimated 1RM divided by bodyweight gives your strength-to-bodyweight ratio. We compare it with published male or female Strength Level ratios for the selected exercise.',
  percentileAnchors:
    'The anchors are the 5th (beginner), 20th (novice), 50th (intermediate), 80th (advanced), and 95th (elite) percentiles. LIFTAG interpolates between them and shows “You are stronger than X% of lifters”. Below the 5th we show “fewer than 5%”. A sourced raw world-record ratio can extend the final 5% to 100%.',
  percentileLimits:
    'This is an approximate benchmark comparison, not a measured population percentile. The source reflects people who log lifts, not everyone. It does not adjust for age, body proportions, or every bodyweight difference. Valid sets are 1–30 reps and bodyweights 30–300 kg; after 10 reps the estimate and ranking are rougher.',
  equipment:
    'Dumbbell loads are per dumbbell, including the handle; goblet squats and dumbbell pullovers use one weight. Machine designs and pulley ratios vary. Pull-ups, chin-ups, and dips use bodyweight plus added weight for a total-load estimate and receive no percentile. Other exercise also gives an estimate only.',
  formulasIntro:
    'Epley is the default so the website and the log agree. The comparison table shows six other published equations on the same set. At one rep every formula returns the load you typed.',
  formulaExample:
    'Worked example, always true without JavaScript: 100 kg × 5. Epley is {value} kg. 225 lb × 5 is 262.5 lb.',
  wrong: [
    'High-rep sets. Past 10, uncertainty increases; use a lower-rep set before making decisions.',
    'Isolation lifts and machines produce more reps at a given percentage than a free squat.',
    'A bounce bench and a paused bench are different standards; the formula cannot see the difference.',
    'Squat depth, deadlift start, and grip change the set. Formula disagreement is not a confidence interval.',
    'Fatigue, a cut, and poor sleep make the same kilos a different session. That is what RPE is for.',
  ],
  testing: [
    'Warm up to a heavy triple you already own.',
    'Take small jumps and leave a rep in reserve until the last attempt.',
    'Use a spotter and safeties. Set safety pins before adding load.',
    'Log the single. LIFTAG stores it as the max, not as an estimate.',
  ],
  appIntro:
    'Every working set can update estimated 1RM for that exercise. The app uses Epley per set, just like this page. PRs stay on the lift you performed, and percentage cues read that history. Partner-gym NFC and QR tags open the right exercise.',
  appGetLabel: 'Get the app',
  appGetTail: 'Core tracking is free on iOS and Android. Estimated 1RM is not paywalled.',
  epleyHeading: 'Epley (1985)',
  epleyBody:
    'Linear. 1RM = w × (1 + r / 30). At 10 reps it meets Brzycki at w × 4/3. Below 10 it runs a little high. This is LIFTAG’s default because it is stable, named, and already in the app.',
  brzyckiHeading: 'Brzycki (1993)',
  brzyckiBody:
    '1RM = w × 36 / (37 − r). Conservative in the middle. Undefined at 37 reps, which is why this page will not show a Brzycki number on a 30-rep set as if it were a max.',
  familyHeading: 'The rest of the family',
  familyBody:
    'Lombardi is a power curve. Mayhew and Wathen are exponential and were the LeSuer bench winners. O’Connor is a shallower linear (r/40). Lander is the NSCA-era percentage chart in equation form. The LeSuer et al. 1997 paper is still the paper to cite: every formula under-predicted deadlift by about 10%.',
  liftsIntro:
    'Select your exercise in the calculator for lift-specific context and strength benchmarks. The 1RM formulas remain the same. Most validation studies focus on bench, squat, and deadlift. A machine chest press 8RM is not a competition bench.',
  liftsProgram:
    'For percentage programs like 5/3/1, use the 90% training max as a conservative reference. The best workout app for powerlifting guide covers how that looks in a log.',
  trueMaxIntro:
    'Most weeks you should skip this. Log submax work, watch estimated 1RM trend, and add load when the overload is honest.',
  sourcesIntro:
    'Written by the LIFTAG team, Bratislava. Last reviewed {reviewed}. First published {published}. We log estimated 1RM with Epley. This page shows the rest of the family so you can see the spread.',
  sourcesFacts: 'Facts and how to cite us: about, press kit.',
  sourcesQuestions: 'Questions: support.',
  sourceLabels: [
    'Epley, B. (1985). Poundage chart. University of Nebraska.',
    'Brzycki, M. (1993). Strength testing: predicting a one-rep max from reps-to-fatigue. JOPERD 64(1), 88–90.',
    'Lombardi, V. P. (1989). Beginning Weight Training. Wm. C. Brown.',
    'Mayhew, J. L. et al. (1992). Relative muscular endurance performance as a predictor of bench press strength. JSCR.',
    "O'Connor, B., Simmons, J., & O'Shea, P. (1989). Weight Training Today.",
    'Wathen, D. (1994). Load assignment. In: NSCA Essentials of Strength Training and Conditioning.',
    'Lander, J. (1985). Maximum based on reps. NSCA Journal 6, 60–61.',
    'LeSuer, D. A. et al. (1997). The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. JSCR 11(4), 211–213.',
    'Reynolds, J. M., Gordon, T. J., & Robergs, R. A. (2006). Prediction of one repetition maximum strength from multiple repetition maximum testing and anthropometry. JSCR.',
    'Strength Level. Strength standards. Broad bodyweight-ratio tables used for the “stronger than X% of lifters” comparison, reviewed 9 September 2026.',
    'OpenPowerlifting. All-time raw competition lifts used as the 100% world-record ratio for squat, bench, and deadlift, reviewed 11 September 2026.',
    'Naim Süleymanoğlu, 1988, 60 kg class: 152.5 kg snatch and 190 kg clean and jerk, used as the male Olympic-lift world-record ratios.',
    'Hou Zhihui, Tokyo 2021, 49 kg class: 94 kg snatch and 116 kg clean and jerk, used as the female Olympic-lift world-record ratios.',
  ],
  faqs: [
    {
      question: 'How do you calculate a one-rep max?',
      answer:
        'Take a hard set of 2–10 reps and run Epley: 1RM = weight × (1 + reps / 30). A 100 kg set of 5 estimates 116.7 kg. It is an estimate, not a tested single.',
    },
    {
      question: 'Which 1RM formula is most accurate?',
      answer:
        'No formula wins on every lift. LIFTAG uses Epley so the website matches the log. Use a hard set of five or fewer when the number needs to be close.',
    },
    {
      question: 'How accurate is a 1RM calculator?',
      answer:
        'A hard 2–8 reps on compound lifts is usually within about 5%. Past 10 reps the equations measure endurance more than a max. Do not take an estimate into a meet.',
    },
    {
      question: 'Why is this the best 1RM calculator?',
      answer:
        'It uses Epley as the default, names seven formulas, shows confidence by rep range, compares supported lifts with published ratios, and runs on your device without signup.',
    },
    {
      question: 'Is 5 reps about 85% of 1RM?',
      answer:
        'NSCA charts put a 5RM near 87% of a tested 1RM. Epley treats a five-rep set as about 86% of the estimate. It is useful for programming, not a substitute for a meet opener.',
    },
    {
      question: 'Can I use this as a bench press or squat max calculator?',
      answer:
        'Yes. Pick the lift for its context. Published equations were mainly validated on bench, squat, and deadlift, not on curls.',
    },
    {
      question: 'Should I test a true 1RM or estimate it?',
      answer:
        'Most lifters should estimate. A true single needs a spotter, safeties, and a reason. A hard set of 3–5 plus Epley is enough for next week’s percentages.',
    },
    {
      question: 'Does LIFTAG calculate 1RM automatically?',
      answer:
        'Yes. Log the set and estimated 1RM updates per exercise with Epley. PRs stay on the lift you actually performed.',
    },
    {
      question: 'How is my strength percentile calculated?',
      answer:
        'LIFTAG divides estimated 1RM by bodyweight and interpolates between published Strength Level ratios for the exercise and group. It is an approximate ranking among people who log there.',
    },
    {
      question: 'Which exercises have strength comparisons?',
      answer:
        'Common barbell, dumbbell, cable, and machine exercises have bodyweight-ratio benchmarks. Enter bodyweight and select a group to compare your estimated 1RM.',
    },
    {
      question: 'What is the difference between a 1RM and a PR?',
      answer:
        '1RM is a one-repetition maximum. A PR is any personal record, such as a 5RM, paused bench, or volume record. LIFTAG stores both.',
    },
  ],
}

export const sk: OneRmGuideCopy = {
  whatIntro:
    'Maximum na jedno opakovanie (1RM) je najväčšia hmotnosť, ktorú zdvihneš raz podľa štandardu, s akým súťažíš alebo trénuješ. PR je akýkoľvek osobný rekord: bench na 5 opakovaní, pauzovaný drep či objemový deň. Keď ľudia hľadajú „PR kalkulačku“, často myslia tento nástroj. Odhaduje 1RM a LIFTAG ukladá oboje.',
  whatDetail:
    'Na použitie čísla nepotrebuješ preteky. Potrebuješ náročnú sériu s niekoľkými opakovaniami, pomenovaný vzorec a záznam, ktorý ti budúci týždeň nevymyslí druhé maximum.',
  weight:
    'Zadaj záťaž a čisté opakovania. Prepni kg alebo lb; skutočná hmotnosť zostáva rovnaká. Výsledok sa aktualizuje počas písania. Bez tlačidla na odoslanie, e-mailovej brány či prihlasovania pred číslom.',
  pick: 'V časti Zisti, kde stojíš, vyhľadaj medzi {count} bežnými cvikmi s benchmarkmi sily: s veľkou činkou, jednoručkami, kladkou alebo strojom. Vyber cvik, zadaj hmotnosť tela a skupinu porovnania. Uvidíš približné poradie „si silnejší než X % cvičiacich“. Výber cviku mení porovnanie, nie rovnicu 1RM.',
  failure:
    'Chyba odhadu rastie s dĺžkou série. Náročných 5 opakovaní je vhodný stred. Séria na 20 opakovaní meria výdrž, nie to, čo by si raz odopol. Ak máš len dlhú sériu, urob ťažšiu a potom sa vráť.',
  exerciseSourcesSummary: 'Všetkých {count} benchmarkov cvikov a zdrojov',
  exerciseSourcesNote: 'Štandardy Strength Level, skontrolované 9. septembra 2026.',
  methodIntro:
    'LIFTAG odhaduje 1RM pomocou Epleyho vzorca pri sériách 1–10 opakovaní blízko zlyhania. Jedno opakovanie uloží ako zdvihnutú hmotnosť, nie s pridanými 3 %. Web používa rovnaký odhad ako aplikácia. Voliteľné RPE opisuje sériu, nie je druhým vzorcom.',
  methodDetails:
    'Vzorec, predpoklady a príklad sú aj v čistej Markdown verzii. Základné zaznamenávanie je bezplatné; cenník uvádza overené údaje k dátumu kontroly.',
  percentileIntro:
    'Vydelením odhadovaného 1RM hmotnosťou tela získaš pomer sily k hmotnosti. Porovnávame ho s publikovanými mužskými alebo ženskými pomermi Strength Level pre vybraný cvik.',
  percentileAnchors:
    'Body sú 5. (začiatočník), 20. (nováčik), 50. (stredne pokročilý), 80. (pokročilý) a 95. (elita) percentil. LIFTAG medzi nimi interpoluje a zobrazí „Si silnejší než X % cvičiacich“. Pod 5. percentilom zobrazí „menej než 5 %“. Overený pomer surového svetového rekordu môže posledných 5 % rozšíriť na 100 %.',
  percentileLimits:
    'Ide o približné porovnanie benchmarkov, nie o meraný populačný percentil. Zdroj zachytáva ľudí, ktorí zaznamenávajú výkony, nie všetkých. Nezohľadňuje vek, proporcie ani všetky rozdiely v hmotnosti. Platné série majú 1–30 opakovaní a hmotnosť 30–300 kg; po 10 opakovaniach je odhad aj poradie nepresnejšie.',
  equipment:
    'Hmotnosti jednoručiek sú za jednu jednoručku vrátane rukoväte; goblet drep a pullover s jednoručkou používajú jednu hmotnosť. Konštrukcia strojov a pomery kladiek sa líšia. Zhyby, podhmatové zhyby a dipy používajú hmotnosť tela plus pridanú záťaž ako celkový odhad a nemajú percentil. Ostatný cvik poskytne iba odhad.',
  formulasIntro:
    'Predvolený je Epley, aby sa web a záznam zhodovali. Porovnávacia tabuľka uvádza šesť ďalších publikovaných rovníc pre rovnakú sériu. Pri jednom opakovaní každý vzorec vráti zadanú hmotnosť.',
  formulaExample:
    'Príklad platný aj bez JavaScriptu: 100 kg × 5. Epley dáva {value} kg. 225 lb × 5 je 262,5 lb.',
  wrong: [
    'Série s veľkým počtom opakovaní. Po 10 rastie neistota; pred rozhodovaním použi kratšiu sériu.',
    'Izolované cviky a stroje umožnia pri rovnakom percente viac opakovaní než voľný drep.',
    'Odrazový a pauzovaný bench majú odlišný štandard; vzorec rozdiel nevidí.',
    'Hĺbka drepu, začiatok mŕtveho ťahu a úchop menia sériu. Rozdiel vzorcov nie je interval spoľahlivosti.',
    'Únava, diéta a zlý spánok robia z rovnakých kíl inú sériu. Na to slúži RPE.',
  ],
  testing: [
    'Rozcvič sa po ťažké trojité opakovanie, ktoré už zvládaš.',
    'Pridávaj malé kotúče a do posledného pokusu si nechaj jedno opakovanie.',
    'Použi sparingpartnera a bezpečnostné dorazy. Dorazy nastav pred pridaním záťaže.',
    'Jedno opakovanie zaznamenaj. LIFTAG ho uloží ako maximum, nie ako odhad.',
  ],
  appIntro:
    'Každá pracovná séria môže aktualizovať odhadované 1RM pre daný cvik. Aplikácia používa Epleyho vzorec pri každej sérii rovnako ako táto stránka. PR zostáva pri cviku, ktorý si vykonal, a percentá čerpajú z histórie. NFC a QR štítky v partnerských fitkách otvoria správny cvik.',
  appGetLabel: 'Získaj aplikáciu',
  appGetTail:
    'Základné zaznamenávanie je v iOS aj Androide bezplatné. Odhadované 1RM nie je za platenou bránou.',
  epleyHeading: 'Epley (1985)',
  epleyBody:
    'Lineárny vzorec: 1RM = w × (1 + r / 30). Pri 10 opakovaniach sa zhoduje s Brzyckim pri w × 4/3. Pod 10 opakovaniami vychádza trochu vyššie. LIFTAG ho používa ako predvolený, pretože je stabilný, pomenovaný a už je v aplikácii.',
  brzyckiHeading: 'Brzycki (1993)',
  brzyckiBody:
    '1RM = w × 36 / (37 − r). V strede rozsahu je konzervatívny. Pri 37 opakovaniach nie je definovaný, preto pri 30 opakovaniach neukazujeme Brzyckiho číslo, akoby išlo o maximum.',
  familyHeading: 'Ostatné vzorce',
  familyBody:
    'Lombardi je mocninová krivka. Mayhew a Wathen sú exponenciálne a v štúdii LeSuer vyhrali pri benchi. O’Connor je plytšia lineárna rovnica (r/40). Lander je rovnica percentuálnej tabuľky z éry NSCA. Štúdia LeSuer et al. z roku 1997 je stále vhodným zdrojom: každý vzorec podhodnotil mŕtvy ťah približne o 10 %.',
  liftsIntro:
    'V kalkulačke vyber cvik a zobrazí sa jeho kontext a benchmarky sily. Vzorce 1RM zostávajú rovnaké. Väčšina validačných štúdií sa venuje benču, drepu a mŕtvemu ťahu. 8RM na stroji na prsia nie je súťažný bench.',
  liftsProgram:
    'Pri percentuálnych programoch, napríklad 5/3/1, používaj 90 % tréningového maxima ako konzervatívnu referenciu. V návode na najlepšiu aplikáciu pre powerlifting nájdeš, ako to vyzerá v zázname.',
  trueMaxIntro:
    'Väčšinu týždňov to vynechaj. Zaznamenávaj podmaximálne série, sleduj trend odhadovaného 1RM a pridaj záťaž, keď je progresívne preťaženie poctivé.',
  sourcesIntro:
    'Napísal tím LIFTAG v Bratislave. Naposledy skontrolované: {reviewed}. Prvýkrát publikované: {published}. Odhadované 1RM zaznamenávame pomocou Epleyho vzorca. Táto stránka ukazuje aj ostatné vzorce, aby si videl rozdiely.',
  sourcesFacts: 'Fakty a spôsob citovania: o nás, press kit.',
  sourcesQuestions: 'Otázky: podpora.',
  sourceLabels: [
    'Epley, B. (1985). Poundage chart. University of Nebraska.',
    'Brzycki, M. (1993). Strength testing: predikcia maxima na jedno opakovanie z opakovaní do únavy. JOPERD 64(1), 88–90.',
    'Lombardi, V. P. (1989). Beginning Weight Training. Wm. C. Brown.',
    'Mayhew, J. L. a kol. (1992). Relatívna svalová vytrvalosť ako prediktor sily na benchi. JSCR.',
    "O'Connor, B., Simmons, J. a O'Shea, P. (1989). Weight Training Today.",
    'Wathen, D. (1994). Priradenie záťaže. In: NSCA Essentials of Strength Training and Conditioning.',
    'Lander, J. (1985). Maximum podľa počtu opakovaní. NSCA Journal 6, 60–61.',
    'LeSuer, D. A. a kol. (1997). Presnosť predikčných rovníc pri odhade výkonu 1RM v benchi, drepe a mŕtvom ťahu. JSCR 11(4), 211–213.',
    'Reynolds, J. M., Gordon, T. J. a Robergs, R. A. (2006). Predikcia sily maxima na jedno opakovanie z testovania viacerých opakovaní a antropometrie. JSCR.',
    'Strength Level. Silové štandardy. Široké tabuľky pomerov hmotnosti tela a výkonu pre porovnanie „silnejší než X % cvičiacich“, skontrolované 9. septembra 2026.',
    'OpenPowerlifting. Historické surové súťažné výkony použité ako pomer svetového rekordu pre drep, bench a mŕtvy ťah, skontrolované 11. septembra 2026.',
    'Naim Süleymanoğlu, 1988, kategória do 60 kg: trh 152,5 kg a nadhod 190 kg, použitý ako mužský pomer svetového rekordu v olympijských zdvihoch.',
    'Hou Zhihui, Tokio 2021, kategória do 49 kg: trh 94 kg a nadhod 116 kg, použitý ako ženský pomer svetového rekordu v olympijských zdvihoch.',
  ],
  faqs: [
    {
      question: 'Ako vypočítate maximum na jedno opakovanie?',
      answer:
        'Vezmi náročnú sériu 2–10 opakovaní a použi Epleyho vzorec: 1RM = hmotnosť × (1 + opakovania / 30). Séria 100 kg × 5 dá odhad 116,7 kg. Je to odhad, nie otestované maximum.',
    },
    {
      question: 'Ktorý vzorec 1RM je najpresnejší?',
      answer:
        'Žiadny vzorec nefunguje najlepšie pri každom cviku. LIFTAG používa Epleyho vzorec, aby sa web zhodoval so záznamom. Keď na čísle záleží, použi náročnú sériu najviac piatich opakovaní.',
    },
    {
      question: 'Ako presná je kalkulačka 1RM?',
      answer:
        'Náročná séria 2–8 opakovaní pri komplexných cvikoch býva približne do 5 %. Po 10 opakovaniach vzorce merajú skôr vytrvalosť než maximum. Odhad nepoužívaj ako pokus na pretekoch.',
    },
    {
      question: 'Prečo je toto najlepšia kalkulačka 1RM?',
      answer:
        'Uvádza sedem vzorcov, ukazuje spoľahlivosť podľa počtu opakovaní, porovnáva podporované cviky s publikovanými pomermi a počíta v zariadení bez registrácie.',
    },
    {
      question: 'Je 5 opakovaní približne 85 % 1RM?',
      answer:
        'Tabuľky NSCA dávajú 5RM približne na 87 % otestovaného 1RM. Epley považuje päť opakovaní za približne 86 % odhadu. Na plánovanie to stačí, na otvárací pokus nie.',
    },
    {
      question: 'Môžem to použiť ako kalkulačku maxima na bench alebo drep?',
      answer:
        'Áno. Vyber cvik a zobrazí sa jeho kontext. Publikované vzorce sa overovali najmä na benchi, drepe a mŕtvom ťahu, nie na bicepsových zdvihoch.',
    },
    {
      question: 'Mám otestovať skutočné 1RM alebo ho odhadnúť?',
      answer:
        'Väčšina cvičiacich by mala odhadovať. Skutočné maximum vyžaduje sparingpartnera, dorazy a dôvod. Na percentá budúceho týždňa stačí náročná séria 3–5 opakovaní a Epley.',
    },
    {
      question: 'Počíta LIFTAG 1RM automaticky?',
      answer:
        'Áno. Zaznamenaj sériu a odhadované 1RM sa pri cviku aktualizuje pomocou Epleyho vzorca. PR zostáva pri cviku, ktorý si vykonal.',
    },
    {
      question: 'Ako sa počíta môj silový percentil?',
      answer:
        'LIFTAG vydelí odhadované 1RM hmotnosťou tela a interpoluje medzi publikovanými pomermi Strength Level pre cvik a skupinu. Ide o približné poradie medzi ľuďmi, ktorí tam zaznamenávajú výkony.',
    },
    {
      question: 'Ktoré cviky majú silové porovnanie?',
      answer:
        'Bežné cviky s veľkou činkou, jednoručkami, kladkami a strojmi majú benchmarky pomeru k hmotnosti tela. Zadaj hmotnosť a vyber skupinu.',
    },
    {
      question: 'Aký je rozdiel medzi 1RM a PR?',
      answer:
        '1RM je maximum na jedno opakovanie. PR je akýkoľvek osobný rekord, napríklad 5RM, pauzovaný bench alebo objemový rekord. LIFTAG ukladá oboje.',
    },
  ],
}
