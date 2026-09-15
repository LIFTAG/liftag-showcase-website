import type { ExploreGym } from '../types/discovery'
import { weekdayIndex } from './discoveryData.ts'

export type GymTodayStatus = { kind: 'openUntil'; time: string } | { kind: 'opensAt'; time: string }

function minutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const total = Number(match[1]) * 60 + Number(match[2])
  return total <= 24 * 60 ? total : null
}

function localClock(now: Date, timeZone: string | null | undefined): { day: number; current: number } | null {
  if (!timeZone) return null
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .formatToParts(now)
        .map((part) => [part.type, part.value]),
    )
    const day = weekdayIndex(parts.weekday)
    const current = minutes(`${parts.hour}:${parts.minute}`)
    if (day === null || current === null) return null
    return { day, current }
  } catch {
    return null
  }
}

/**
 * Today's time for a selected gym card: when an open gym closes, or when a
 * closed gym opens later today. The API's `isOpen` stays authoritative; the
 * weekly hours, read in the gym's own timezone, only supply the time. Null
 * when the hours cannot back that status (unknown hours, a missing or invalid
 * zone, a 24-hour day, or no later opening today), so the card falls back to the plain label.
 */
export function gymTodayStatus(
  gym: Pick<ExploreGym, 'hours' | 'timezone' | 'isOpen'>,
  now: Date,
): GymTodayStatus | null {
  if (gym.isOpen === null || !gym.hours.length) return null
  const clock = localClock(now, gym.timezone)
  if (!clock) return null
  const { day, current } = clock
  const hoursOn = (offset: number) => {
    const entry = gym.hours.find((h) => h.day === (day + offset + 7) % 7)
    if (!entry) return null
    const open = minutes(entry.open)
    const close = minutes(entry.close)
    if (open === null || close === null) return null
    return { entry, open, close }
  }
  const today = hoursOn(0)
  if (!gym.isOpen) {
    return today && current < today.open ? { kind: 'opensAt', time: today.entry.open } : null
  }
  // 00:00–00:00 or 00:00–23:59/24:00 means the gym does not close today.
  if (today && today.open === 0 && (today.close === 0 || today.close >= 24 * 60 - 1)) return null
  if (today && current >= today.open && (today.close <= today.open || current < today.close)) {
    return { kind: 'openUntil', time: today.entry.close }
  }
  // An overnight window from yesterday (e.g. 18:00–02:00) is what keeps the gym open now.
  const yesterday = hoursOn(-1)
  if (yesterday && yesterday.close <= yesterday.open && current < yesterday.close) {
    return { kind: 'openUntil', time: yesterday.entry.close }
  }
  return null
}
