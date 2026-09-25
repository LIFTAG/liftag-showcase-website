export interface JournalFaq {
  question: string
  answer: string
}

export interface JournalArticle {
  slug: string
  path: string
  titleHtml: string
  titleText: string
  description: string
  seoTitle: string
  datePublished: string
  category: string
  dateUpdated: string
  body: string
  /** Absolute URLs of the sources an article reviews, mirrored into Article schema. */
  citations?: string[]
  picks?: JournalPick[]
  howTo?: JournalHowTo
  faqs: JournalFaq[]
  ctaPath: string
  ctaLabel: string
  secondaryPath: string
  secondaryLabel: string
}

export interface JournalPick {
  name: string
  blurb: string
  strengths: string[]
  caveats: string[]
}

export interface JournalHowTo {
  name: string
  description: string
  steps: string[]
}

export interface JournalSummary {
  href: string
  eyebrow: string
  title: string
  body: string
}
