const COMMENTARY_RE = /\b(trains the|is a standard|not universally|is useful|typically)\b/i
const INSTRUCTION_START_RE = /^(lie|sit|stand|take|lower|press|pull|set|keep|brace|grip|unrack|hold|hinge|drive|row|curl|raise|place|position|start|step|walk|hang|bend|retract|depress|plant|grab|hook|adjust|face|lean|extend|flex|control|pause|touch|lock|descend|ascend|kneel|rack|un-rack)\b/i

/** Split catalog copy into sentences without blowing up abbreviations. */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []
  const parts = cleaned.split(/(?<=[.!?])\s+(?=\p{Lu}|[“"„])/u)
  return parts.map(part => part.trim()).filter(Boolean)
}

/**
 * Turn a catalog description into HowTo steps. Drops commentary sentences
 * ("the bench press trains…") so schema and the visible list stay instructional.
 */
export function descriptionToHowToSteps(description: string | null | undefined): string[] {
  const sentences = splitSentences(description ?? '')
  if (sentences.length === 0) return []

  const instructional = sentences.filter(sentence => INSTRUCTION_START_RE.test(sentence) && !COMMENTARY_RE.test(sentence))
  if (instructional.length >= 2) return instructional

  const withoutCommentary = sentences.filter(sentence => !COMMENTARY_RE.test(sentence))
  if (withoutCommentary.length >= 2) return withoutCommentary

  return sentences
}

export function movementLabel(isCompound: boolean | null | undefined): string | null {
  if (isCompound === true) return 'compound'
  if (isCompound === false) return 'isolation'
  return null
}

export function clipMetaDescription(text: string, max = 158): string {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  const sliced = compact.slice(0, max - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  const cut = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced
  return `${cut.replace(/[.,;:–-]+$/, '')}…`
}

export function exerciseMetaDescription(opts: {
  name: string
  overlay?: string | null
  description?: string | null
  isCompound?: boolean | null
  primaryMuscle?: string | null
}): string {
  if (opts.overlay) return clipMetaDescription(opts.overlay)
  const kind = movementLabel(opts.isCompound)
  const muscle = opts.primaryMuscle?.toLowerCase()
  const lead = kind && muscle
    ? `${opts.name} is a ${kind} ${muscle} lift.`
    : muscle
      ? `${opts.name} is a ${muscle} exercise.`
      : `${opts.name} from the LIFTAG exercise library.`
  return clipMetaDescription(
    `${lead} Setup, muscles worked, machines, and how to log every set in the LIFTAG workout tracker.`,
  )
}

export function exerciseTitle(name: string): string {
  const suffix = ' | How to, Muscles, Log | LIFTAG'
  const full = `${name}${suffix}`
  if (full.length <= 62) return full
  const short = `${name} | Muscles Worked & How to Log | LIFTAG`
  if (short.length <= 62) return short
  return `${name} | LIFTAG Exercise Library`
}

export function exerciseTitleSk(name: string): string {
  const suffix = ' | Ako cvičiť | LIFTAG'
  const full = `${name}${suffix}`
  if (full.length <= 62) return full
  return `${name} | LIFTAG`
}

export function exerciseMetaDescriptionSk(opts: {
  name: string
  description?: string | null
  isCompound?: boolean | null
  primaryMuscle?: string | null
}): string {
  if (opts.description?.trim()) return clipMetaDescription(opts.description)
  const kind = opts.isCompound === true
    ? 'komplexný'
    : opts.isCompound === false ? 'izolačný' : null
  const muscle = opts.primaryMuscle?.toLowerCase()
  const lead = kind && muscle
    ? `${opts.name} je ${kind} cvik na ${muscle}.`
    : muscle
      ? `${opts.name} je cvik na ${muscle}.`
      : `${opts.name} z knižnice cvikov LIFTAG.`
  return clipMetaDescription(
    `${lead} Nastavenie, zapojené svaly, stroje a ako zalogovať každú sériu v aplikácii LIFTAG.`,
  )
}

export function exerciseImageAltSk(opts: {
  name: string
  primaryMuscle?: string | null
  isCompound?: boolean | null
}): string {
  const kind = opts.isCompound === true
    ? 'komplexný'
    : opts.isCompound === false ? 'izolačný' : null
  const muscle = opts.primaryMuscle
  if (kind && muscle) return `${opts.name} — ${muscle.toLowerCase()} ${kind} cvik v knižnici LIFTAG`
  if (muscle) return `${opts.name} — cvik na ${muscle.toLowerCase()} v knižnici LIFTAG`
  return `${opts.name} — cvik v knižnici LIFTAG`
}

export function exerciseImageAlt(opts: {
  name: string
  primaryMuscle?: string | null
  isCompound?: boolean | null
}): string {
  const kind = movementLabel(opts.isCompound)
  const muscle = opts.primaryMuscle
  if (kind && muscle) return `${opts.name} — ${muscle.toLowerCase()} ${kind} exercise in the LIFTAG library`
  if (muscle) return `${opts.name} — ${muscle.toLowerCase()} exercise in the LIFTAG library`
  return `${opts.name} exercise in the LIFTAG library`
}

export function machineMetaDescription(opts: {
  name: string
  description?: string | null
  exerciseCount?: number
}): string {
  if (opts.description) {
    const first = splitSentences(opts.description)[0] ?? opts.description
    return clipMetaDescription(
      `${first} Exercises, setup photos, and how to open this machine in LIFTAG by scanning its QR or NFC tag.`,
    )
  }
  const count = opts.exerciseCount
  const countBit = count && count > 0 ? ` ${count} exercises,` : ''
  return clipMetaDescription(
    `${opts.name}:${countBit} setup photos, and how to open this machine in LIFTAG by scanning its QR or NFC tag.`,
  )
}

export function defaultExerciseFaqs(opts: {
  name: string
  primaryMuscle?: string | null
  secondaryMuscles?: string[]
  machines?: string[]
  loggingLabel?: string | null
}): Array<{ question: string, answer: string }> {
  const muscles = [opts.primaryMuscle, ...(opts.secondaryMuscles ?? [])].filter(Boolean) as string[]
  const muscleList = muscles.length
    ? muscles.join(', ').replace(/, ([^,]*)$/, ' and $1')
    : 'the muscles listed on this page'
  const faqs = [
    {
      question: `How do I log ${opts.name} in LIFTAG?`,
      answer: opts.loggingLabel
        ? `Open ${opts.name} in LIFTAG, or tap the NFC tag / scan the QR code on the machine at a partner gym. Log each working set as ${opts.loggingLabel.toLowerCase()}. The rest timer starts after you save the set, and PRs plus estimated 1RM update automatically.`
        : `Open ${opts.name} in LIFTAG, or tap the NFC tag / scan the QR code on the machine at a partner gym. Log each working set, run the rest timer, and keep the progression on this lift in one place.`,
    },
    {
      question: `What muscles does ${opts.name} work?`,
      answer: `${opts.name} primarily trains ${muscleList}. LIFTAG tags each set to those muscle groups so weekly volume and body-part splits stay honest.`,
    },
  ]
  if (opts.machines && opts.machines.length > 0) {
    const machineList = opts.machines.slice(0, 4).join(', ').replace(/, ([^,]*)$/, ' and $1')
    faqs.push({
      question: `Which gym machines can I use for ${opts.name}?`,
      answer: `${opts.name} is mapped to ${machineList} in the LIFTAG catalog. At a partner gym the tag on those machines opens this exercise with setup notes ready to log.`,
    })
  }
  else {
    faqs.push({
      question: `Do I need a partner gym to track ${opts.name}?`,
      answer: `No. LIFTAG logs ${opts.name} at any gym from the exercise library. NFC and QR tags are an accelerator at partner gyms, not a requirement.`,
    })
  }
  return faqs
}

function joinListSk(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  return `${items.slice(0, -1).join(', ')} a ${items[items.length - 1]}`
}

/** Slovak templates of defaultExerciseFaqs. SK pages must not emit the English FAQs. */
export function defaultExerciseFaqsSk(opts: {
  name: string
  primaryMuscle?: string | null
  secondaryMuscles?: string[]
  machines?: string[]
  loggingLabel?: string | null
}): Array<{ question: string, answer: string }> {
  const muscles = [opts.primaryMuscle, ...(opts.secondaryMuscles ?? [])].filter(Boolean) as string[]
  const muscleList = muscles.length ? joinListSk(muscles) : 'svaly uvedené na tejto stránke'
  const faqs = [
    {
      question: `Ako zalogujem ${opts.name} v LIFTAG-u?`,
      answer: opts.loggingLabel
        ? `Otvor ${opts.name} v LIFTAG-u, alebo prilož NFC tag / naskenuj QR kód na stroji v partnerskej posilňovni. Každú pracovnú sériu zaloguj ako ${opts.loggingLabel.toLowerCase()}. Časovač odpočinku sa spustí po uložení série a osobné rekordy aj odhad 1RM sa aktualizujú automaticky.`
        : `Otvor ${opts.name} v LIFTAG-u, alebo prilož NFC tag / naskenuj QR kód na stroji v partnerskej posilňovni. Zaloguj každú pracovnú sériu, spusti časovač odpočinku a sleduj progres tohto cviku na jednom mieste.`,
    },
    {
      question: `Aké svaly zapája ${opts.name}?`,
      answer: `${opts.name} primárne trénuje ${muscleList}. LIFTAG priradí každú sériu k týmto svalovým partiám, aby týždenný objem a rozdelenie podľa partií ostali presné.`,
    },
  ]
  if (opts.machines && opts.machines.length > 0) {
    const machineList = joinListSk(opts.machines.slice(0, 4))
    faqs.push({
      question: `Na ktorých strojoch môžem cvičiť ${opts.name}?`,
      answer: `${opts.name} je v katalógu LIFTAG priradený k ${machineList}. V partnerskej posilňovni tag na týchto strojoch otvorí tento cvik s poznámkami k nastaveniu, pripravený na logovanie.`,
    })
  }
  else {
    faqs.push({
      question: `Potrebujem partnerskú posilňovňu, aby som mohol sledovať ${opts.name}?`,
      answer: `Nie. LIFTAG zaloguje ${opts.name} v akejkoľvek posilňovni z knižnice cvikov. NFC a QR tagy v partnerských posilňovniach to len urýchlia, nie sú podmienkou.`,
    })
  }
  return faqs
}
