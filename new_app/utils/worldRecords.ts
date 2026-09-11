import type { LiftId } from './oneRepMax.ts'

type RecordSex = 'male' | 'female'

export const WORLD_RECORD_REVIEWED = '2026-09-11'

export interface WorldRecord {
  ratio: number
  liftKg: number
  bodyweightKg: number
  name: string
  year: number
  source: string
  note?: string
}

/** All-time raw competition ceiling, as a bodyweight ratio. 100% on the comparison.
 * Raw only. Equipped, bench-shirt, and Paralympic bench-press lists excluded.
 * Andrzej Stanaszek’s squat is omitted as an anthropometric outlier.
 * Sources checked 2026-09-11.
 */
export const WORLD_RECORDS = {
  bench: {
    male: {
      ratio: 3.53, liftKg: 237.5, bodyweightKg: 67.2, name: 'Roman Eremashvili', year: 2026,
      source: 'https://www.openpowerlifting.org/u/romaneremashvili',
    },
    female: {
      ratio: 2.35, liftKg: 170.5, bodyweightKg: 72.7, name: 'Diana Sergeeva', year: 2026,
      source: 'https://www.openpowerlifting.org/u/dianasergeeva',
    },
  },
  squat: {
    male: {
      ratio: 4.71, liftKg: 320, bodyweightKg: 67.9, name: 'Lorenzo Jordan', year: 2025,
      source: 'https://www.openpowerlifting.org/u/lorenzojordan',
    },
    female: {
      ratio: 3.99, liftKg: 230, bodyweightKg: 57.7, name: 'Marianna Gasparyan', year: 2019,
      source: 'https://www.openpowerlifting.org/u/mariannagasparyan',
    },
  },
  deadlift: {
    male: {
      ratio: 5.16, liftKg: 303, bodyweightKg: 58.7, name: 'Michael Slabic', year: 2026,
      source: 'https://www.openpowerlifting.org/u/michaelslabic',
    },
    female: {
      ratio: 4.53, liftKg: 212.5, bodyweightKg: 46.9, name: 'Heather Connor', year: 2025,
      source: 'https://www.openpowerlifting.org/u/heatherconnor',
    },
  },
  'sumo-deadlift': {
    male: {
      ratio: 5.16, liftKg: 303, bodyweightKg: 58.7, name: 'Michael Slabic', year: 2026,
      source: 'https://www.openpowerlifting.org/u/michaelslabic',
      note: 'Conventional and sumo share the all-time raw deadlift ceiling.',
    },
    female: {
      ratio: 4.53, liftKg: 212.5, bodyweightKg: 46.9, name: 'Heather Connor', year: 2025,
      source: 'https://www.openpowerlifting.org/u/heatherconnor',
      note: 'Conventional and sumo share the all-time raw deadlift ceiling.',
    },
  },
  snatch: {
    male: {
      ratio: 2.54, liftKg: 152.5, bodyweightKg: 60, name: 'Naim Süleymanoğlu', year: 1988,
      source: 'https://en.wikipedia.org/wiki/Naim_Süleymanoğlu',
    },
    female: {
      ratio: 1.92, liftKg: 94, bodyweightKg: 49, name: 'Hou Zhihui', year: 2021,
      source: 'https://en.wikipedia.org/wiki/Hou_Zhihui',
    },
  },
  'clean-and-jerk': {
    male: {
      ratio: 3.17, liftKg: 190, bodyweightKg: 60, name: 'Naim Süleymanoğlu', year: 1988,
      source: 'https://en.wikipedia.org/wiki/Naim_Süleymanoğlu',
    },
    female: {
      ratio: 2.37, liftKg: 116, bodyweightKg: 49, name: 'Hou Zhihui', year: 2021,
      source: 'https://en.wikipedia.org/wiki/Hou_Zhihui',
    },
  },
} as const satisfies Partial<Record<LiftId, Record<RecordSex, WorldRecord>>>

export type WorldRecordLiftId = keyof typeof WORLD_RECORDS

export function worldRecordFor(lift: LiftId, sex: RecordSex | ''): WorldRecord | null {
  if (!sex || !(lift in WORLD_RECORDS)) return null
  return WORLD_RECORDS[lift as WorldRecordLiftId][sex]
}

export function worldRecordRatio(lift: LiftId, sex: RecordSex | ''): number | null {
  return worldRecordFor(lift, sex)?.ratio ?? null
}
