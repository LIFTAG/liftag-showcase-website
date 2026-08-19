export const GYM_QR_COMPARISON_PATH = '/best-gym-qr-nfc-app'
export const GYM_QR_COMPARISON_UPDATED = '2026-08-19'

export const gymQrPlatforms = ['LIFTAG', 'Liftd', 'ScanLiftLog', 'RepTag'] as const
export type GymQrPlatform = typeof gymQrPlatforms[number]

export type GymQrTableVariant = 'full' | 'gym' | 'tags'
export type GymQrCellMark = 'only' | 'best' | 'theirs'

export interface GymQrMatrixCell {
  text: string
  mark?: GymQrCellMark
}

export interface GymQrMatrixRow {
  id: string
  aspect: string
  variants: GymQrTableVariant[]
  cells: Record<GymQrPlatform, GymQrMatrixCell>
}

export interface GymQrGlanceRow {
  name: GymQrPlatform
  bestFor: string
  gymCost: string
  weakSpot: string
  unique: string
}

export interface GymQrCard {
  name: GymQrPlatform
  href: string
  oneLine: string
  goodAt: string[]
  notGoodAt: string[]
  pickWhen: string
}

export const gymQrSources = [
  { label: 'Liftd pricing', href: 'https://www.liftd.ai/pricing' },
  { label: 'Liftd gym-owner FAQ', href: 'https://www.liftd.ai/faq/gym-owners' },
  { label: 'ScanLiftLog', href: 'https://scanliftlog.com/' },
  { label: 'RepTag pricing', href: 'https://reptag.app/preise' },
  { label: 'RepTag platform', href: 'https://reptag.app/' },
] as const

export const gymQrGlanceRows: GymQrGlanceRow[] = [
  {
    name: 'LIFTAG',
    bestFor: 'Gyms that want tags and tracking without a monthly platform bill',
    gymCost: 'Free core forever. Tags shipped free. Advanced tools optional.',
    weakSpot: 'Owner-side churn analytics are still basic next to Liftd',
    unique: 'The only platform here that ships NFC + QR tags and keeps core gym tools free',
  },
  {
    name: 'Liftd',
    bestFor: 'Gyms buying equipment-level retention and utilization intelligence',
    gymCost: '$39 to $239/mo by machine count. Enterprise above 200 machines.',
    weakSpot: 'Gyms print or supply tags. Paid from the first month after trial.',
    unique: 'Deepest utilization, silent-churn, and re-engagement analytics',
  },
  {
    name: 'ScanLiftLog',
    bestFor: 'Gyms that want members to scan with no app and no account',
    gymCost: '$30 to $150/mo by machine count, plus a $99 setup fee (waivable).',
    weakSpot: 'QR only. Tracking stays machine-anchored, not a full serious-lifter log.',
    unique: 'Lowest member friction: browser or home-screen PWA, on-device by default',
  },
  {
    name: 'RepTag',
    bestFor: 'DACH studios that want trainer tools, community, and a digital floor plan',
    gymCost: '150 €/mo excl. VAT. Early-adopter discounts during the pilot.',
    weakSpot: 'QR-first paid platform. Still in pilot with selected studios.',
    unique: 'Hybrid web + app with trainer chat, booking, challenges, and studio map',
  },
]

