export interface ExerciseOverlayLink {
  slug: string
  name: string
  note: string
}

export interface ExerciseOverlayMistake {
  title: string
  body: string
}

export interface ExerciseOverlay {
  slug: string
  metaDescription?: string
  title?: string
  steps?: string[]
  mistakes?: ExerciseOverlayMistake[]
  variations?: ExerciseOverlayLink[]
  progressions?: string[]
  programming?: string
  equipmentAlternatives?: ExerciseOverlayLink[]
  faqs?: Array<{ question: string, answer: string }>
  relatedSlugs?: string[]
}
