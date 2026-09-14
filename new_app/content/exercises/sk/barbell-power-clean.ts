import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-power-clean',
  metaDescription:
    'Silové premiestnenie s veľkou činkou: zdvih z podlahy do príjmu vo štvrťdrepe na ramenách a správne zaznamenanie v LIFTAGu bez zámeny za klasický mŕtvy ťah.',
  steps: [
    'Činku nastav nad stred chodidiel, predkolenia priblíž k osi, použi úchop s palcom obtočeným pod prstami a ramená drž nad činkou. Začiatok vyzerá ako pri klasickom mŕtvom ťahu, ale nejde o klasický mŕtvy ťah.',
    'Zatlač podlahu od seba. Činku drž pri tele a boky s ramenami zdvíhaj spolu, kým činka neprejde kolenami.',
    'Potom vyskoč: prudko otvor boky, pokrč ramenami a ruky nechaj vystreté, kým nebude činka dostatočne vysoko na príjem. Nepriťahuj ju nahor opačným bicepsovým zdvihom.',
    'Rýchlo pretoč lakte dopredu a zachyť činku na predných deltových svaloch. Pod činku klesni iba mierne, do štvrťdrepu; úplný drep patrí do drepu s premiestnením, ak si ho naprogramoval.',
    'Postav sa a cvik dokonči. Toto je premiestnenie. Činku nevytláčaj rukami. Ak má nasledovať tlak, ide o premiestnenie s tlakom.',
    'Činku spusti na podlahu alebo do visu pod kontrolou a znovu sa nastav. Odraz činky od stehien v nekonečnej slučke nie je tento cvik.',
  ],
  mistakes: [
    {
      title: 'Priťahovanie činky bicepsom',
      body: 'Predčasné pokrčenie rúk pokazí druhú fázu ťahu. Činku vymrštia boky; ruky dokončia príjem. Ak opisuje oblúk dopredu, je príliš ťažká alebo si ju ťahal bicepsmi.',
    },
    {
      title: 'Zaznamenanie ako klasický mŕtvy ťah',
      body: 'Príjem na ramená je súčasť cviku. Zdvih z podlahy po boky nie je rekord v silovom premiestnení a premiestnenie nie je rekord v mŕtvom ťahu. Použi tento identifikátor, aj keď prvý ťah vyzerá na videu rovnako.',
    },
    {
      title: 'Príjem v úplnom drepe počas silového premiestnenia',
      body: 'Silové premiestnenie znamená, že činku prijmeš vo vysokej polohe. Drep s premiestnením je iná zručnosť. Ak si klesol tak nízko, poznač si „drep s premiestnením“, inak budeš na budúci týždeň naháňať nesprávne číslo.',
    },
    {
      title: 'Vytlačenie príjmu a následné nazvanie cviku premiestnením',
      body: 'Činka má dopadnúť na ramená. Vytlačenie rukami znamená neúspešný pokus, prípadne premiestnenie s tlakom, ak bol tlak plánovaný. Tieto varianty nemiešaj do grafu silového premiestnenia.',
    },
  ],
  variations: [
    {
      slug: 'conventional-deadlift',
      name: 'Klasický mŕtvy ťah',
      note: 'Prvý ťah, nie celý tento cvik. Čísla mŕtveho ťahu nechaj v jeho vlastnom grafe.',
    },
    {
      slug: 'barbell-push-press',
      name: 'Tlak s veľkou činkou s dopomocou nôh',
      note: 'Pohon z predného držania do vystretia nad hlavou. Po príjme má inú úlohu.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlak veľkej činky nad hlavou v stoji',
      note: 'Striktný tlak z rovnakej polohy, bez pokrčenia nôh.',
    },
    {
      slug: 'barbell-clean-and-press',
      name: 'Premiestnenie a tlak s veľkou činkou',
      note: 'Najprv premiestnenie, potom tlak. Tento identifikátor použi, keď činka po príjme zámerne opustí ramená smerom nahor.',
    },
  ],
  progressions: [
    'Najprv si osvoj predklon v bedrách a polohu predného držania. Pomôže rumunský mŕtvy ťah a nácvik polohy pre predný drep, no v denníku ich veď ako samostatné cviky.',
    'Silové premiestnenie z visu s ľahkou činkou, kým si osvojíš rýchle pretočenie lakťov.',
    'Silové premiestnenie z podlahy v jednotlivých opakovaniach a dvojopakovaniach, pričom príjem zostáva vysoko.',
    'Záťaž pridaj až vtedy, keď činka zostáva na deltových svaloch. Tlak s dopomocou nôh pridaj až potom, ak ho program vyžaduje, a zaznamenávaj ho samostatne.',
  ],
  programming:
    'Ide o silový cvik: 3–6 sérií po 1–3 opakovania, s úplným oddychom. Tri minúty sú bežná dĺžka oddychu. Tieto čísla nepoužívaj pri odhadovanom 1RM klasického mŕtveho ťahu. Nezaznamenávaj ich ako tlak s dopomocou nôh ani ako striktný tlak nad hlavou, pretože si sa s činkou na ramenách iba postavil. Ak vykonáš drep s premiestnením, poznač si to. Ak činku vytlačíš, presuň sériu k premiestneniu s tlakom alebo k thrusteru s veľkou činkou.',
  equipmentAlternatives: [
    {
      slug: 'kettlebell-swing',
      name: 'Švih s kettlebellom',
      note: 'Výbušné otvorenie bokov bez príjmu činky, keď dnes netrénuješ práve zručnosť premiestnenia.',
    },
    {
      slug: 'barbell-clean-and-press',
      name: 'Premiestnenie a tlak s veľkou činkou',
      note: 'Použi, keď má byť po príjme činka vytlačená nad hlavu.',
    },
    {
      slug: 'barbell-push-press',
      name: 'Tlak s veľkou činkou s dopomocou nôh',
      note: 'Trénuj pohon z predného držania nad hlavu, ak je premiestnenie stabilné a slabinou je tlak.',
    },
  ],
  faqs: [
    {
      question: 'Môžem to zaznamenať ako mŕtvy ťah, keď cvik začína na podlahe?',
      answer:
        'Nie. Silové premiestnenie je olympijský vzpieračský cvik s príjmom činky na ramená, nie klasický mŕtvy ťah. Nezaraďuj ho do grafu mŕtveho ťahu a úplný drep s premiestnením nepovažuj za tento rekord, ak si ho neoznačil. Ak po príjme činku vytlačíš, séria patrí k premiestneniu s tlakom.',
    },
  ],
  relatedSlugs: [
    'conventional-deadlift',
    'barbell-push-press',
    'standing-barbell-overhead-press',
    'barbell-clean-and-press',
  ],
} satisfies ExerciseOverlay
