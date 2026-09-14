const COMMENTARY_RE = /\b(trains the|is a standard|not universally|is useful|typically)\b/i
const INSTRUCTION_START_RE =
  /^(lie|sit|stand|take|lower|press|pull|set|keep|brace|grip|unrack|hold|hinge|drive|row|curl|raise|place|position|start|step|walk|hang|bend|retract|depress|plant|grab|hook|adjust|face|lean|extend|flex|control|pause|touch|lock|descend|ascend|kneel|rack|un-rack)\b/i

import { en, sk } from '../i18n/messages/catalogSeo.ts'
import { createMessageTranslator } from './messageTranslator.ts'
import type { SiteLocale } from '../types/locale.ts'

/** Split catalog copy into sentences without blowing up abbreviations. */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []
  const parts = cleaned.split(/(?<=[.!?])\s+(?=\p{Lu}|[“"„])/u)
  return parts.map((part) => part.trim()).filter(Boolean)
}

/**
 * Turn a catalog description into HowTo steps. Drops commentary sentences
 * ("the bench press trains…") so schema and the visible list stay instructional.
 */
export function descriptionToHowToSteps(description: string | null | undefined): string[] {
  const sentences = splitSentences(description ?? '')
  if (sentences.length === 0) return []

  const instructional = sentences.filter(
    (sentence) => INSTRUCTION_START_RE.test(sentence) && !COMMENTARY_RE.test(sentence),
  )
  if (instructional.length >= 2) return instructional

  const withoutCommentary = sentences.filter((sentence) => !COMMENTARY_RE.test(sentence))
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

interface ExerciseCopyOptions {
  name: string
  overlay?: string | null
  description?: string | null
  isCompound?: boolean | null
  primaryMuscle?: string | null
}
interface MachineCopyOptions {
  name: string
  description?: string | null
  exerciseCount?: number
}
interface ExerciseFaqOptions {
  name: string
  primaryMuscle?: string | null
  secondaryMuscles?: string[]
  machines?: string[]
  loggingLabel?: string | null
}

/** One fixed-locale translator for each consuming page; no shared mutable locale. */
export function catalogSeo(locale: SiteLocale) {
  const { t, n } = createMessageTranslator(locale, { en, sk })
  const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' })
  const kind = (compound: boolean | null | undefined) => {
    const key = movementLabel(compound)
    return key ? t(`movement.${key}`) : null
  }
  return {
    exerciseMetaDescription(opts: ExerciseCopyOptions): string {
      if (opts.overlay) return clipMetaDescription(opts.overlay)
      if (locale === 'sk' && opts.description?.trim()) return clipMetaDescription(opts.description)
      const movement = kind(opts.isCompound)
      const muscle = opts.primaryMuscle?.toLocaleLowerCase(locale)
      const lead =
        movement && muscle
          ? t('exercise.meta.compound', { name: opts.name, kind: movement, muscle })
          : muscle
            ? t('exercise.meta.muscle', { name: opts.name, muscle })
            : t('exercise.meta.library', { name: opts.name })
      return clipMetaDescription(`${lead} ${t('exercise.meta.details')}`)
    },
    exerciseTitle(name: string): string {
      const full = `${name}${t('exercise.title.full')}`
      if (full.length <= 62) return full
      if (locale === 'sk') return `${name}${t('exercise.title.brand')}`
      const short = `${name}${t('exercise.title.short')}`
      return short.length <= 62 ? short : `${name}${t('exercise.title.library')}`
    },
    exerciseImageAlt(opts: ExerciseCopyOptions): string {
      const movement = kind(opts.isCompound)
      const muscle = opts.primaryMuscle?.toLocaleLowerCase(locale)
      if (movement && muscle) return t('exercise.alt.compound', { name: opts.name, muscle, kind: movement })
      if (muscle) return t('exercise.alt.muscle', { name: opts.name, muscle })
      return t('exercise.alt.default', { name: opts.name })
    },
    machineMetaDescription(opts: MachineCopyOptions): string {
      if (opts.description) {
        const description = splitSentences(opts.description)[0] ?? opts.description
        return clipMetaDescription(t('machine.meta.description', { description }))
      }
      const count = opts.exerciseCount ?? 0
      if (count <= 0) return clipMetaDescription(t('machine.meta.empty', { name: opts.name }))
      return clipMetaDescription(
        t('machine.meta.count', count, { named: { name: opts.name, count: n(count) } }),
      )
    },
    defaultExerciseFaqs(opts: ExerciseFaqOptions): Array<{ question: string; answer: string }> {
      const muscles = [opts.primaryMuscle, ...(opts.secondaryMuscles ?? [])].filter(Boolean) as string[]
      const muscleList = muscles.length ? list.format(muscles) : t('faq.muscles.fallback')
      const faqs = [
        {
          question: t('faq.log.question', { name: opts.name }),
          answer: opts.loggingLabel
            ? t('faq.log.answer.label', {
                name: opts.name,
                label: opts.loggingLabel.toLocaleLowerCase(locale),
              })
            : t('faq.log.answer', { name: opts.name }),
        },
        {
          question: t('faq.muscles.question', { name: opts.name }),
          answer: t('faq.muscles.answer', { name: opts.name, muscles: muscleList }),
        },
      ]
      if (opts.machines?.length) {
        faqs.push({
          question: t('faq.machines.question', { name: opts.name }),
          answer: t('faq.machines.answer', {
            name: opts.name,
            machines: list.format(opts.machines.slice(0, 4)),
          }),
        })
      } else {
        faqs.push({
          question: t('faq.noPartner.question', { name: opts.name }),
          answer: t('faq.noPartner.answer', { name: opts.name }),
        })
      }
      return faqs
    },
  }
}
