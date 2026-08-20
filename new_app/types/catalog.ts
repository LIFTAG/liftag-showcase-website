/**
 * Wire types for the public LIFTAG catalog API (`/v1/catalog/*` on
 * api.liftag.fit) plus the site's own aggregated search index. Mirrors the
 * API's ExerciseTemplate / MachineTemplate / ExerciseCategory transformers —
 * update alongside liftag-api if those payloads change.
 */

export interface CatalogCategoryRef {
  id: string
  slug: string
  name: string
  sortOrder: number
  i18nKey: string | null
}

export interface CatalogCategory extends CatalogCategoryRef {
  imageUrl: string | null
  isActive: boolean
  isSystem: boolean
}

export interface CatalogVideo {
  locale: string
  url: string
  displayOrder: number
  uploadedByUserId: number | string | null
}

export interface CatalogMachineRef {
  id: string
  slug: string | null
  name: string
  photoUrl: string | null
}

export interface CatalogExercise {
  id: string
  name: string
  description: string | null
  slug: string | null
  imageUrl: string | null
  videos: CatalogVideo[]
  aliases: string | null
  localeName: string | null
  isCompound: boolean | null
  loggingTypes: string[]
  primaryCategory: CatalogCategoryRef | null
  categories: CatalogCategoryRef[]
  /** Only present on the show endpoint (newer API versions). */
  machines?: CatalogMachineRef[]
  /** Catalog ranking score. Additive; older API versions omit it. */
  popularity?: number
  createdAt: string
  updatedAt: string | null
}

export interface CatalogMachine {
  id: string
  name: string
  /** Only present on newer API versions. */
  slug?: string | null
  description: string | null
  photoUrl: string | null
  /** Only present on newer API versions. */
  photoUrls?: string[] | null
  /** Only present on newer API versions. */
  videoUrls?: string[] | null
  category: string | null
  categories: CatalogCategoryRef[]
  /** Only present on the show endpoint (newer API versions). */
  exercises?: CatalogExercise[]
  createdAt: string
  updatedAt: string | null
}

export interface CatalogListMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export interface CatalogListResponse<T> {
  data: T[]
  metadata: CatalogListMeta
}

export interface CatalogItemResponse<T> {
  data: T
}

/* ── Aggregated search index served by /api/catalog/search-index ── */

export interface CatalogIndexExercise {
  id: string
  slug: string
  name: string
  aliases: string | null
  imageUrl: string | null
  primaryCategory: string | null
  categories: string[]
  isCompound: boolean | null
  hasVideo: boolean
  previewVideoUrl: string | null
  popularity: number
}

export interface CatalogIndexMachine {
  id: string
  slug: string | null
  name: string
  photoUrl: string | null
  categories: string[]
}

export interface CatalogIndexCategory {
  slug: string
  name: string
  sortOrder: number
  imageUrl: string | null
}

export interface CatalogIndexPayload {
  exercises: CatalogIndexExercise[]
  machines: CatalogIndexMachine[]
  categories: CatalogIndexCategory[]
  fetchedAt: string
}
