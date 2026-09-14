<script setup lang="ts">
/// <reference types="google.maps" />
import type { Coordinate, DiscoveryLocale, ExploreGym, MapViewport } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
import { loadDiscoveryMaps } from '~/lib/discoveryMaps'
const props = defineProps<{
  gyms: ExploreGym[]
  selectedId: string | null
  viewport: MapViewport
  camera: { point: Coordinate; zoom: number; revision: number }
  locale: DiscoveryLocale
  location: Coordinate | null
}>()
const emit = defineEmits<{ viewport: [value: MapViewport]; select: [gym: ExploreGym] }>()
const container = useTemplateRef<HTMLElement>('container')
const error = shallowRef(false),
  ready = shallowRef(false)
const copy = computed(() => discoveryCopy(props.locale))
let map: google.maps.Map | undefined, Marker: typeof google.maps.marker.AdvancedMarkerElement | undefined
const markers = new Map<
  string,
  {
    marker: google.maps.marker.AdvancedMarkerElement
    element: HTMLElement
    photo: string | null
    dispose: () => void
  }
>()
let locationMarker: google.maps.marker.AdvancedMarkerElement | undefined,
  idle: google.maps.MapsEventListener | undefined,
  disposed = false
let attempt = 0
let deadline: ReturnType<typeof setTimeout> | undefined
function clearMap() {
  idle?.remove()
  for (const entry of markers.values()) {
    entry.dispose()
    entry.marker.map = null
  }
  markers.clear()
  if (locationMarker) locationMarker.map = null
  if (map) google.maps.event.clearInstanceListeners(map)
  map = undefined
}
function updatePhoto(element: HTMLElement, url: string | null) {
  const face = document.createElement('div')
  face.className = 'd-map-pin-face'
  const placeholder = document.createElement('span')
  placeholder.className = 'd-map-pin-placeholder'
  face.append(placeholder)
  if (url) {
    const photo = document.createElement('img')
    photo.src = url
    photo.alt = ''
    photo.addEventListener('error', () => face.replaceChildren(placeholder), { once: true })
    face.replaceChildren(photo)
  }
  element.replaceChildren(face)
}
function syncMarkers() {
  if (!map || !Marker) return
  const ids = new Set(props.gyms.map((g) => g.id))
  for (const [id, entry] of markers)
    if (!ids.has(id)) {
      entry.dispose()
      entry.marker.map = null
      markers.delete(id)
    }
  for (const gym of props.gyms) {
    let entry = markers.get(gym.id)
    if (!entry) {
      const element = document.createElement('div')
      element.className = 'd-map-pin'
      const marker = new Marker({ map, position: gym, title: gym.name, content: element, gmpClickable: true })
      const onClick = () => {
        const current = props.gyms.find((g) => g.id === gym.id)
        if (current) emit('select', current)
      }
      marker.addEventListener('gmp-click', onClick)
      entry = {
        marker,
        element,
        dispose: () => marker.removeEventListener('gmp-click', onClick),
        photo: null,
      }
      updatePhoto(element, gym.photo)
      entry.photo = gym.photo
      markers.set(gym.id, entry)
    }
    if (entry.photo !== gym.photo) {
      updatePhoto(entry.element, gym.photo)
      entry.photo = gym.photo
    }
    entry.marker.position = { lat: gym.lat, lng: gym.lng }
    entry.marker.title = gym.name
    entry.element.classList.toggle('is-selected', gym.id === props.selectedId)
    entry.element.classList.toggle('is-supported', gym.supported)
    entry.marker.zIndex = gym.id === props.selectedId ? 1000 : 1
  }
}
function syncLocation() {
  if (!map || !Marker) return
  if (locationMarker) locationMarker.map = null
  if (!props.location) return
  const dot = document.createElement('div')
  dot.className = 'd-location-dot'
  locationMarker = new Marker({ map, position: props.location, content: dot, zIndex: 2000 })
}
async function initialize() {
  const current = ++attempt
  clearTimeout(deadline)
  clearMap()
  error.value = false
  ready.value = false
  const config = useRuntimeConfig().public
  if (!config.googleMapsApiKey || !config.googleMapsMapId) {
    error.value = true
    return
  }
  deadline = setTimeout(() => {
    if (!disposed && current === attempt) error.value = true
  }, 15000)
  try {
    const [maps, marker] = await loadDiscoveryMaps(String(config.googleMapsApiKey))
    if (disposed || current !== attempt || !container.value) return
    Marker = marker.AdvancedMarkerElement
    map = new maps.Map(container.value, {
      center: props.camera.point,
      zoom: props.camera.zoom,
      mapId: String(config.googleMapsMapId),
      colorScheme: 'DARK' as google.maps.ColorScheme,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
      minZoom: 3,
      maxZoom: 20,
    })
    idle = map.addListener('idle', () => {
      const bounds = map?.getBounds(),
        center = map?.getCenter()
      if (!bounds || !center) return
      emit('viewport', {
        ...bounds.toJSON(),
        lat: center.lat(),
        lng: center.lng(),
        zoom: map?.getZoom() ?? 7,
      })
      ready.value = true
      error.value = false
      clearTimeout(deadline)
    })
    syncMarkers()
    syncLocation()
  } catch {
    clearTimeout(deadline)
    if (!disposed && current === attempt) error.value = true
  }
}
watch(() => [props.gyms, props.selectedId], syncMarkers)
watch(() => props.location, syncLocation)
watch(
  () => props.camera.revision,
  () => {
    if (!map) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) map.setCenter(props.camera.point)
    else map.panTo(props.camera.point)
    map.setZoom(props.camera.zoom)
  },
)
onMounted(initialize)
onBeforeUnmount(() => {
  disposed = true
  attempt++
  clearTimeout(deadline)
  clearMap()
})
</script>
<template>
  <div class="d-map-container">
    <div ref="container" class="d-map-canvas" :aria-label="copy.map" />
    <div v-if="error" class="d-map-unavailable">
      <DiscoveryIcon name="map" :size="40" />
      <p class="d-subtitle">{{ copy.mapError }}</p>
      <p class="d-muted d-small">{{ copy.mapErrorHint }}</p>
      <button class="d-button" @click="initialize">{{ copy.retry }}</button>
    </div>
    <div v-else-if="!ready" class="d-map-unavailable" role="status">
      <DiscoveryIcon name="map" :size="40" />
      <span>{{ copy.loading }}</span>
    </div>
  </div>
