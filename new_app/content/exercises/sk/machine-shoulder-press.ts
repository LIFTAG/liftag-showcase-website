import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'machine-shoulder-press',
  metaDescription:
    'Tlak na ramená na stroji: výška sedadla, dráha rukovätí a skenovanie správneho štítku, aby sa tlak nad hlavou v LIFTAG-u uložil správne.',
  steps: [
    'Nastav sedadlo tak, aby rukoväte začínali približne vo výške uší až brady. Ak začínajú nad hlavou, už si v hornej polohe.',
    'Hornú časť chrbta opri o podložku a chodidlá polož pevne na podlahu. Uchop rukoväte tak, aby lakte zostali pod zápästiami, nie za strojom.',
    'Vytlač rukoväte do mierneho vystretia lakťov bez krčenia ramien ku krku. Rebrá drž na podložke; odlepenie pri dokončení znamená tlak v stoji vykonaný v sede.',
    'Spúšťaj, kým cítiš natiahnutie ramien, nie náraz záťažového bloku. Pred ďalším opakovaním znovu nastav lopatky.',
  ],
  mistakes: [
    {
      title: 'Sedadlo je tak vysoko, že prvý centimeter je krčenie',
      body: 'Zníž sedadlo. Stroje na tlak nad hlavou skryjú zlé nastavenie lepšie než veľká činka a potom prácu preberie krk.',
    },
    {
      title: 'Zaznamenávanie každého tlakového stroja ako tohto cviku',
      body: 'Tlak na hrudník, šikmý tlak a tlak na ramená sú odlišné identifikátory. Naskenuj štítok na tomto ráme. Ak otvorí tlak na hrudník, upozorni fitko; záznam má zodpovedať stroju.',
    },
    {
      title: 'Odraz záťažového bloku v dolnej polohe',
      body: 'Natiahnutie je súčasť práce. Ak potrebuješ odraz kotúčov, kolík je príliš ťažký alebo je nesprávne nastavené sedadlo.',
    },
    {
      title: 'Striedanie stroja s kotúčmi a stroja s blokom bez poznámky',
      body: 'Nemajú rovnakú páku. Ak ich striedaš, do poznámky série uveď názov stroja, inak bude odhadované 1RM v LIFTAG-u iba šum.',
    },
  ],
  variations: [
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlak veľkej činky nad hlavou v stoji',
      note: 'Variant s voľnou záťažou a rovnakým pohybovým vzorcom.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlak s jednoručkami nad hlavou v sede',
      note: 'Nezávislé rukoväte a dlhší rozsah.',
    },
    { slug: 'landmine-press', name: 'Landmine press', note: 'Keď dráha stroja nesedí tvojim ramenám.' },
    {
      slug: 'machine-chest-press',
      name: 'Tlak na hrudník na stroji',
      note: 'Vodorovný tlak na stroji; nezaznamenávaj ho sem iba preto, že používa záťažový blok.',
    },
  ],
  progressions: [
    'Ľahký záťažový blok, úplný rozsah, bez odrazu a s hlavou opretou o podložku.',
    'Kolík pridaj, keď posledné dve opakovania dokončíš bez odlepenia rebier.',
    'Náročnejšia rukoväť alebo zbiehajúca sa dráha, keď je rovná dráha jednoduchá.',
  ],
  programming:
    'Tlak nad hlavou na stroji poskytuje týždenný objem pre ramená bez potreby dopomoci. Tri až štyri série po 8–12 opakovaní. V partnerskom fitku má QR alebo NFC štítok na tomto ráme otvoriť tento identifikátor. Spoj ho s upažovaním, nie s ťažkým tlakom v stoji v rovnaký deň, ak nemáš skutočne dostatočnú regeneráciu.',
  equipmentAlternatives: [
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlak s jednoručkami nad hlavou v sede',
      note: 'Základná náhrada s voľnou záťažou, keď sa na stroj dlho čaká.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlak veľkej činky nad hlavou v stoji',
      note: 'Použi, keď chceš vyjsť zo stojana a sledovať striktný osobný rekord.',
    },
  ],
  relatedSlugs: [
    'seated-dumbbell-shoulder-press',
    'standing-barbell-overhead-press',
    'landmine-press',
    'machine-chest-press',
    'cable-lateral-raise',
  ],
} satisfies ExerciseOverlay