export const gymQrMatrixRows: GymQrMatrixRow[] = [
  {
    id: 'gym-cost',
    aspect: 'Gym cost',
    variants: ['full', 'gym', 'tags'],
    cells: {
      LIFTAG: {
        text: 'Free core forever. Tags, listing, machine setup, and the core dashboard stay free. Advanced business tools are optional.',
        mark: 'only',
      },
      Liftd: {
        text: '$39 / $79 / $143 / $239 per month for 20 / 50 / 100 / 200 machines. Enterprise above that.',
      },
      ScanLiftLog: {
        text: '$30 / $60 / $99 / $150 per month by machine count. One-time $99 setup, waived on a 3-month or longer term.',
      },
      RepTag: {
        text: '150 € per month excl. VAT for the full platform. Monthly cancelable, 30-day money-back. Pilot discounts available.',
      },
    },
  },
  {
    id: 'tags',
    aspect: 'Physical tags',
    variants: ['full', 'gym', 'tags'],
    cells: {
      LIFTAG: {
        text: 'NFC + QR tags shipped to the gym at no cost and tied to the machine catalog.',
        mark: 'only',
      },
      Liftd: {
        text: 'Gym prints QR codes from the dashboard. NFC is supported; the gym supplies those tags.',
      },
      ScanLiftLog: {
        text: 'Branded QR labels generated and shipped after the gym sends an equipment list.',
      },
      RepTag: {
        text: 'QR stickers or magnets are printable or orderable. No NFC kit.',
      },
    },
  },
  {
    id: 'access',
    aspect: 'Access method',
    variants: ['full', 'gym', 'tags'],
    cells: {
      LIFTAG: {
        text: 'NFC + QR as the default kit. Tap for speed, scan as the universal fallback.',
        mark: 'best',
      },
      Liftd: {
        text: 'QR primary. NFC supported as an option.',
      },
      ScanLiftLog: {
        text: 'QR only. Browser or add-to-home-screen PWA.',
      },
      RepTag: {
        text: 'QR only. Browser for basics, optional app for tracking.',
      },
    },
  },
  {
    id: 'videos',
    aspect: 'Trainer videos',
    variants: ['full', 'gym', 'tags'],
    cells: {
      LIFTAG: {
        text: 'Gyms can film their own trainers on their exact machines and attach those videos to the tag.',
        mark: 'best',
      },
      Liftd: {
        text: 'Machine photos and history on that piece of equipment. Not built around gym-filmed coaching videos.',
      },
      ScanLiftLog: {
        text: 'Machine-specific labels and in-experience gym promotional messaging.',
      },
      RepTag: {
        text: 'Exercise videos plus German coaching cues, safety notes, and defect reporting.',
      },
    },
  },
  {
    id: 'map',
    aspect: 'Gym discovery',
    variants: ['full', 'gym'],
    cells: {
      LIFTAG: {
        text: 'Verified listing on the LIFTAG discovery map, included with free core.',
        mark: 'best',
      },
      Liftd: {
        text: 'Strong multi-gym member history and a travel “Gym Passport.” Not a public gym-acquisition map.',
      },
      ScanLiftLog: {
        text: 'Per-location labels. No shared discovery map.',
      },
      RepTag: {
        text: 'Studio map inside the app plus a partner listing on reptag.app, with the paid platform.',
      },
    },
  },
  {
    id: 'tracking',
    aspect: 'Tracking depth',
    variants: ['full', 'gym'],
    cells: {
      LIFTAG: {
        text: 'PRs, estimated 1RM (Epley), volume trends from 4 to 52 weeks, body-part splits, RPE, streaks, routines, and rest timer.',
        mark: 'best',
      },
      Liftd: {
        text: 'Fast machine logging, last-session memory, AI weight suggestions, programs, PRs, and rest timer.',
      },
      ScanLiftLog: {
        text: 'Sets, reps, weight, notes, plus cardio stats. History is anchored to that exact machine. AI Workout Assistant.',
      },
      RepTag: {
        text: 'Set and weight logging under 10 seconds, last-weight memory, PRs, history, and cross-studio progress.',
      },
    },
  },
  {
    id: 'standalone',
    aspect: 'Works without tags',
    variants: ['full'],
    cells: {
      LIFTAG: {
        text: 'Full standalone workout tracker at any gym. Tags accelerate partner floors; they are not required.',
        mark: 'best',
      },
      Liftd: {
        text: 'Full member app. The scan flow depends on a gym that has installed Liftd codes.',
      },
      ScanLiftLog: {
        text: 'Experience is built around that gym’s labels. History lives on the device by default.',
      },
      RepTag: {
        text: 'Free member app works across gyms. Machine scan is the in-studio accelerator.',
      },
    },
  },
  {
    id: 'app',
    aspect: 'App required',
    variants: ['full', 'tags'],
    cells: {
      LIFTAG: {
        text: 'Yes for full logging, history, and progress.',
      },
      Liftd: {
        text: 'Yes. Member app is free.',
      },
      ScanLiftLog: {
        text: 'No. Camera scan opens the browser. Add-to-home-screen is optional.',
        mark: 'theirs',
      },
      RepTag: {
        text: 'Optional. Web covers exercise, video, and defect reports. App unlocks tracking.',
        mark: 'theirs',
      },
    },
  },
  {
    id: 'analytics',
    aspect: 'Gym analytics',
    variants: ['full', 'gym'],
    cells: {
      LIFTAG: {
        text: 'Core dashboard with listing, machines, and usage. Deeper business tools are optional.',
      },
      Liftd: {
        text: 'Deepest in the category: utilization, peak hours, muscle-group coverage, silent churn, and re-engagement.',
        mark: 'theirs',
      },
      ScanLiftLog: {
        text: 'Scans, usage by machine and time, engagement, and “dead” machines.',
      },
      RepTag: {
        text: 'Live scans, top devices, activity, and defect reports.',
      },
    },
  },
  {
    id: 'privacy',
    aspect: 'Privacy model',
    variants: ['full'],
    cells: {
      LIFTAG: {
        text: 'Standard cloud account. Core tracking needs a login.',
      },
      Liftd: {
        text: 'Cloud account. Gyms see aggregate usage; personal detail is opt-in.',
      },
      ScanLiftLog: {
        text: 'On-device by default. No account required. Export and import for a new phone.',
        mark: 'theirs',
      },
      RepTag: {
        text: 'Cloud platform. Servers in Frankfurt.',
      },
    },
  },
  {
    id: 'community',
    aspect: 'Trainer and community tools',
    variants: ['full'],
    cells: {
      LIFTAG: {
        text: 'Trainer profiles, plan sharing, and client progress from real set history. Community feed is not the focus.',
      },
      Liftd: {
        text: 'AI recommendations and owner-side re-engagement. Not a trainer-chat or leaderboard product.',
      },
      ScanLiftLog: {
        text: 'Consistency tracker, badges, and gym promotional messaging inside the scan experience.',
      },
      RepTag: {
        text: 'Trainer chat, booking calendar, printable plans, challenges, leaderboards, news, and polls.',
        mark: 'theirs',
      },
    },
  },
  {
    id: 'setup',
    aspect: 'Setup',
    variants: ['full', 'gym'],
    cells: {
      LIFTAG: {
        text: 'Machine catalog plus free NFC and QR tags shipped to the floor.',
        mark: 'best',
      },
      Liftd: {
        text: 'Add machines from a commercial catalog or by hand, then print QR codes. Claimed under an hour.',
      },
      ScanLiftLog: {
        text: 'Send an equipment list. Labels are generated and shipped.',
      },
      RepTag: {
        text: 'Afternoon setup. QR codes printable or orderable as magnets and stickers.',
      },
    },
  },
]

