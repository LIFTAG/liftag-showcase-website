import type { ExploreGym } from '../types/discovery'
import { weekdayIndex } from './discoveryData.ts'

export type GymTodayStatus = { kind: 'openUntil'; time: string } | { kind: 'opensAt'; time: string }

function minutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const total = Number(match[1]) * 60 + Number(match[2])
  return total <= 24 * 60 ? total : null
}

/**
 * Today's time for a selected gym card: when an open gym closes, or when a
 * closed gym opens later today. The API's `isOpen` stays authoritative; the
 * weekly hours, read in the gym's own timezone, only supply the time. Null
 * when the hours cannot back that status (unknown hours, an invalid zone, a
 * 24-hour day, or no later opening today), so the card falls back to the plain label.
 */
export function gymTodayStatus(
  gym: Pick<ExploreGym, 'hours' | 'timezone' | 'isOpen'>,
  now: Date,
): GymTodayStatus | null {
  if (gym.isOpen === null || !gym.hours.length) return null
  let day: number | null, current: number | null
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: gym.timezone ?? undefined,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .formatToParts(now)
        .map((part) => [part.type, part.value]),
    )
    day = weekdayIndex(parts.weekday)
    current = minutes(`${parts.hour}:${parts.minute}`)
  } catch {
    return null
  }
  if (day === null || current === null) return null
  const hoursOn = (offset: number) => {
    const entry = gym.hours.find((h) => h.day === (day + offset + 7) % 7)
    const open = entry ? minutes(entry.open) : null,
      close = entry ? minutes(entry.close) : null
    return entry && open !== null && close !== null ? { entry, open, close } : null
  }
  const today = hoursOn(0)
  if (gym.isOpen) {
    if (today && today.open === 0 && (today.close === 0 || today.close >= 24 * 60 - 1)) return null
    if (today && current >= today.open && (today.close <= today.open || current < today.close))
      return { kind: 'openUntil', time: today.entry.close }
    // An overnight window from yesterday (e.g. 18:00–02:00) is what keeps the gym open now.
    const yesterday = hoursOn(-1)
    if (yesterday && yesterday.close <= yesterday.open && current < yesterday.close)
      return { kind: 'openUntil', time: yesterday.entry.close }
    return null
  }
  return today && current < today.open ? { kind: 'opensAt', time: today.entry.open } : null
}
