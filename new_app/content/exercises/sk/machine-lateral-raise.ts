import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-lateral-raise',
  metaDescription:
    'Upažovanie na stroji: podložka na lakťoch, bez trhania a samostatné zaznamenávanie práce bočných deltových svalov oproti upažovaniu na kladke.',
  steps: [
    'Nastav sedadlo tak, aby podložky spočívali na vonkajšej strane lakťov alebo na spodnej časti nadlaktí, nie na zápästiach. Zápästia na podložke vytvoria iné a horšie rameno páky.',
    'Seď vzpriamene, rebrá drž stiahnuté a ak sú k dispozícii rukoväte, uchop ich iba zľahka. Začni s rukami mierne od tela, aby záťažový blok už visel vo vzduchu.',
    'Dvíhaj ruky, kým nebudú nadlaktia približne rovnobežné s podlahou. Zastav. Trupom netrhaj a pri dokončení nevyťahuj opačné rameno.',
    'Pod kontrolou spúšťaj, kým podložky stále tlačia na paže. Narazenie záťažového bloku na spodku je oddych, nie opakovanie.',
  ],
  mistakes: [
    {
      title: 'Podložky na predlaktiach alebo zápästiach',
      body: 'Potom zaťažuješ lakťový a akromioklavikulárny kĺb, nie bočný deltový sval. Zníž sedadlo alebo vyber stroj, ktorého podložky skutočne zasiahnu ramennú kosť.',
    },
    {
      title: 'Trhnutie trupom pri každom treťom opakovaní',
      body: 'Ak musíš na pohyb kolíka nakláňať a trhať trupom, záťaž je príliš veľká. Tento cvik nie je na 1RM. Uber kotúč a zvládni čisté upaženie.',
    },
    {
      title: 'Zaznamenávanie variantu na kladke sem',
      body: 'Upažovanie na kladke má vlastný identifikátor a inú krivku odporu. Naskenuj štítok stroja, aby sa cvik uložil správne.',
    },
    {
      title: 'Dvíhanie vyššie, než podložka zostane na ramene',
      body: 'Keď podložka skĺzne smerom k plecu, stratil si rameno páky. Zastav v rovnobežnej polohe a udrž kontakt.',
    },
  ],
  variations: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Viac voľnosti pri výbere dráhy, ale aj viac možností na podvádzanie.',
    },
    {
      slug: 'barbell-upright-row',
      name: 'Príťah veľkej činky k brade',
      note: 'Variant s veľkou činkou, ak ramená takýto vzorec upaženia znášajú.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlak s jednoručkami nad hlavou v sede',
      note: 'Zložený tlakový cvik, za ktorý môžeš upažovanie zaradiť.',
    },
  ],
  progressions: [
    'Prázdny alebo ľahký záťažový blok, pauza v rovnobežnej polohe a podložky pevne na lakťoch.',
    'Kolík pridaj, keď zostáva trup pokojný vo všetkých opakovaniach.',
    'Pomalé spúšťanie, ak ti dôjdu kotúče skôr než technika.',
  ],
  programming:
    'Upažovanie na stroji poskytuje objem pre bočné ramená medzi tlakmi bez riešenia výšky kladky. Tri až štyri série po 10–15 opakovaní. Nežeň sa za strojovým 1RM; LIFTAG záťaž uloží, ale graf slúži na týždenný objem, nie na preteky. Po dni tlakových cvikov ho spoj s face pullmi, ak predná časť ramena dostala zabrať.',
  equipmentAlternatives: [
    {
      slug: 'cable-lateral-raise',
      name: 'Upažovanie na kladke',
      note: 'Bežná náhrada, keď je tento stroj navrhnutý so zápästnými podložkami, ktoré nevieš správne nastaviť.',
    },
  ],
  relatedSlugs: [
    'cable-lateral-raise',
    'shoulder-facepulls',
    'barbell-upright-row',
    'seated-dumbbell-shoulder-press',
  ],
} satisfies ExerciseOverlay
