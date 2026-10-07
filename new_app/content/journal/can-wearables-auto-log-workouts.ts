import type { JournalArticle } from './types'

export const en = {
  slug: "can-wearables-auto-log-workouts",
  path: "/journal/can-wearables-auto-log-workouts",
  titleHtml: "Can a smartwatch <span class=\"lime\">log your workout for you?</span>",
  titleText: "Can a smartwatch log your workout for you?",
  description: "New studies show how a watch might follow arm movement and notice when an action starts or stops. Here is what that could add to a workout log, and what it still cannot do.",
  seoTitle: "Can Smartwatches Automatically Log Workouts? | LIFTAG",
  datePublished: "2026-10-07",
  category: "RESEARCH",
  dateUpdated: "2026-10",
  citations: [
    "https://arxiv.org/abs/2609.08806",
    "https://arxiv.org/abs/2609.21462",
    "https://arxiv.org/abs/2609.18336",
    "https://arxiv.org/abs/2610.02711"
  ],
  body: "<section><h2>The promise is bigger than the evidence</h2><p>A watch that names the exercise, counts the reps and fills in the log would save a lot of tapping. Watches already contain motion sensors: an accelerometer measures changes in speed, while a gyroscope measures rotation. The difficult part is working out what the whole body did from the movement of one wrist.</p><p>Three papers from September 2026 examine separate parts of this problem: where the arm is, when an action begins and ends, and whether body pose contains clues about muscle activity. They are research building blocks. None produces a complete strength-training log or reads the weight on a bar.</p></section>\n<section><h2>ArmPoser follows the arm without a setup pose</h2><p>ArmPoser, by Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann and Karan Ahuja, estimates shoulder, elbow and wrist pose from one consumer smartwatch. Earlier systems often ask the wearer to hold a reference pose so the watch can work out its position on the body. ArmPoser skips that step and is trained to handle differences in bodies and watch placement.</p><p>On public datasets and a new study with 10 participants performing 30 activities, the system was as accurate as or more accurate than comparison systems that required calibration. The paper reports a median positional error of about 8.1 cm across the wrist and elbow. A separate module identifies which side of the forearm the watch is on and which way its crown faces.</p><p>Skipping a calibration pose would make this kind of sensing easier to use. Still, an arm path is only one clue. A curl with 8 kg and a curl with 14 kg can look similar to a watch, and a leg press may barely move the wrist at all.</p></section>\n<section><h2>Finding the edges of a set is another problem</h2><p>PSEE learns where an action probably starts and ends from a single marked moment. It improved those estimates across four prepared motion-sensor tests.</p><p>A gym session includes walking between stations, moving a bench, resting and checking a phone. A logger must separate all of that from the actual set. Results on four prepared collections of data do not yet show that an ordinary watch can do this reliably in a busy gym.</p></section>\n<section><h2>Body position does not reveal weight or effort</h2><p>Pose2Muscle sorts muscle activity into broad categories using body position. In data from 14 people, accuracy was 86.36% when examples were mixed at random, but fell to 63.97% when tested on people excluded from training.</p><p>The lower score on new people matters because bodies differ. Knowing a body position does not tell you the weight lifted, how many more reps someone could do, whether they are in pain or how much force a muscle produced.</p></section>\n<section><h2>What the studies do not yet cover</h2><p>ArmPoser's authors are unusually clear about the boundary of their result. Their real-world dataset was mostly young people, used short scripted sessions and recorded only the left wrist. Pose and watch-configuration recognition were evaluated separately. The system has about 170 ms of delay and 9–12 cm of wrist error, which the authors consider reasonable for activity logging or coarse feedback but insufficient for precise pointing.</p><p>The study also reconstructs the arm relative to the body rather than an absolute direction in the room. Clothing, sweat, strap tightness, taking the watch off and putting it back on, and longer daily use still need broader testing. Motion traces also carry privacy risk because they can reveal a person's activities even without a camera.</p><p>Most importantly for lifters, these papers do not show robust recognition of barbell, dumbbell and machine exercises in a busy gym. They do not infer the plates on a bar, distinguish a warm-up from a work set, or know whether a partial rep was intentional.</p></section>\n<section><h2>What this means for your workout log</h2><p>These studies make a helpful assistant easier to imagine. It might notice a block of repeated movement, suggest an exercise and offer a rep count. Before saving, it should still ask the lifter to confirm the exercise, weight and set.</p><p>For now, check every suggested entry against what you actually did. This article reviews external research; it does not announce that LIFTAG uses ArmPoser, PSEE or Pose2Muscle. Better sensing may reduce typing later, but the saved record still needs a human check.</p></section>\n<section><h2>Sources and credit</h2><ul><li>Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann and Karan Ahuja. “ArmPoser: Real-Time, Calibration-Free Arm Pose Estimation from Smartwatch IMU.” arXiv preprint, submitted 8 September 2026; accepted at ACM SUI 2026: <a href=\"https://arxiv.org/abs/2609.08806\">arxiv.org</a></li><li>Jiaxi Yin, Ge Wang, Han Ding and Fei Wang. “PSEE: Progressive Sensor Event Expansion for Point-Supervised Temporal Action Localization.” arXiv preprint, submitted 18 September 2026: <a href=\"https://arxiv.org/abs/2609.21462\">arxiv.org</a></li><li>Yuepeng Chen, Jiehong Shi, Kaili Zheng, Boyi Zhang, Chenyi Guo, Ji Wu and Xiangling Fu. “Pose2Muscle: Structured Spatio-Temporal Decoding for Discrete Muscle Activity Estimation from Human Pose.” arXiv preprint, submitted 16 September 2026: <a href=\"https://arxiv.org/abs/2609.18336\">arxiv.org</a></li></ul><p>Links and versions checked 7 October 2026. PSEE and Pose2Muscle are preprints. This article is an independent summary; no paper figures or prose are reproduced.</p></section><section><h2>Additional source and licenses</h2><ul><li>Hossein Khayami, Sungjin Hwang, Eshed Ohn-Bar, David E. Conroy, Amanda Lazar, Eun Kyoung Choe and Hernisa Kacorri. “Characterizing the Performance Gap in Human Activity Recognition for Older Adults.” To appear in ACM ISWC 2026; arXiv version submitted 2 October 2026: <a href=\"https://arxiv.org/abs/2610.02711\">arxiv.org</a>. Licensed <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>.</li></ul><p>ArmPoser is also licensed <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>. Pose2Muscle uses <a href=\"https://creativecommons.org/licenses/by-nc-nd/4.0/\">CC BY-NC-ND 4.0</a>. PSEE is available under the standard arXiv distribution license. We paraphrase each source and reproduce no paper media.</p></section>",
  faqs: [
    {
      question: "Can a smartwatch automatically recognize strength exercises?",
      answer: "Some movements can be recognized in controlled tests. These studies do not show a complete, reliable log of an ordinary gym workout. A watch still has to identify the exercise, tell where each set starts and ends, and record the weight."
    },
    {
      question: "Do activity-recognition models work equally well for older adults?",
      answer: "Not always. In an October 2026 study led by Hossein Khayami, improvements measured on younger adults did not carry over fully to the MyMove group, whose average age was 71. Training with a larger and more varied UK Biobank dataset narrowed the gap but did not remove it. The study covered everyday activity recognition, not gym sets."
    },
    {
      question: "Can a smartwatch count reps accurately?",
      answer: "Rep counting can work for movements with a clear wrist pattern, but accuracy depends on exercise, technique, watch placement and the person. A proposed count should still be checked before it becomes part of a training history."
    },
    {
      question: "Can a watch tell how much weight I lifted?",
      answer: "Not from wrist motion alone. Similar motion can be performed with different loads, and the reviewed studies do not infer plates, dumbbell weight or machine settings."
    },
    {
      question: "Does LIFTAG automatically sense exercises from a watch?",
      answer: "No. LIFTAG does not currently claim recognizing exercises or estimating muscle activity from a smartwatch. You confirm the exercise, load and repetitions so you can check the saved history later."
    }
  ],
  ctaPath: "/",
  ctaLabel: "Get LIFTAG free",
  secondaryPath: "/journal/how-to-track-workouts",
  secondaryLabel: "Learn how to track workouts"
} satisfies JournalArticle

