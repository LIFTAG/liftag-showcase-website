import { en, sk } from '../i18n/messages/catalog.ts'
import type { CatalogLocale } from './catalogLocale'
import { createMessageTranslator } from './messageTranslator'

/** Small adapter for pure SEO and catalog renderers; English owns the key shape. */
export function catalogChrome(locale: CatalogLocale) {
  const { t } = createMessageTranslator(locale, { en, sk })
  const text = Object.fromEntries(Object.keys(en).map((key) => [key, t(key)])) as Record<
    keyof typeof en,
    string
  >
  return {
    ...text,
    machineImageAlt: (name: string) => t('machineImageAlt', { name }),
    trainCatalogCopy: (name: string) => t('trainCatalogCopy', { name }),
    scanTag: (name: string) => t('scanTag', { name }),
    showMore: (remaining: number) => t('showMore', { remaining: remaining.toLocaleString(locale) }),
    statExercises: (count: number) => t('statExercises', { count }),
    statMachines: (count: number) => t('statMachines', { count }),
    statMuscles: (count: number) => t('statMuscles', { count }),
    machineDetailTitle: (name: string) => t('machineDetailTitle', { name }),
    machineExerciseList: (name: string) => t('machineExerciseList', { name }),
    logCopy: (name: string) => t('logCopy', { name }),
    howToHeading: (name: string) => t('howToHeading', { name: name.toLocaleUpperCase(locale) }),
    relatedHeading: (muscle: string) => t('relatedHeading', { muscle: muscle.toLocaleUpperCase(locale) }),
    relatedList: (muscle?: string | null) => (muscle ? t('relatedList', { muscle }) : t('relatedAria')),
    ctaTrack: (name: string) => t('ctaTrack', { name }),
    videoName: (name: string) => t('videoName', { name }),
    videoPreview: (name: string) => t('videoPreview', { name }),
    howToName: (name: string) => t('howToName', { name }),
    machineAlt: (machine: string, exercise: string) => t('machineAlt', { machine, exercise }),
    stepName: (index: number) => t('stepName', { index: index + 1 }),
    alsoTrains: (muscle: string) => t('alsoTrains', { muscle }),
  }
}
export type CatalogChrome = ReturnType<typeof catalogChrome>