export const gymQrCards: GymQrCard[] = [
  {
    name: 'LIFTAG',
    href: 'https://liftag.fit/',
    oneLine: 'The only free-core NFC + QR gym platform that also works as a serious standalone tracker.',
    goodAt: [
      'Free core for gyms: tags shipped, listing, machine setup, and the core dashboard',
      'Dual NFC + QR on every machine, not QR with NFC as an afterthought',
      'Gym-filmed trainer videos attached to the exact machine the member is standing at',
      'Serious-lifter metrics: PRs, estimated 1RM, volume trends, body-part splits, RPE, streaks',
      'Verified discovery map so nearby lifters can find the gym',
      'Full workout tracker even when the gym has not installed tags yet',
    ],
    notGoodAt: [
      'Liftd currently goes deeper on silent-churn and utilization analytics',
      'ScanLiftLog and RepTag are easier if members must never install an app',
      'The partner-gym network is still expanding',
    ],
    pickWhen: 'You run a gym and do not want a monthly platform bill just to put tags on the floor, or you train and want a real tracker that gets faster the moment your gym installs LIFTAG.',
  },
  {
    name: 'Liftd',
    href: 'https://www.liftd.ai/',
    oneLine: 'The owner-intelligence pick: scan the machine, then watch who is actually using it.',
    goodAt: [
      'QR plus optional NFC, with a claimed ~3 second log',
      'AI weight suggestions, programs, offline mode, and multi-gym member history',
      'Equipment utilization, peak hours, and silent-churn flags based on real machine use',
      'Public gym pricing starting at $39/mo for 20 machines',
      'Member app is free',
    ],
    notGoodAt: [
      'Every plan after the trial is a monthly gym subscription',
      'Gyms print QR codes and supply their own NFC tags',
      'Scale claims (500+ gyms, 2M+ workouts) are self-reported; the App Store listing launched around May 2026',
    ],
    pickWhen: 'You will pay for owner-side retention analytics and you want utilization and churn data more than a free tag kit.',
  },
  {
    name: 'ScanLiftLog',
    href: 'https://scanliftlog.com/',
    oneLine: 'The zero-app, zero-account scan logger.',
    goodAt: [
      'Camera scan opens a browser or home-screen PWA. No store listing required',
      'On-device history by default, with export and import',
      'Machine-anchored strength and cardio logging',
      'Transparent per-location pricing from $30/mo',
      'Branded QR labels shipped after you send an equipment list',
    ],
    notGoodAt: [
      'QR only. No NFC tap',
      'Not a full progressive-overload tracker (no 1RM, volume trends, or body-part splits as a headline)',
      'Gyms still pay a monthly fee plus a setup charge unless they commit to a longer term',
    ],
    pickWhen: 'Your members will not download an app, or you need on-device storage and no accounts as a hard requirement.',
  },
  {
    name: 'RepTag',
    href: 'https://reptag.app/',
    oneLine: 'The DACH studio platform: QR on the floor, trainer cockpit in the back office.',
    goodAt: [
      'Web fallback for exercise, video, cues, and defect reports with no install',
      'Free member app for set logging, last-weight memory, PRs, and cross-studio history',
      'Trainer chat, booking calendar, printable branded plans, challenges, and leaderboards',
      'Interactive digital floor plan',
      'Studio map and partner listing for member acquisition',
    ],
    notGoodAt: [
      'QR-first. No NFC kit',
      '150 €/mo excl. VAT for the gym, even though members stay free',
      'Currently in pilot with selected studios, strongest in DE / AT / CH',
    ],
    pickWhen: 'You run a German-speaking studio and want community, trainer tools, and a floor plan in one paid platform.',
  },
]

export function gymQrMatrixFor(variant: GymQrTableVariant): GymQrMatrixRow[] {
  return gymQrMatrixRows.filter(row => row.variants.includes(variant))
}
