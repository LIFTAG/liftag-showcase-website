import type { JournalArticle } from './types'

export const en = {
  slug: "can-wearables-auto-log-workouts",
  path: "/journal/can-wearables-auto-log-workouts",
  titleHtml: "Can a smartwatch <span class=\"lime\">log your workout for you?</span>",
  titleText: "Can a smartwatch log your workout for you?",
  description: "New research can reconstruct arm motion from one watch and find action boundaries with fewer labels. Here is what that means for automatic workout logging — and what is still missing.",
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
  body: "<section><h2>The promise is bigger than the evidence</h2><p>A watch that recognizes every exercise, counts every rep and fills in your log sounds inevitable. A modern smartwatch already has an inertial measurement unit: an accelerometer and gyroscope that record how the device moves. The hard part is turning one moving wrist into a reliable account of the whole exercise.</p><p>Three September 2026 preprints show useful pieces of that puzzle. One reconstructs arm pose from a single watch. Another learns when an action starts and ends from sparse labels. A third estimates broad muscle-activity states from body pose. None of them demonstrates an automatic strength-training log, and none tells a watch the load on the bar.</p></section>\n<section><h2>ArmPoser removes a real point of friction</h2><p>ArmPoser, by Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann and Karan Ahuja, estimates shoulder, elbow and wrist pose from one consumer smartwatch. Earlier systems often ask the wearer to hold a reference pose so the sensor can be aligned with the body. ArmPoser instead trains on the watch's own coordinate frame and simulates plausible differences in anatomy and watch placement.</p><p>On public datasets and a new study with 10 participants performing 30 activities, the system matched or beat calibrated baselines. The paper reports a median positional error of about 8.1 cm across the wrist and elbow. A separate module identifies which side of the forearm the watch is on and which way its crown faces.</p><p>That is meaningful progress. Removing a calibration ritual makes passive sensing more plausible. But an arm trajectory is not yet an exercise log. The same wrist path can belong to different exercises, technique standards or loads, while lower-body work may give the watch very little distinctive motion.</p></section>\n<section><h2>Finding the edges of a set is another problem</h2><p>PSEE learns probable action boundaries from one labeled timestamp and improved boundary estimates on four inertial-sensing benchmarks.</p><p>Automatic logging still has to separate a set from walking, resting and adjusting equipment. This benchmark result is not evidence that a consumer watch can segment an unscripted gym session reliably.</p></section>\n<section><h2>Pose is not load, effort or muscle tension</h2><p>Pose2Muscle estimates discrete muscle-activity states from body pose. Its 14-person dataset contains 2,992 instances, and accuracy fell from 86.36% on a random split to 63.97% on held-out participants.</p><p>The drop is the practical point: bodies differ. A pose estimate cannot recover kilograms, reps in reserve, pain or the force produced by a muscle.</p></section>\n<section><h2>What the studies do not yet cover</h2><p>ArmPoser's authors are unusually clear about the boundary of their result. Their real-world dataset was mostly young people, used short scripted sessions and recorded only the left wrist. Pose and watch-configuration recognition were evaluated separately. The system has about 170 ms of delay and 9–12 cm of wrist error, which the authors consider reasonable for activity logging or coarse feedback but insufficient for precise pointing.</p><p>The study also reconstructs the arm relative to the body rather than an absolute direction in the room. Clothing, sweat, strap tightness, repeated donning and longer daily use need broader evaluation. Motion traces also carry privacy risk because they can reveal a person's activities even without a camera.</p><p>Most importantly for lifters, these papers do not show robust recognition of barbell, dumbbell and machine exercises in a busy gym. They do not infer the plates on a bar, distinguish a warm-up from a work set, or know whether a partial rep was intentional.</p></section>\n<section><h2>What this means for your workout log</h2><p>Automatic suggestions are becoming more credible. A future logger could notice a movement window, propose an exercise and count likely repetitions. The sensible product design is to show its evidence and let the lifter confirm the exercise, load and set before saving it.</p><p>For now, a deliberate log remains more trustworthy. LIFTAG does not claim to infer exercises or muscle activity from a smartwatch. Its job is to make an accurate entry quick: identify the station, enter the load and reps, and keep a history you can audit. Research like ArmPoser may eventually reduce that input, but it has not removed the need to verify it.</p></section>\n<section><h2>Sources and credit</h2><ul><li>Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann and Karan Ahuja. “ArmPoser: Real-Time, Calibration-Free Arm Pose Estimation from Smartwatch IMU.” arXiv preprint, submitted 8 September 2026; accepted at ACM SUI 2026: <a href=\"https://arxiv.org/abs/2609.08806\">arxiv.org</a></li><li>Jiaxi Yin, Ge Wang, Han Ding and Fei Wang. “PSEE: Progressive Sensor Event Expansion for Point-Supervised Temporal Action Localization.” arXiv preprint, submitted 18 September 2026: <a href=\"https://arxiv.org/abs/2609.21462\">arxiv.org</a></li><li>Yuepeng Chen, Jiehong Shi, Kaili Zheng, Boyi Zhang, Chenyi Guo, Ji Wu and Xiangling Fu. “Pose2Muscle: Structured Spatio-Temporal Decoding for Discrete Muscle Activity Estimation from Human Pose.” arXiv preprint, submitted 16 September 2026: <a href=\"https://arxiv.org/abs/2609.18336\">arxiv.org</a></li></ul><p>Links and versions checked 7 October 2026. PSEE and Pose2Muscle are preprints. This article is an independent summary; no paper figures or prose are reproduced.</p></section><section><h2>Additional source and licenses</h2><ul><li>Hossein Khayami, Sungjin Hwang, Eshed Ohn-Bar, David E. Conroy, Amanda Lazar, Eun Kyoung Choe and Hernisa Kacorri. “Characterizing the Performance Gap in Human Activity Recognition for Older Adults.” To appear in ACM ISWC 2026; arXiv version submitted 2 October 2026: <a href=\"https://arxiv.org/abs/2610.02711\">arxiv.org</a>. Licensed <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>.</li></ul><p>ArmPoser is also licensed <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>. Pose2Muscle uses <a href=\"https://creativecommons.org/licenses/by-nc-nd/4.0/\">CC BY-NC-ND 4.0</a>. PSEE is available under the standard arXiv distribution license. We paraphrase each source and reproduce no paper media.</p></section>",
  faqs: [
    {
      question: "Can a smartwatch automatically recognize strength exercises?",
      answer: "It can recognize some movements under controlled conditions, but the research reviewed here does not demonstrate a reliable, complete strength-training log in an unscripted gym. Exercise identity, set boundaries and load remain separate problems."
    },
    {
      question: "Do activity-recognition models work equally well for older adults?",
      answer: "Not necessarily. An October 2026 paper led by Hossein Khayami found that gains on young-adult benchmarks did not transfer cleanly to MyMove participants with a mean age of 71. More diverse UK Biobank representations reduced the age gap but did not remove it. The result concerns general activity recognition, not gym-set detection, and reinforces the need to test models on the people expected to use them."
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
      answer: "No. LIFTAG does not currently claim smartwatch exercise recognition or muscle-activity inference. You confirm the exercise, load and repetitions so the saved history remains auditable."
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
  description: "Nový výskum vie z jedných hodiniek rekonštruovať pohyb ruky a s menším množstvom značiek hľadať hranice aktivity. Čo to znamená pre automatický tréningový denník a čo stále chýba.",
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
  body: "<section><h2>Sľub je väčší než dôkazy</h2><p>Hodinky, ktoré rozpoznajú každý cvik, spočítajú opakovania a vyplnia denník, znejú ako samozrejmá budúcnosť. Smart hodinky už majú inerciálnu meraciu jednotku: akcelerometer a gyroskop zaznamenávajúce pohyb zariadenia. Ťažké je premeniť jeden pohybujúci sa zápästný senzor na spoľahlivý opis celého cviku.</p><p>Tri preprinty zo septembra 2026 ukazujú užitočné časti skladačky. Jeden rekonštruuje polohu ruky z jediných hodiniek. Druhý sa z riedkych značiek učí, kedy aktivita začína a končí. Tretí z polohy tela odhaduje hrubé stavy svalovej aktivity. Ani jeden nepredvádza automatický silový denník a žiadny z nich nezistí záťaž na činke.</p></section>\n<section><h2>ArmPoser odstraňuje skutočnú prekážku</h2><p>ArmPoser od Bishnu Deva, Vasca Xu, Xi-Aan Loha, Chenfenga Gaoa, Henryho Hoffmanna a Karana Ahuju odhaduje polohu ramena, lakťa a zápästia z jedných bežných hodiniek. Staršie systémy často žiadajú používateľa o referenčnú pózu na zarovnanie senzora s telom. ArmPoser trénuje priamo v súradnicovom systéme hodiniek a simuluje reálne rozdiely v anatómii aj polohe zariadenia.</p><p>Na verejných datasetoch a v novej štúdii s 10 účastníkmi a 30 aktivitami systém dosiahol alebo prekonal kalibrované metódy. Práca uvádza medián polohovej chyby približne 8,1 cm pre zápästie a lakeť. Samostatný modul rozoznáva stranu predlaktia a smer korunky.</p><p>Je to podstatný posun. Odstránenie kalibračného rituálu približuje pasívne snímanie realite. Trajektória ruky však ešte nie je tréningový zápis. Rovnaká dráha zápästia môže patriť rôznym cvikom, technikám aj záťažiam a pri tréningu nôh sa hodinky nemusia pohybovať výrazne.</p></section>\n<section><h2>Nájsť hranice série je ďalší problém</h2><p>PSEE sa učí pravdepodobné hranice aktivity z jedného označeného času a zlepšila ich odhad na štyroch benchmarkoch inerciálnych senzorov.</p><p>Automatický denník stále musí oddeliť sériu od chôdze, prestávky a nastavovania stroja. Výsledok z benchmarku nedokazuje spoľahlivé rozdelenie spontánneho tréningu bežnými hodinkami.</p></section>\n<section><h2>Poloha tela nie je záťaž, úsilie ani svalové napätie</h2><p>Pose2Muscle odhaduje diskrétne stavy svalovej aktivity z polohy tela. Dataset 14 ľudí obsahuje 2 992 záznamov a presnosť klesla z 86,36 % pri náhodnom rozdelení na 63,97 % pri nových účastníkoch.</p><p>Praktický je práve tento pokles: telá sa líšia. Odhad polohy neurčí kilogramy, rezervu opakovaní, bolesť ani silu svalu.</p></section>\n<section><h2>Čo štúdie zatiaľ nepokrývajú</h2><p>Autori ArmPoseru pomenúvajú hranice výsledku otvorene. Reálny dataset tvorili prevažne mladí ľudia, krátke riadené úlohy a iba ľavé zápästie. Odhad polohy a rozpoznanie konfigurácie hodiniek testovali oddelene. Systém má oneskorenie asi 170 ms a chybu zápästia 9 až 12 cm. Podľa autorov to môže stačiť na denník alebo hrubú spätnú väzbu, nie na presné ukazovanie.</p><p>Systém rekonštruuje ruku vzhľadom na telo, nie absolútny smer v priestore. Oblečenie, pot, utiahnutie remienka, opakované nasadenie a celodenné používanie potrebujú širšie testy. Aj bez kamery nesie pohybový záznam riziko súkromia, pretože môže prezradiť, čo človek robí.</p><p>Pre silový tréning je zásadné, že práce neukazujú spoľahlivé rozpoznanie činiek, jednoručiek a strojov v rušnej posilňovni. Nezistia kotúče na osi, nerozoznajú rozcvičovaciu sériu od pracovnej a nevedia, či bolo skrátené opakovanie zámerné.</p></section>\n<section><h2>Čo to znamená pre tvoj denník</h2><p>Automatické návrhy sú čoraz reálnejšie. Budúci denník môže zachytiť pohybový úsek, navrhnúť cvik a spočítať pravdepodobné opakovania. Rozumný produkt ukáže, z čoho vychádza, a pred uložením nechá cvičenca potvrdiť cvik, záťaž a sériu.</p><p>Zatiaľ je vedomý zápis dôveryhodnejší. LIFTAG netvrdí, že z hodiniek odhaduje cvik alebo svalovú aktivitu. Jeho úlohou je urobiť presný zápis rýchlym: označiť stanovište, zadať záťaž a opakovania a uchovať históriu, ktorú vieš skontrolovať. Výskum ako ArmPoser môže raz zmenšiť množstvo vstupov, zatiaľ však neodstránil potrebu overenia.</p></section>\n<section><h2>Zdroje a autori</h2><ul><li>Bishnu Dev, Vasco Xu, Xi-Aan Loh, Chenfeng Gao, Henry Hoffmann a Karan Ahuja. „ArmPoser: Real-Time, Calibration-Free Arm Pose Estimation from Smartwatch IMU.“ Preprint na arXiv, zverejnený 8. septembra 2026; prijatý na ACM SUI 2026: <a href=\"https://arxiv.org/abs/2609.08806\">arxiv.org</a></li><li>Jiaxi Yin, Ge Wang, Han Ding a Fei Wang. „PSEE: Progressive Sensor Event Expansion for Point-Supervised Temporal Action Localization.“ Preprint na arXiv, zverejnený 18. septembra 2026: <a href=\"https://arxiv.org/abs/2609.21462\">arxiv.org</a></li><li>Yuepeng Chen, Jiehong Shi, Kaili Zheng, Boyi Zhang, Chenyi Guo, Ji Wu a Xiangling Fu. „Pose2Muscle: Structured Spatio-Temporal Decoding for Discrete Muscle Activity Estimation from Human Pose.“ Preprint na arXiv, zverejnený 16. septembra 2026: <a href=\"https://arxiv.org/abs/2609.18336\">arxiv.org</a></li></ul><p>Odkazy a verzie overené 7. októbra 2026. PSEE a Pose2Muscle sú preprinty. Článok je nezávislé zhrnutie; nepreberá obrázky ani text prác.</p></section><section><h2>Ďalší zdroj a licencie</h2><ul><li>Hossein Khayami, Sungjin Hwang, Eshed Ohn-Bar, David E. Conroy, Amanda Lazar, Eun Kyoung Choe a Hernisa Kacorri. „Characterizing the Performance Gap in Human Activity Recognition for Older Adults.“ Práca bude publikovaná na ACM ISWC 2026; verzia na arXiv bola zverejnená 2. októbra 2026: <a href=\"https://arxiv.org/abs/2610.02711\">arxiv.org</a>. Licencia <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>.</li></ul><p>ArmPoser má tiež licenciu <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC BY 4.0</a>. Pose2Muscle používa <a href=\"https://creativecommons.org/licenses/by-nc-nd/4.0/\">CC BY-NC-ND 4.0</a>. PSEE je dostupná pod štandardnou distribučnou licenciou arXiv. Všetky zdroje parafrázujeme a nepreberáme médiá z prác.</p></section>",
  faqs: [
    {
      question: "Dokážu smart hodinky automaticky rozoznať silové cviky?",
      answer: "Niektoré pohyby v riadených podmienkach áno, no tento výskum neukazuje spoľahlivý kompletný denník spontánneho tréningu. Identita cviku, hranice série a záťaž sú stále samostatné problémy."
    },
    {
      question: "Funguje rozpoznávanie aktivít rovnako dobre aj pri starších ľuďoch?",
      answer: "Nie nevyhnutne. Októbrová práca vedená Hosseinom Khayamim ukázala, že zlepšenia na benchmarkoch mladých ľudí sa nepreniesli čisto na účastníkov MyMove s priemerným vekom 71 rokov. Pestrejšie reprezentácie z UK Biobank vekový rozdiel zmenšili, no neodstránili. Výsledok sa týka všeobecného rozpoznávania aktivít, nie detekcie sérií v posilňovni, a zdôrazňuje potrebu testovať model na jeho budúcich používateľoch."
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
