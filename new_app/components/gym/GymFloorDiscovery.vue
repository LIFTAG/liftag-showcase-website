<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymFloor'

type MachineId = 'leg-press' | 'flat-bench' | 'cable-station' | 'treadmill'
type ListingTab = 'overview' | 'equipment'

defineProps<{ reduced?: boolean }>()

const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const activeTab = shallowRef<ListingTab>('equipment')
const selectedId = shallowRef<MachineId>('leg-press')
const tabs: readonly ListingTab[] = ['overview', 'equipment']
const benefitKeys = ['equipment', 'discovery', 'guidance'] as const

const machines: ReadonlyArray<{
  id: MachineId
  poster: string
  x: number
  y: number
}> = [
  { id: 'leg-press', poster: '/assets/gym3d/leg-press-poster.webp', x: 29, y: 57 },
  { id: 'cable-station', poster: '/assets/gym3d/equipment/cable-station.webp', x: 43, y: 29 },
  { id: 'treadmill', poster: '/assets/gym3d/equipment/treadmill.webp', x: 78, y: 48 },
  { id: 'flat-bench', poster: '/assets/gym3d/equipment/flat-bench.webp', x: 59, y: 66 },
]

const selectedMachine = computed(() => machines.find((machine) => machine.id === selectedId.value)!)

function selectMachine(id: MachineId) {
  selectedId.value = id
  activeTab.value = 'equipment'
}

function moveTabFocus(event: KeyboardEvent, currentTab: ListingTab) {
  const currentIndex = tabs.indexOf(currentTab)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = tabs.length - 1
  else return

  event.preventDefault()
  activeTab.value = tabs[nextIndex]!
  const tablist = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
  nextTick(() => tablist?.querySelector<HTMLElement>(`#floor-tab-${activeTab.value}`)?.focus())
}
</script>

