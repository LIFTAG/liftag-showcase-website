/** Vue I18n forms: one | few | many (fractions) | other. */
const slovakPlurals = new Intl.PluralRules('sk')
export function slovakPluralRule(choice: number, choicesLength: number): number {
  const category = slovakPlurals.select(choice)
  if (choicesLength === 2) return category === 'one' ? 0 : 1
  if (choicesLength === 3) return category === 'one' ? 0 : category === 'few' ? 1 : 2
  return { one: 0, few: 1, many: 2, other: 3, zero: 3, two: 1 }[category]
}

/** Widen literal text while preserving the English content's structure. */
export type LocalizedContent<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? LocalizedContent<U>[]
    : T extends object
      ? { [K in keyof T]: LocalizedContent<T[K]> }
      : T
