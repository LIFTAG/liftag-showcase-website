import type { Act0Shot } from './act0.ts'
import { clamp01, lerp, smoothstep } from './timeline.ts'

/** A demo-only crop of the establishing shot. The mounted tag and every
 * later shot retain the shared film's original lens and lighting. */
export function splitHeroPresentationAt(
  enabled: boolean,
  assembly: number | null,
  shot: Act0Shot,
  compact: boolean,
) {
  const neutral = { zoom: 1, offsetX: 0, lightGain: 1 }
  if (!enabled || assembly === null || !['floor', 'assemble'].includes(shot)) return neutral
  const amount = 1 - smoothstep(clamp01(assembly / 0.07))
  if (amount === 0) return neutral
  return {
    zoom: lerp(1, compact ? 0.68 : 1.3, amount),
    offsetX: compact ? 0 : -0.15 * amount,
    lightGain: lerp(1, 2.8, amount),
  }
}