<template>
  <section id="discover" class="floor-discovery" :class="{ 'is-reduced': reduced }" tabindex="-1" aria-labelledby="floor-discovery-title">
    <div class="floor-discovery__inner">
      <header class="floor-discovery__header">
        <div class="floor-discovery__title-wrap">
          <p class="floor-discovery__eyebrow">{{ t('eyebrow') }}</p>
          <h2 id="floor-discovery-title" class="floor-discovery__title">
            <span>{{ t('headingLead') }}</span>
            <strong>{{ t('headingAccent') }}</strong>
          </h2>
        </div>
        <p class="floor-discovery__intro">{{ t('intro') }}</p>
      </header>

      <div class="floor-discovery__stage">
        <div class="floor-discovery__floor" role="group" :aria-label="t('floorAria')">
          <img
            class="floor-discovery__floor-image"
            src="/assets/gym3d/demo-floor.webp"
            srcset="/assets/gym3d/demo-floor-960.webp 960w, /assets/gym3d/demo-floor.webp 1536w"
            sizes="(max-width: 900px) calc(100vw - 2rem), (max-width: 1600px) 62vw, 930px"
            width="1536"
            height="1024"
            :alt="t('floorAlt')"
            loading="lazy"
          />
          <div class="floor-discovery__shade" aria-hidden="true" />
          <button
            v-for="(machine, index) in machines"
            :key="machine.id"
            class="floor-discovery__hotspot"
            :class="{ 'is-selected': selectedId === machine.id }"
            :style="{ '--hotspot-x': `${machine.x}%`, '--hotspot-y': `${machine.y}%` }"
            type="button"
            :aria-label="t('machineAction', { machine: t(`machines.${machine.id}.name`) })"
            :aria-pressed="selectedId === machine.id"
            @click="selectMachine(machine.id)"
          >
            <span class="floor-discovery__hotspot-dot" aria-hidden="true" />
            <span class="floor-discovery__hotspot-label">
              <small>0{{ index + 1 }}</small>
              {{ t(`machines.${machine.id}.name`) }}
            </span>
          </button>
          <div class="floor-discovery__selection-line" aria-hidden="true">
            <span>{{ t(`machines.${selectedMachine.id}.name`) }}</span>
          </div>
        </div>

        <article class="floor-discovery__phone" :aria-label="t('listing')">
          <div class="floor-discovery__phone-top" aria-hidden="true"><span /></div>
          <div class="floor-discovery__phone-screen">
            <div class="floor-discovery__appbar">
              <b>LIFTAG</b>
            </div>
            <p class="floor-discovery__listing-kicker">{{ t('listing') }}</p>
            <h3>{{ t('gymName') }}</h3>
            <p class="floor-discovery__listing-note">{{ t('listingNote') }}</p>
            <img
              class="floor-discovery__gym-photo"
              src="/assets/screens/gym-detail-560.webp"
              srcset="/assets/screens/gym-detail-360.webp 360w, /assets/screens/gym-detail-560.webp 560w, /assets/screens/gym-detail.webp 800w"
              sizes="(max-width: 900px) 22rem, 19rem"
              width="560"
              height="1217"
              :alt="t('gymPhotoAlt')"
              loading="lazy"
            />

            <div class="floor-discovery__tabs" role="tablist" :aria-label="t('listing')">
              <button
                v-for="tab in tabs"
                :id="`floor-tab-${tab}`"
                :key="tab"
                role="tab"
                type="button"
                :aria-selected="activeTab === tab"
                :aria-controls="`floor-panel-${tab}`"
                :tabindex="activeTab === tab ? 0 : -1"
                @click="activeTab = tab"
                @keydown="moveTabFocus($event, tab)"
              >
                {{ t(`tabs.${tab}`) }}
              </button>
            </div>

            <div
              v-if="activeTab === 'overview'"
              id="floor-panel-overview"
              class="floor-discovery__overview"
              role="tabpanel"
              aria-labelledby="floor-tab-overview"
            >
              <h4>{{ t('overview.title') }}</h4>
              <p>{{ t('overview.copy') }}</p>
              <ul>
                <li v-for="index in 3" :key="index">
                  <span aria-hidden="true">✓</span>{{ t(`overview.cues.${index - 1}`) }}
                </li>
              </ul>
            </div>

            <div
              v-else
              id="floor-panel-equipment"
              class="floor-discovery__equipment"
              role="tabpanel"
              aria-labelledby="floor-tab-equipment"
            >
              <p class="floor-discovery__selected-label">
                <span aria-hidden="true" />{{ t('selected') }}
              </p>
              <div :aria-label="t('equipmentAria')">
                <button
                  v-for="machine in machines"
                  :key="machine.id"
                  class="floor-discovery__equipment-row"
                  :class="{ 'is-selected': selectedId === machine.id }"
                  type="button"
                  :aria-pressed="selectedId === machine.id"
                  @click="selectMachine(machine.id)"
                >
                  <img :src="machine.poster" width="900" height="900" alt="" loading="lazy" />
                  <span>
                    <b>{{ t(`machines.${machine.id}.name`) }}</b>
                    <small>{{ t(`machines.${machine.id}.area`) }}</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <footer class="floor-discovery__rail">
        <div v-for="key in benefitKeys" :key="key" class="floor-discovery__benefit">
          <svg v-if="key === 'equipment'" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8M3 10v4M21 10v4" />
          </svg>
          <svg v-else-if="key === 'discovery'" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
          </svg>
          <svg v-else aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4Z" />
          </svg>
          <p><b>{{ t(`benefits.${key}.title`) }}</b>{{ t(`benefits.${key}.copy`) }}</p>
        </div>
        <a class="floor-discovery__cta" href="#kit">{{ t('cta') }} <span aria-hidden="true">↗</span></a>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.floor-discovery {
  --fd-accent: var(--gx-primary, #ccff00);
  --fd-bg: var(--gx-bg, #040605);
  --fd-fg: var(--gx-fg, #edf1ed);
  --fd-muted: var(--gx-muted, #9ca39e);
  position: relative;
  overflow: clip;
  color: var(--fd-fg);
  background:
    radial-gradient(circle at 50% 46%, rgba(204, 255, 0, 0.055), transparent 36rem),
    var(--fd-bg);
  font-family: var(--gx-font-body, 'Inter', system-ui, sans-serif);
}

.floor-discovery__inner {
  width: min(100% - 2 * var(--gx-page-gutter, 5vw), 90rem);
  margin: 0 auto;
  padding: clamp(5rem, 10vw, 9rem) 0 clamp(4rem, 8vw, 7rem);
}

.floor-discovery__header {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(18rem, 0.8fr);
  align-items: end;
  gap: clamp(2rem, 7vw, 7rem);
  padding-bottom: clamp(2.25rem, 4vw, 4rem);
  border-bottom: 1px solid rgba(237, 241, 237, 0.25);
}

.floor-discovery__eyebrow,
.floor-discovery__listing-kicker,
.floor-discovery__selected-label {
  margin: 0 0 1.15rem;
  color: var(--fd-muted);
  font: 600 0.72rem/1.2 var(--gx-font-mono, 'JetBrains Mono', monospace);
  letter-spacing: 0.24em;
}

.floor-discovery__title {
  max-width: 20ch;
  margin: 0;
  font: 700 clamp(2.5rem, 4.3vw, 3.75rem)/1.04 var(--gx-font-headline, 'Space Grotesk', sans-serif);
  letter-spacing: -0.065em;
}

.floor-discovery__title span,
.floor-discovery__title strong { display: block; }
.floor-discovery__title strong { color: var(--fd-accent); font-weight: 700; }

.floor-discovery__intro {
  max-width: 31ch;
  margin: 0 0 0.25rem;
  color: #d0d5d1;
  font-size: clamp(1.08rem, 1.6vw, 1.38rem);
  line-height: 1.45;
}

.floor-discovery__stage {
  display: grid;
  grid-template-columns: minmax(0, 2.05fr) minmax(17.5rem, 0.72fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 4.5rem);
  padding: clamp(2.5rem, 5vw, 5rem) 0;
}

.floor-discovery__floor {
  position: relative;
  isolation: isolate;
  min-width: 0;
  aspect-ratio: 3 / 2;
}

.floor-discovery__floor::before {
  position: absolute;
  inset: 10% 3% 1%;
  z-index: -1;
  content: '';
  background: rgba(204, 255, 0, 0.08);
  filter: blur(3rem);
}

.floor-discovery__floor-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: saturate(0.82) contrast(1.06);
  mix-blend-mode: lighten;
}

.floor-discovery__shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent 70%, var(--fd-bg) 100%);
}

.floor-discovery__hotspot {
  position: absolute;
  left: var(--hotspot-x);
  top: var(--hotspot-y);
  z-index: 2;
  display: flex;
  min-width: 2.75rem;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0;
  color: var(--fd-fg);
  background: none;
  border: 0;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.floor-discovery__hotspot-dot {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
  background: #d9ded9;
  border: 2px solid var(--fd-bg);
  border-radius: 50%;
  box-shadow: 0 0 0 1px #d9ded9, 0 0 1rem rgba(237, 241, 237, 0.4);
  transition: background-color 180ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.floor-discovery__hotspot-label {
  position: absolute;
  bottom: calc(100% + 0.45rem);
  left: 50%;
  display: flex;
  width: max-content;
  max-width: 10rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 0.62rem;
  color: #edf1ed;
  background: rgba(4, 6, 5, 0.9);
  border: 1px solid rgba(237, 241, 237, 0.42);
  border-radius: 0.35rem;
  font-size: clamp(0.66rem, 0.82vw, 0.82rem);
  line-height: 1.1;
  transform: translateX(-50%);
  white-space: nowrap;
}

.floor-discovery__hotspot-label small { color: var(--fd-muted); font-family: var(--gx-font-mono, monospace); }
.floor-discovery__hotspot.is-selected .floor-discovery__hotspot-dot { background: var(--fd-accent); box-shadow: 0 0 0 1px var(--fd-accent), 0 0 1.35rem rgba(204, 255, 0, 0.72); transform: scale(1.18); }
.floor-discovery__hotspot.is-selected .floor-discovery__hotspot-label { color: var(--fd-accent); border-color: var(--fd-accent); }
.floor-discovery__hotspot:focus-visible { outline: 2px solid var(--fd-accent); outline-offset: 0.35rem; border-radius: 0.4rem; }

.floor-discovery__selection-line {
  position: absolute;
  right: -6.5rem;
  bottom: 14%;
  z-index: 3;
  width: 28%;
  height: 1px;
  color: var(--fd-accent);
  background: currentColor;
  box-shadow: 0 0 0.75rem rgba(204, 255, 0, 0.35);
}

.floor-discovery__selection-line::before,
.floor-discovery__selection-line::after {
  position: absolute;
  top: 50%;
  width: 0.58rem;
  height: 0.58rem;
  content: '';
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 0 0.3rem rgba(204, 255, 0, 0.15);
  transform: translateY(-50%);
}
.floor-discovery__selection-line::before { left: 0; }
.floor-discovery__selection-line::after { right: 0; }
.floor-discovery__selection-line span { position: absolute; right: 0; bottom: 0.65rem; font: 600 0.62rem/1.2 var(--gx-font-mono, monospace); letter-spacing: 0.08em; white-space: nowrap; }

.floor-discovery__phone {
  position: relative;
  z-index: 4;
  width: min(100%, 22rem);
  justify-self: end;
  padding: 0.55rem;
  background: #080a09;
  border: 1px solid rgba(237, 241, 237, 0.5);
  border-radius: 2.6rem;
  box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.62), inset 0 0 0 2px #222724;
}

.floor-discovery__phone-top { position: absolute; top: 0.85rem; left: 50%; z-index: 2; width: 34%; height: 1.25rem; background: #010201; border-radius: 1rem; transform: translateX(-50%); }
.floor-discovery__phone-screen { min-height: 40rem; overflow: hidden; padding: 2.35rem 0.7rem 0.75rem; background: #0c0f0d; border-radius: 2.05rem; }
.floor-discovery__appbar { display: flex; align-items: center; justify-content: space-between; padding: 0 0.45rem 1.45rem; font: 700 0.82rem/1 var(--gx-font-headline, sans-serif); }
.floor-discovery__listing-kicker { margin: 0 0.45rem 0.5rem; color: var(--fd-accent); font-size: 0.55rem; letter-spacing: 0.16em; }
.floor-discovery__phone h3 { margin: 0 0.45rem; font: 700 1.65rem/1 var(--gx-font-headline, sans-serif); letter-spacing: -0.04em; }
.floor-discovery__listing-note { margin: 0.35rem 0.45rem 0.85rem; color: var(--fd-muted); font-size: 0.72rem; }
.floor-discovery__gym-photo { width: 100%; height: 8.2rem; object-fit: cover; object-position: 50% 41%; border: 1px solid rgba(237, 241, 237, 0.1); border-radius: 0.65rem; filter: saturate(0.72) contrast(1.05); }

.floor-discovery__tabs { display: grid; grid-template-columns: 1fr 1fr; margin: 0.7rem 0 0.85rem; border-bottom: 1px solid rgba(237, 241, 237, 0.12); }
.floor-discovery__tabs button { min-height: 2.75rem; color: var(--fd-muted); background: transparent; border: 0; border-bottom: 2px solid transparent; font: 600 0.75rem/1 var(--gx-font-body, sans-serif); cursor: pointer; }
.floor-discovery__tabs button[aria-selected='true'] { color: var(--fd-accent); border-bottom-color: var(--fd-accent); }
.floor-discovery__tabs button:focus-visible,
.floor-discovery__equipment-row:focus-visible,
.floor-discovery__cta:focus-visible { outline: 2px solid var(--fd-accent); outline-offset: 2px; }

.floor-discovery__selected-label { display: flex; align-items: center; gap: 0.45rem; margin: 0.1rem 0.25rem 0.55rem; font-size: 0.52rem; letter-spacing: 0.12em; }
.floor-discovery__selected-label span { width: 0.42rem; height: 0.42rem; background: var(--fd-accent); border-radius: 50%; box-shadow: 0 0 0.55rem rgba(204, 255, 0, 0.7); }
.floor-discovery__equipment-row { display: grid; width: 100%; min-height: 4.25rem; grid-template-columns: 3.4rem 1fr auto; align-items: center; gap: 0.7rem; padding: 0.35rem 0.65rem 0.35rem 0.35rem; color: var(--fd-fg); text-align: left; background: #111512; border: 1px solid transparent; border-radius: 0.6rem; cursor: pointer; }
.floor-discovery__equipment-row + .floor-discovery__equipment-row { margin-top: 0.42rem; }
.floor-discovery__equipment-row img { width: 3.2rem; height: 3.2rem; object-fit: contain; filter: saturate(0.6); }
.floor-discovery__equipment-row span { min-width: 0; }
.floor-discovery__equipment-row b,
.floor-discovery__equipment-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.floor-discovery__equipment-row b { font-size: 0.78rem; font-style: normal; }
.floor-discovery__equipment-row small { margin-top: 0.2rem; color: var(--fd-muted); font-size: 0.62rem; }
.floor-discovery__equipment-row i { color: var(--fd-muted); font-style: normal; }
.floor-discovery__equipment-row.is-selected { background: rgba(204, 255, 0, 0.055); border-color: var(--fd-accent); }
.floor-discovery__equipment-row.is-selected i { color: var(--fd-accent); }

.floor-discovery__overview { padding: 0.35rem 0.35rem 0; }
.floor-discovery__overview h4 { margin: 0 0 0.65rem; font: 650 1.15rem/1.15 var(--gx-font-headline, sans-serif); letter-spacing: -0.025em; }
.floor-discovery__overview > p { margin: 0; color: var(--fd-muted); font-size: 0.75rem; line-height: 1.5; }
.floor-discovery__overview ul { display: grid; gap: 0.55rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.floor-discovery__overview li { display: flex; align-items: center; gap: 0.55rem; font-size: 0.72rem; }
.floor-discovery__overview li span { display: grid; width: 1.25rem; height: 1.25rem; place-items: center; color: #080b08; background: var(--fd-accent); border-radius: 50%; font-size: 0.68rem; font-weight: 800; }

.floor-discovery__rail { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(12rem, 0.75fr); align-items: stretch; border-top: 1px solid rgba(237, 241, 237, 0.27); }
.floor-discovery__benefit { display: flex; min-width: 0; align-items: flex-start; gap: 1rem; padding: 1.5rem clamp(0.75rem, 2vw, 1.7rem) 0 0; }
.floor-discovery__benefit > svg { width: 1.8rem; height: 1.8rem; flex: 0 0 auto; fill: none; stroke: var(--fd-fg); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.floor-discovery__benefit p { margin: 0; color: var(--fd-muted); font-size: 0.78rem; line-height: 1.4; }
.floor-discovery__benefit b { display: block; margin-bottom: 0.25rem; color: var(--fd-fg); font-size: 0.9rem; }
.floor-discovery__cta { display: flex; min-height: 5rem; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; padding: 0 0 0 1.5rem; color: var(--fd-fg); border-left: 1px solid rgba(237, 241, 237, 0.22); border-bottom: 2px solid var(--fd-accent); font-size: 0.82rem; font-weight: 700; text-decoration: none; }
.floor-discovery__cta span { color: var(--fd-accent); font-size: 1.3rem; }

@media (hover: hover) {
  .floor-discovery__hotspot:hover .floor-discovery__hotspot-dot { transform: scale(1.18); }
  .floor-discovery__equipment-row:hover { background: rgba(237, 241, 237, 0.075); }
  .floor-discovery__cta:hover { color: var(--fd-accent); }
}

@media (max-width: 900px) {
  .floor-discovery__header { grid-template-columns: 1fr; gap: 1.4rem; }
  .floor-discovery__stage { grid-template-columns: 1fr; }
  .floor-discovery__floor { width: min(100%, 54rem); margin: 0 auto; }
  .floor-discovery__selection-line { display: none; }
  .floor-discovery__phone { width: min(100%, 24rem); justify-self: center; }
  .floor-discovery__rail { grid-template-columns: repeat(3, 1fr); }
  .floor-discovery__cta { grid-column: 1 / -1; border-left: 0; border-top: 1px solid rgba(237, 241, 237, 0.18); }
}

@media (max-width: 620px) {
  .floor-discovery__inner { width: calc(100% - 2.5rem); }
  .floor-discovery__title { font-size: 2.5rem; }
  .floor-discovery__floor { aspect-ratio: 3 / 2; }
  .floor-discovery__hotspot-label { display: none; }
  .floor-discovery__hotspot-dot { width: 1rem; height: 1rem; }
  .floor-discovery__rail { grid-template-columns: 1fr; }
  .floor-discovery__benefit { padding: 1.1rem 0; border-bottom: 1px solid rgba(237, 241, 237, 0.12); }
  .floor-discovery__cta { grid-column: auto; margin-top: 0; padding-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .floor-discovery__hotspot-dot { transition: none; }
}

.is-reduced .floor-discovery__hotspot-dot { transition: none; }
</style>
