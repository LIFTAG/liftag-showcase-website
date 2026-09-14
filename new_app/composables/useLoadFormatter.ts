import { formatLoad, type WeightUnit } from '~/utils/oneRepMax'
/** Presentation only: calculator inputs, URL values and arithmetic stay locale-neutral. */
export function useLoadFormatter() {
  const { locale } = useSiteLocale()
  return (kg: number, unit: WeightUnit) => formatLoad(kg, unit, locale.value)
}