</template>
<style scoped>
.d-map-container,
.d-map-canvas {
  position: absolute;
  inset: 0;
  background: #202526;
}
.d-map-unavailable {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 24px 180px;
  text-align: center;
}
.d-map-unavailable > svg {
  color: #798767;
}
.d-map-unavailable p {
  margin: 0;
  max-width: 40ch;
}
@media (min-width: 1024px) {
  .d-map-unavailable {
    padding-bottom: 24px;
  }
}
</style>
<style>
.d-map-pin {
  --pin-size: 42px;
  --pin-pointer: 10px;
  --pin-border: #fff;
  --pin-color: #888;
  position: relative;
  width: var(--pin-size);
  height: calc(var(--pin-size) + var(--pin-pointer) / 2);
}
.d-map-pin-face {
  position: relative;
  z-index: 1;
  width: var(--pin-size);
  height: var(--pin-size);
  display: grid;
  place-items: center;
  background: #1a1a1a;
  border: 2px solid var(--pin-border);
  border-radius: 50%;
  box-shadow: 0 0 4px color-mix(in srgb, var(--pin-color) 35%, transparent);
}
.d-map-pin img,
.d-map-pin-placeholder {
  width: calc(var(--pin-size) - 10px);
  height: calc(var(--pin-size) - 10px);
  object-fit: cover;
  border-radius: 50%;
}
.d-map-pin-placeholder {
  background: var(--pin-color);
  border: 3px solid #0004;
}
.d-map-pin::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 1px;
  width: var(--pin-pointer);
  height: var(--pin-pointer);
  background: var(--pin-border);
  border-bottom-right-radius: 2px;
  transform: translateX(-50%) rotate(45deg);
}
.d-map-pin.is-supported {
  --pin-color: #ccff00;
}
.d-map-pin.is-selected {
  --pin-size: 50px;
  --pin-pointer: 12px;
  --pin-border: #ccff00;
}
.d-map-pin.is-selected .d-map-pin-face {
  border-width: 3px;
  box-shadow: 0 0 8px color-mix(in srgb, var(--pin-color) 80%, transparent);
}
.d-map-pin.is-selected .d-map-pin-placeholder {
  border-color: #fff;
}
.d-location-dot {
  width: 18px;
  height: 18px;
  border: 3px solid #f5f5f3;
  background: #557eee;
  box-shadow: 0 0 0 8px #557eee30;
  border-radius: 50%;
}
</style>
