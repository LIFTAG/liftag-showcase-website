import type { CatalogVideo } from './catalog'
import type { SiteLocale } from './locale.ts'

export type DiscoveryLocale = SiteLocale
export interface Coordinate {
  lat: number
  lng: number
}
export interface MapViewport extends Coordinate {
  zoom: number
  north: number
  south: number
  east: number
  west: number
}
export interface DiscoveryFilters {
  distance: number | null
  rating: number | null
  open: boolean
  supported: boolean
  manufacturers: string[]
}
export interface Manufacturer {
  id: string
  name: string
}
export interface DiscoveryMedia {
  type: 'image' | 'video'
  url: string
  posterUrl: string | null
}
export interface GymHours {
  /** Monday-first weekday index, 0-6. */
  day: number
  open: string
  close: string
}
export interface ExploreGym extends Coordinate {
  id: string
  name: string
  address: string | null
  timezone: string | null
  description: string | null
  photo: string | null
  rating: number | null
  reviewCount: number | null
  isOpen: boolean | null
  supported: boolean
  equipmentCount: number | null
  hours: GymHours[]
  media: DiscoveryMedia[]
  temporarilyClosed: boolean
  closureReason: string | null
  reopensAt: string | null
}
export interface EquipmentItem {
  gymMachineId: string
  qrCodeId: string | null
  name: string
  photoUrl: string | null
  manufacturer: Manufacturer | null
  quantity: number | null
  exerciseCount: number | null
  matchedExerciseName: string | null
}
export interface EquipmentSummary {
  totalEntries: number
  manufacturers: Manufacturer[]
  preview: EquipmentItem[]
}
export interface GymDetail {
  gym: ExploreGym
  equipment: EquipmentSummary | null
  trainers: PublicTrainer[]
  locale: DiscoveryLocale
}
export interface PageMeta {
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}
export interface DiscoveryPage<T> {
  items: T[]
  meta: PageMeta
}
export interface GymMapResult {
  items: ExploreGym[]
  meta: { limit: number; count: number; truncated: boolean; tooLarge: boolean }
}
export interface GymReview {
  id: string
  name: string
  avatarUrl: string | null
  rating: number | null
  text: string | null
  createdAt: string
}
export interface DiscoveryExercise {
  id: string
  templateId: string | null
  name: string
  description: string | null
  instructions: string | null
  image: string | null
  videos: CatalogVideo[]
  muscles: string[]
}
export interface GymMachineDetail {
  id: string
  templateId: string | null
  qrCodeId: string | null
  gym: { id: string; name: string; timezone: string | null }
  name: string
  description: string | null
  manufacturer: Manufacturer | null
  media: DiscoveryMedia[]
  exercises: DiscoveryExercise[]
  muscles: string[]
  locale: DiscoveryLocale
}
export interface PublicTrainer {
  id: string
  userId: number
  name: string
  avatar: string | null
  bio: string | null
  experience: number | null
  online: boolean
  address: string | null
  specializations: string[]
  contacts: { label: string; href: string }[]
  gyms: { id: string; name: string; address: string | null }[]
}
export interface SetPrescription {
  reps?: string
  weightKg?: number
  durationSeconds?: number
  calories?: number
  restSeconds?: number
  rpe?: number
}
export interface RoutineExercise extends DiscoveryExercise {
  groupId: string | null
  notes: string | null
  sets: SetPrescription[]
}
export interface PublicRoutine {
  id: string
  name: string
  description: string | null
  image: string | null
  author: string | null
  authorAvatar: string | null
  duration: number | null
  difficulty: string | null
  muscles: string[]
  rating: number | null
  ratingCount: number | null
  copyCount: number | null
  exercises: RoutineExercise[]
  groups: { id: string; name: string | null; rounds: number | null; rest: number | null }[]
}
export interface PublicPlan {
  id: string
  name: string
  description: string | null
  image: string | null
}