export const sk = {
  slug: "can-wearables-auto-log-workouts",
  path: "/journal/can-wearables-auto-log-workouts",
  titleHtml: "Dokážu hodinky <span class=\"lime\">zapísať tréning za teba?</span>",
  titleText: "Dokážu hodinky zapísať tréning za teba?",
  description: "Nové štúdie ukazujú, ako by hodinky mohli sledovať ruku a zachytiť začiatok či koniec pohybu. Čo to môže priniesť tréningovému denníku a čo stále nedokáže.",
  seoTitle: "Dokážu smart hodinky automaticky zapisovať tréning? | LIFTAG",
  datePublished: "2026-10-07",
  category: "VÝSKUM",
  dateUpdated: "2026-10",
  citations: [
    "https://arxiv.org/abs/2609.08806",
    "https://arxiv.org/abs/2609.21462",
    "https://arxiv.org/abs/2609.18336",
    "https://arxiv.org/abs/2610.02711"
  ],
  body: "<section><h2>Sľub je väčší než dôkazy</h2><p>Hodinky, ktoré pomenujú cvik, spočítajú opakovania a vyplnia denník, by ušetrili veľa ťukania. Pohyb už merajú dvoma bežnými senzormi: akcelerometer sleduje zmeny rýchlosti a gyroskop otáčanie. Ťažké je z pohybu jedného zápästia zistiť, čo robilo celé telo.</p><p>Tri práce zo septembra 2026 skúmajú oddelené časti problému: kde je ruka, kedy sa aktivita začína a končí a či poloha tela napovedá niečo o práci svalov. Sú to stavebné diely výskumu. Ani jedna nevytvára kompletný silový denník ani nečíta váhu na činke.</p></section>\n<section><h2>ArmPoser sleduje ruku bez úvodnej pózy</h2><p>ArmPoser od Bishnu Deva, Vasca Xu, Xi-Aan Loha, Chenfenga Gaoa, Henryho Hoffmanna a Karana Ahuju odhaduje polohu ramena, lakťa a zápästia z jedných bežných hodiniek. Staršie systémy často žiadajú používateľa o úvodnú pózu, aby zistili polohu hodiniek na tele. ArmPoser tento krok vynecháva a pri tréningu počíta s rozdielnymi telami aj polohou hodiniek.</p><p>Na verejných súboroch dát a v novej štúdii s 10 účastníkmi a 30 aktivitami bol systém rovnako presný alebo presnejší než porovnávané systémy, ktoré vyžadovali kalibráciu. Práca uvádza medián polohovej chyby približne 8,1 cm pre zápästie a lakeť. Samostatný modul rozoznáva stranu predlaktia a smer korunky.</p><p>Bez kalibračnej pózy by sa takýto systém používal jednoduchšie. Dráha ruky je však iba jedna stopa. Bicepsový zdvih s 8 kg a so 14 kg môže pre hodinky vyzerať podobne a pri leg presse sa zápästie nemusí takmer vôbec hýbať.</p></section>\n<section><h2>Nájsť hranice série je ďalší problém</h2><p>PSEE sa z jedného označeného momentu učí, kde sa aktivita pravdepodobne začína a končí. Odhad zlepšila v štyroch pripravených testoch pohybových senzorov.</p><p>V posilňovni sa medzi stanovišťami prechádza, presúva sa lavička, oddychuje aj kontroluje mobil. Denník musí toto všetko oddeliť od série. Výsledky na štyroch pripravených súboroch dát ešte nedokazujú, že to bežné hodinky zvládnu spoľahlivo v rušnej posilňovni.</p></section>\n<section><h2>Poloha tela neprezradí váhu ani námahu</h2><p>Pose2Muscle zaraďuje svalovú aktivitu do hrubých kategórií podľa polohy tela. Pri dátach 14 ľudí dosiahla presnosť 86,36 %, keď sa príklady premiešali náhodne, no pri testovaní na ľuďoch vynechaných z tréningu klesla na 63,97 %.</p><p>Nižšie skóre pri nových ľuďoch je dôležité, pretože telá sa líšia. Z polohy tela nezistíš zdvihnutú váhu, koľko ďalších opakovaní by človek zvládol, či ho niečo bolí ani akú silu sval vytvoril.</p></section>\n<section><h2>Čo štúdie zatiaľ nepokrývajú</h2><p>Autori ArmPoseru pomenúvajú hranice výsledku otvorene. Reálny dataset tvorili prevažne mladí ľudia, krátke riadené úlohy a iba ľavé zápästie. Odhad polohy a rozpoznanie konfigurácie hodiniek testovali oddelene. Systém má oneskorenie asi 170 ms a chybu zápästia 9 až 12 cm. Podľa autorov to môže stačiť na denník alebo hrubú spätnú väzbu, nie na presné ukazovanie.</p><p>Systém rekonštruuje ruku vzhľadom na telo, nie absolútny smer v priestore. Oblečenie, pot, utiahnutie remienka, opakované skladanie a nasadzovanie hodiniek aj celodenné používanie ešte potrebujú širšie testovanie. Aj bez kamery nesie pohybový záznam riziko súkromia, pretože môže prezradiť, čo človek robí.</p><p>Pre silový tréning je zásadné, že práce neukazujú spoľahlivé rozpoznanie činiek, jednoručiek a strojov v rušnej posilňovni. Nezistia kotúče na osi, nerozoznajú rozcvičovaciu sériu od pracovnej a nevedia, či bolo skrátené opakovanie zámerné.</p></section>\n<section><h2>Čo to znamená pre tvoj denník</h2><p>Tieto štúdie približujú predstavu užitočného pomocníka. Mohol by zachytiť opakovaný pohyb, navrhnúť cvik a ponúknuť počet opakovaní. Pred uložením by mal stále požiadať o potvrdenie cviku, váhy a série.</p><p>Každý navrhnutý zápis zatiaľ porovnaj s tým, čo si naozaj odcvičil. Článok hodnotí externý výskum; neoznamuje použitie ArmPoseru, PSEE ani Pose2Muscle v LIFTAGu. Lepšie snímanie môže časom znížiť množstvo písania, no uložený záznam stále potrebuje kontrolu človeka.</p></section>\n<section><h2>Zdroje a autori</h2><ul><li>Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann a Karan Ahuja. „ArmPoser: Real-Time, Calibration-Free Arm Pose Estimation from Smartwatch IMU.“ Preprint na arXiv, zverejnený 8. septembra 2026; prijatý na ACM SUI 2026: <a href=\"https://arxiv.org/abs/2609.08806\">arxiv.org</a></li><li>Jiaxi Yin, Ge Wang, Han Ding a Fei Wang. „PSEE: Progressive Sensor Event Expansion for Point-Supervised Temporal Action Localization.“ Preprint na arXiv, zverejnený 18. septembra 2026: <a href=\"https://arxiv.org/abs/2609.21462\">arxiv.org</a></li><li>Yuepeng Chen, Jiehong Shi, Kaili Zheng, Boyi Zhang, Chenyi Guo, Ji Wu a Xiangling Fu. „Pose2Muscle: Structured Spatio-Temporal Decoding for Discrete Muscle Activity Estimation from Human Pose.“ Preprint na arXiv, zverejnený 16. septembra 2026: <a href=\"https://arxiv.org/abs/2609.18336\">arxiv.org</a></li></ul><p>Odkazy a verzie overené 7. októbra 2026. PSEE a Pose2Muscle sú preprinty. Článok je nezávislé zhrnutie; nepreberá obrázky ani text prác.</p></section><section><h2>Ďalší zdroj a licencie</h2><ul><li>Hossein Khayami, Sungjin Hwang, Eshed Ohn-Bar, David E. Conroy, Amanda Lazar, Eun Kyoung Choe a Hernisa Kacorri. „Characterizing the Performance Gap in Human Activity Recognition for Older Adults.“ Práca bude publikovaná na ACM ISWC 2026; verzia na arXiv bola zverejnená 2. októbra 2026: <a href=\"https://arxiv.org/abs/2610.02711\">arxiv.org</a>. Licencia <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>.</li></ul><p>ArmPoser má tiež licenciu <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>. Pose2Muscle používa <a href=\"https://creativecommons.org/licenses/by-nc-nd/4.0/\">CC BY-NC-ND 4.0</a>. PSEE je dostupná pod štandardnou distribučnou licenciou arXiv. Všetky zdroje parafrázujeme a nepreberáme médiá z prác.</p></section>",
  faqs: [
    {
      question: "Dokážu smart hodinky automaticky rozoznať silové cviky?",
      answer: "V riadených testoch áno, pri niektorých pohyboch. Tieto štúdie však neukazujú kompletný spoľahlivý zápis bežného tréningu vo fitku. Hodinky stále musia rozpoznať cvik, začiatok a koniec série a zaznamenať váhu."
    },
    {
      question: "Funguje rozpoznávanie aktivít rovnako dobre aj pri starších ľuďoch?",
      answer: "Nie vždy. V októbrovej štúdii vedenej Hosseinom Khayamim sa zlepšenia namerané pri mladších ľuďoch nepreniesli naplno na skupinu MyMove s priemerným vekom 71 rokov. Tréning na väčšom a pestrejšom súbore UK Biobank rozdiel zmenšil, no neodstránil. Štúdia skúmala bežné denné aktivity, nie série v posilňovni."
    },
    {
      question: "Dokážu hodinky presne počítať opakovania?",
      answer: "Pri cvikoch s jasným pohybom zápästia to môže fungovať, no presnosť závisí od cviku, techniky, polohy hodiniek a človeka. Navrhnutý počet treba pred uložením skontrolovať."
    },
    {
      question: "Zistia hodinky, akú váhu som zdvihol?",
      answer: "Nie zo samotného pohybu zápästia. Rovnaký pohyb možno vykonať s rôznou záťažou a skúmané práce neodhadujú kotúče, váhu jednoručky ani nastavenie stroja."
    },
    {
      question: "Rozpoznáva LIFTAG cviky automaticky z hodiniek?",
      answer: "Nie. LIFTAG v súčasnosti netvrdí, že rozpoznáva cviky alebo svalovú aktivitu zo smart hodiniek. Cvik, záťaž a opakovania potvrdíš, aby uložená história zostala kontrolovateľná."
    }
  ],
  ctaPath: "/",
  ctaLabel: "Stiahnuť LIFTAG zadarmo",
  secondaryPath: "/journal/how-to-track-workouts",
  secondaryLabel: "Ako si zapisovať tréning"
} satisfies JournalArticle
