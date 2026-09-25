<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import { mapListings, mapMachines, type MapListing, type MapMachineId } from '~/utils/gymscan/mapListings';

const props = defineProps<{
  gymId: string;
  city: string;
  listing: MapListing;
  index: number;
  total: number;
  compact: boolean;
}>();
const emit = defineEmits<{
  step: [direction: -1 | 1];
  /** A machine was picked: the tour should stop moving the card under the visitor. */
  engage: [];
  /** Pointer or focus is inside the card, so the tour should wait. */
  hold: [held: boolean];
}>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });

/** Every listing's photo stays mounted, so a swap crossfades instead of waiting on a download. */
const photos = Object.entries(mapListings).map(([id, item]) => ({ id, src: item.photo, focus: item.focus }));
/** Hover or focus previews a machine over the photo; a click keeps it there. */
const hovered = shallowRef<MapMachineId | null>(null);
const pinned = shallowRef<MapMachineId | null>(null);
const pointerIn = shallowRef(false);
const focusIn = shallowRef(false);

const machines = computed(() =>
  props.listing.floor.map((id) => ({ id, poster: mapMachines[id].poster, name: t(mapMachines[id].name) })),
);
const preview = computed(() => {
  const id = hovered.value ?? pinned.value;
  if (!id) return null;
  const machine = mapMachines[id];
  return { id, poster: machine.poster, area: t(`floor.areas.${machine.area}`) };
});
const open = computed(() => {
  const hours = props.listing.hours;
  return hours ? `${t('map.open')} · ${t('map.hours', { from: hours[0], to: hours[1] })}` : t('map.allDay');
});
const stats = computed(() =>
  (['tagged', 'trainers', 'routines'] as const).map((key) => ({ key, label: t(`map.stats.${key}`), value: props.listing[key] })),
);
const counter = computed(() => `${String(props.index + 1).padStart(2, '0')} / ${String(props.total).padStart(2, '0')}`);

watch(() => props.gymId, () => {
  hovered.value = null;
  pinned.value = null;
});
watch(() => pointerIn.value || focusIn.value, (held) => emit('hold', held));

function pin(id: MapMachineId) {
  pinned.value = pinned.value === id ? null : id;
  emit('engage');
}

/** True when focus moved somewhere outside the element that lost it. */
function leaving(event: FocusEvent) {
  return !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null);
}
</script>

<template>
  <article
    class="gmap-card"
    :class="{ 'is-compact': compact }"
    @pointerenter="pointerIn = true"
    @pointerleave="pointerIn = false"
    @focusin="focusIn = true"
    @focusout="focusIn = !leaving($event)"
  >
    <p class="sr-only" aria-live="polite">{{ listing.name }}, {{ city }}</p>
    <div class="gmap-card__photo">
      <img
        v-for="photo in photos"
        :key="photo.id"
        class="gmap-card__gym"
        :class="{ 'is-on': photo.id === gymId }"
        :src="photo.src"
        :style="{ objectPosition: photo.focus }"
        alt=""
        loading="lazy"
      />
      <Transition name="gmap-fade">
        <figure v-if="preview" :key="preview.id" class="gmap-card__machine">
          <img :src="preview.poster" width="480" height="480" alt="" />
          <figcaption>
            <span class="gx-protocol">{{ preview.area }}</span>
            <span class="gx-protocol">{{ t('map.tagged') }}</span>
          </figcaption>
        </figure>
      </Transition>
      <Transition name="gmap-swap" mode="out-in">
        <span v-if="!preview" :key="gymId" class="gmap-card__kind gx-protocol">{{ t(`map.kinds.${listing.kind}`) }}</span>
      </Transition>
    </div>
    <div class="gmap-card__body">
      <div class="gmap-card__top">
        <Transition name="gmap-swap" mode="out-in">
          <p :key="gymId" class="gx-protocol gmap-card__place">{{ city }}</p>
        </Transition>
        <div class="gmap-card__step">
          <button type="button" :aria-label="t('map.previous')" @click="emit('step', -1)">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <span class="gx-protocol" aria-hidden="true">{{ counter }}</span>
          <button type="button" :aria-label="t('map.next')" @click="emit('step', 1)">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
      </div>
      <Transition name="gmap-swap" mode="out-in">
        <div :key="gymId">
          <h3>{{ listing.name }}</h3>
          <p class="gmap-card__open"><span class="gx-dot" />{{ open }}</p>
          <dl class="gmap-card__stats">
            <div v-for="stat in stats" :key="stat.key">
              <dt class="gx-protocol">{{ stat.label }}</dt>
              <dd>{{ stat.value }}</dd>
            </div>
          </dl>
          <p class="gx-protocol gmap-card__label">{{ t('map.equipment') }}</p>
          <ul
            class="gmap-card__machines"
            @pointerleave="hovered = null"
            @focusout="leaving($event) && (hovered = null)"
          >
            <li v-for="machine in machines" :key="machine.id">
              <button
                type="button"
                :class="{ 'is-on': preview?.id === machine.id }"
                :aria-pressed="pinned === machine.id"
                :title="compact ? machine.name : undefined"
                @pointerenter="hovered = machine.id"
                @focus="hovered = machine.id"
                @click="pin(machine.id)"
              >
                <img :src="machine.poster" width="60" height="60" alt="" loading="lazy" />
                <span :class="{ 'sr-only': compact }">{{ machine.name }}</span>
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </article>
</template>
