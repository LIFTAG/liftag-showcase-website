import type {
  DiscoveryExercise,
  DiscoveryLocale,
  DiscoveryMedia,
  DiscoveryPage,
  EquipmentItem,
  ExploreGym,
  GymDetail,
  GymMachineDetail,
  GymReview,
  Manufacturer,
  PublicPlan,
  PublicRoutine,
  PublicTrainer,
  SetPrescription,
} from '../types/discovery.ts'
import { safeDiscoveryUrl } from './discovery.ts'

export function discoveryRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const row = value as Record<string, unknown>
  if (row.$type === 'item' && Array.isArray(row.transformerData))
    return discoveryRecord(row.transformerData[0])
  return row
}
const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value : null)
const number = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const strings = (value: unknown): string[] => array(value).filter((v): v is string => typeof v === 'string')
function required(value: unknown): string {
  const result = text(value)
  if (!result) throw new Error('Incomplete discovery response')
  return result
}
function urls(value: unknown): string[] {
  if (typeof value === 'string') {
    try {
      return urls(JSON.parse(value))
    } catch {
      return safeDiscoveryUrl(value) ? [value] : []
    }
  }
  return array(value)
    .map((v) => safeDiscoveryUrl(v))
    .filter((v): v is string => v !== null)
}
function manufacturer(value: unknown): Manufacturer | null {
  const r = discoveryRecord(value)
  return text(r.id) && text(r.name) ? { id: String(r.id), name: String(r.name) } : null
}
function muscles(value: unknown): string[] {
  return array(value)
    .map((v) => text(discoveryRecord(v).slug))
    .filter((v): v is string => v !== null)
}
export function normalizeDiscoveryMedia(media: unknown, photos: unknown): DiscoveryMedia[] {
  const seen = new Set<string>()
  const items: DiscoveryMedia[] = []
  for (const value of array(media)) {
    const r = discoveryRecord(value),
      url = safeDiscoveryUrl(r.url)
    if (url && !seen.has(url)) {
      seen.add(url)
      items.push({
        type: r.type === 'video' ? 'video' : 'image',
        url,
        posterUrl: safeDiscoveryUrl(r.posterUrl),
      })
    }
  }
  for (const url of urls(photos))
    if (!seen.has(url)) {
      seen.add(url)
      items.push({ type: 'image', url, posterUrl: null })
    }
  return items
}
export function normalizeExploreGym(value: unknown): ExploreGym {
  const r = discoveryRecord(value),
    lat = number(r.latitude),
    lng = number(r.longitude)
  if (lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    throw new Error('Invalid gym coordinates')
  const media = normalizeDiscoveryMedia(r.media, r.photos)
  const temporarilyClosed = r.storefrontStatus === 'temporarily_closed'
  return {
    id: required(r.id),
    name: required(r.name),
    lat,
    lng,
    address: text(r.address),
    timezone: text(r.timezone),
    description: text(r.description),
    photo: safeDiscoveryUrl(r.coverPhoto) ?? media.find((m) => m.type === 'image')?.url ?? null,
    rating: number(r.rating),
    reviewCount: number(r.reviewCount),
    isOpen: temporarilyClosed ? false : typeof r.isOpen === 'boolean' ? r.isOpen : null,
    supported: r.isLiftagSupported === true,
    equipmentCount: number(r.equipmentCount),
    media,
    temporarilyClosed,
    closureReason: text(r.closureReason),
    reopensAt: text(r.reopensAt),
    hours: array(r.openingHours)
      .map(discoveryRecord)
      .flatMap((h) => {
        const day = weekdayIndex(h.day)
        return day === null || typeof h.open !== 'string' || typeof h.close !== 'string'
          ? []
          : [{ day, open: h.open, close: h.close }]
      }),
  }
}
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
/** Upstream sends English weekday names; every consumer wants a Monday-first index. */
export function weekdayIndex(value: unknown): number | null {
  const index = typeof value === 'string' ? WEEKDAYS.indexOf(value.trim().toLowerCase()) : -1
  return index === -1 ? null : index
}
export function normalizeEquipment(value: unknown): EquipmentItem {
  const r = discoveryRecord(value)
  return {
    gymMachineId: required(r.gymMachineId),
    qrCodeId: text(r.qrCodeId),
    name: required(r.name),
    photoUrl: safeDiscoveryUrl(r.photoUrl),
    manufacturer: manufacturer(r.manufacturer),
    quantity: number(r.quantity),
    exerciseCount: number(r.exerciseCount),
    matchedExerciseName: text(r.matchedExerciseName),
  }
}
export function normalizeGymDetail(value: unknown, locale: DiscoveryLocale): GymDetail {
  const r = discoveryRecord(value),
    equipment = discoveryRecord(r.equipment)
  const hasEquipment = number(equipment.totalEntries) !== null && Array.isArray(equipment.preview)
  return {
    gym: {
      ...normalizeExploreGym(r.gym),
      description: text(r.description) ?? text(discoveryRecord(r.gym).description),
    },
    locale,
    equipment: hasEquipment
      ? {
          totalEntries: Number(equipment.totalEntries),
          manufacturers: array(equipment.manufacturers)
            .map(manufacturer)
            .filter((m): m is Manufacturer => m !== null),
          preview: array(equipment.preview).map(normalizeEquipment),
        }
      : null,
    trainers: array(r.trainers).map(normalizeTrainer),
  }
}
export function normalizeDiscoveryPage<T>(value: unknown, normalize: (row: unknown) => T): DiscoveryPage<T> {
  const r = discoveryRecord(value),
    m = discoveryRecord(r.metadata)
  if (
    !Array.isArray(r.data) ||
    ![m.total, m.currentPage, m.lastPage, m.perPage].every((v) => number(v) !== null)
  )
    throw new Error('Invalid pagination response')
  return {
    items: r.data.map(normalize),
    meta: {
      total: Number(m.total),
      currentPage: Number(m.currentPage),
      lastPage: Number(m.lastPage),
      perPage: Number(m.perPage),
    },
  }
}
export function normalizeReview(value: unknown): GymReview {
  const r = discoveryRecord(value),
    user = discoveryRecord(r.user)
  return {
    id: required(r.id),
    name: text(user.fullName) ?? text(r.userName) ?? 'LIFTAG',
    avatarUrl: safeDiscoveryUrl(user.avatarUrl ?? r.userAvatarUrl),
    rating: number(r.rating),
    text: text(r.reviewText),
    createdAt: required(r.createdAt),
  }
}
export function normalizeGymMachine(value: unknown, locale: DiscoveryLocale): GymMachineDetail {
  const r = discoveryRecord(value),
    m = discoveryRecord(r.machine),
    gym = discoveryRecord(r.gym)
  return {
    id: required(m.gymMachineId),
    templateId: text(m.machineTemplateId),
    qrCodeId: text(r.qrCodeId),
    locale,
    gym: { id: required(gym.id), name: required(gym.name), timezone: text(gym.timezone) },
    name: required(m.name),
    description: text(m.description),
    manufacturer: manufacturer(m.manufacturer),
    muscles: muscles(m.categories),
    media: [
      ...normalizeDiscoveryMedia([], m.photoUrls),
      ...urls(m.videoUrls).map((url) => ({ type: 'video' as const, url, posterUrl: null })),
    ],
    exercises: array(r.exercises)
      .map(discoveryRecord)
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
      .map((e) => ({
        id: required(e.brandMachineExerciseId ?? e.gymMachineExerciseId ?? e.exerciseTemplateId),
        templateId: text(e.exerciseTemplateId),
        name: required(e.name),
        description: text(e.description),
        instructions: text(e.instructions),
        image: safeDiscoveryUrl(e.imageUrl),
        videos: urls(e.videoUrl),
        muscles: muscles(e.categories),
      })),
  }
}
export function normalizeTrainer(value: unknown): PublicTrainer {
  const r = discoveryRecord(value),
    user = discoveryRecord(r.user),
    details = discoveryRecord(r.details)
  const userId = number(r.userId) ?? number(user.id)
  if (userId === null || !Number.isSafeInteger(userId) || userId < 1) throw new Error('Invalid trainer user')
  const contactFields: [string, string, string?][] = [
    ['phone', 'Phone', 'tel:'],
    ['contactEmail', 'Email', 'mailto:'],
    ['instagramUrl', 'Instagram'],
    ['facebookUrl', 'Facebook'],
    ['tiktokUrl', 'TikTok'],
    ['youtubeUrl', 'YouTube'],
    ['websiteUrl', 'Website'],
  ]
  return {
    id: required(r.id),
    userId,
    name: text(user.fullName) ?? 'LIFTAG',
    avatar: safeDiscoveryUrl(user.avatarUrl),
    bio: text(r.bio),
    experience: number(r.yearsOfExperience),
    online: r.onlineCoaching === true,
    address: text(r.locationAddress),
    specializations: array(r.specializations)
      .map(discoveryRecord)
      .map((s) => text(s.slug))
      .filter((s): s is string => s !== null),
    contacts: contactFields.flatMap(([field, label, prefix]) => {
      const v = text(details[field])
      const href = v ? safeDiscoveryUrl(prefix ? prefix + v : v, true) : null
      return href ? [{ label, href }] : []
    }),
    gyms: array(r.gyms)
      .map(discoveryRecord)
      .map((g) => ({ id: required(g.id), name: required(g.name), address: text(g.address) })),
  }
}
function prescription(value: unknown): SetPrescription {
  const r = discoveryRecord(value),
    result: SetPrescription = {}
  if (text(r.reps) || number(r.reps) !== null) result.reps = String(r.reps)
  for (const key of ['weightKg', 'durationSeconds', 'calories', 'restSeconds', 'rpe'] as const) {
    const n = number(r[key])
    if (n !== null) result[key] = n
  }
  return result
}
export function normalizeRoutine(value: unknown): PublicRoutine {
  const r = discoveryRecord(value)
  const groups = array(r.groups)
    .map(discoveryRecord)
    .map((g) => ({
      id: required(g.id),
      name: text(g.name),
      rounds: number(g.targetRounds),
      rest: number(g.restBetweenRoundsSeconds),
    }))
  return {
    id: required(r.id),
    name: required(r.name),
    description: text(r.description),
    image: safeDiscoveryUrl(r.thumbnailUrl),
    author: text(r.createdByUserName),
    authorAvatar: safeDiscoveryUrl(r.createdByUserAvatarUrl),
    duration: number(r.estimatedDurationMin),
    difficulty: text(r.difficulty),
    muscles: strings(r.targetMuscles),
    rating: number(r.avgRating),
    ratingCount: number(r.ratingCount),
    copyCount: number(r.copyCount),
    groups,
    exercises: array(r.items)
      .map(discoveryRecord)
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
      .map((e) => {
        const template = discoveryRecord(e.exerciseTemplate)
        const videos = e.exerciseVideos !== undefined ? e.exerciseVideos : template.videos
        const exercise: DiscoveryExercise = {
          id: required(e.id),
          templateId: text(e.exerciseTemplateId),
          name: text(e.exerciseName) ?? text(template.name) ?? '',
          description:
            e.exerciseDescription !== undefined ? text(e.exerciseDescription) : text(template.description),
          instructions: text(e.exerciseInstructions) ?? text(template.instructions),
          image: safeDiscoveryUrl(
            e.exerciseImageUrl !== undefined
              ? e.exerciseImageUrl
              : (template.imageUrl ?? template.defaultImageUrl),
          ),
          videos: array(videos)
            .map((v) => safeDiscoveryUrl(discoveryRecord(v).url))
            .filter((v): v is string => v !== null),
          muscles: muscles(template.categories),
        }
        const fallbackCount =
          number(e.targetSets) ?? groups.find((g) => g.id === e.supersetGroupId)?.rounds ?? 0
        const sets =
          Array.isArray(e.setTargets) && e.setTargets.length
            ? e.setTargets.map(prescription)
            : Array.from({ length: Math.max(0, Math.min(100, fallbackCount)) }, () =>
                prescription({
                  ...discoveryRecord(e.targetData),
                  restSeconds: e.restSeconds,
                  rpe: e.targetRpe,
                }),
              )
        return { ...exercise, notes: text(e.notes), groupId: text(e.supersetGroupId), sets }
      }),
  }
}
export function normalizePlan(value: unknown): PublicPlan {
  const r = discoveryRecord(value)
  return {
    id: required(r.id),
    name: required(r.name),
    description: text(r.description),
    image: safeDiscoveryUrl(r.thumbnailUrl),
  }
}
