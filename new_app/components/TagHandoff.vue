<script setup lang="ts">
// The NFC tag is the one object that survives the hero.
//
// HeroDesktop keeps an empty, parallaxed, floating 88px slot where the tag used
// to render ([data-liftag-tag-anchor]); ScanSection keeps an equally empty slot
// beside its lede ([data-liftag-tag-dock]). This layer owns the only NfcTag3D
// instance on the page and flies it between the two, so the hero can keep
// receding under --hero-fade / --hero-lift while the tag itself carries on down
// the page and seats in the scan slot.
//
// Living outside both sections is the point: the hero clips its overflow and
// its grid is a transformed containing block, so a tag rendered inside it can
// neither escape nor stay opaque while the hero fades.
//
// Desktop only, and no tag at all under prefers-reduced-motion, which is what
// HeroDesktop's `loadHero3d` gate already did.

// The hero slot's CSS size. This layer is fixed at that size and only ever
// scales, so a frame never writes a layout property.
const ANCHOR_SIZE = 88

// Detach is driven by the hero slot rather than by a scroll number, so the tag
// lets go of the hero exactly as the hero would have carried it off the top,
// whatever the viewport height: it crosses to the dock column and holds at
// PIN_ROW over the DETACH_SPAN pixels either side of that row.
const PIN_ROW = 0.24
const DETACH_SPAN = 240

// Seating is driven by the dock slot's distance down the viewport: opens as the
// slot clears the fold, closes once it has risen to the upper third.
const SEAT_START = 0.95
const SEAT_END = 0.35

// Release band: the tag lets go as its slot passes under the nav.
const RELEASE_TOP = 48
const RELEASE_SPAN = 180

// Entrance, matched to the hero chips it used to appear alongside.
const ENTER_DELAY_MS = 760
const ENTER_MS = 900

// Long enough for the hero laser to finish all four words. Scrolling arms the
// handoff early, so this only keeps the two off the same frames for a reader
// who stays at the top.
const LASER_SETTLE_MS = 2600

// Slot lookups are cheap but not free. While one is still missing, retry about
// twice a second rather than every frame.
const SLOT_RETRY_FRAMES = 30

const root = ref<HTMLElement | null>(null)
const enabled = ref(false)
const running = ref(false)

const rawMouse = useSharedMouse().latest
useLerpVars(root, rawMouse, 'tag', 0.06, () => running.value)

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t
}

onMounted(() => {
  const desktopMql = window.matchMedia('(min-width: 769px)')
  const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')

  let anchorEl: HTMLElement | null = null
  let dockEl: HTMLElement | null = null
  let anchorNear = false
  let dockNear = false
  let rafId = 0
  let frame = 0
  let armed = false
  let armTimer: ReturnType<typeof setTimeout> | null = null
  let enterStart = 0

  const anchorObserver = new IntersectionObserver(
    ([entry]) => {
      anchorNear = entry?.isIntersecting ?? false
      syncRunning()
    },
    { rootMargin: '600px 0px', threshold: 0 },
  )

  const dockObserver = new IntersectionObserver(
    ([entry]) => {
      dockNear = entry?.isIntersecting ?? false
      syncRunning()
    },
    { rootMargin: '600px 0px', threshold: 0 },
  )

  function resolveSlots() {
    if (!anchorEl?.isConnected) {
      anchorEl = document.querySelector<HTMLElement>('[data-liftag-tag-anchor]')
      if (anchorEl) anchorObserver.observe(anchorEl)
    }
    if (!dockEl?.isConnected) {
      dockEl = document.querySelector<HTMLElement>('[data-liftag-tag-dock]')
      if (dockEl) dockObserver.observe(dockEl)
    }
  }

  function place(now: number) {
    const el = root.value
    if (!el || !anchorEl) return

    const anchor = anchorEl.getBoundingClientRect()
    if (anchor.width === 0) return

    const viewportH = Math.max(window.innerHeight, 1)
    const dock = dockEl?.getBoundingClientRect()
    // A zero-width dock means ScanSection is in its phone layout, where the slot
    // is display:none. With nowhere to fly, the tag simply rides the hero out.
    const hasDock = armed && !!dock && dock.width > 0

    const pinRow = viewportH * PIN_ROW
    const detach = hasDock ? smooth(clamp01((pinRow - anchor.top) / DETACH_SPAN)) : 0
    const seat = hasDock
      ? smooth(clamp01((SEAT_START * viewportH - dock.top) / ((SEAT_START - SEAT_END) * viewportH)))
      : 0

    const dockLeft = hasDock ? dock.left : anchor.left
    const dockTop = hasDock ? dock.top : anchor.top
    const dockSize = hasDock ? dock.width : anchor.width

    // Detach parks the tag in the dock's column at the pin row and takes it
    // halfway down to the dock's size; seating covers the rest.
    const x = lerp(lerp(anchor.left, dockLeft, detach), dockLeft, seat)
    const y = lerp(lerp(anchor.top, pinRow, detach), dockTop, seat)
    const size = lerp(lerp(anchor.width, dockSize, detach * 0.5), dockSize, seat)

    if (enterStart === 0) enterStart = now
    const enter = smooth(clamp01((now - enterStart - ENTER_DELAY_MS) / ENTER_MS))
    const release = hasDock ? clamp01((dock.top - RELEASE_TOP) / RELEASE_SPAN) : 1

    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      + ` scale(${(size / ANCHOR_SIZE).toFixed(4)})`
    el.style.opacity = (release * enter).toFixed(3)
    el.style.setProperty('--tag-seat', clamp01((seat - 0.75) / 0.25).toFixed(3))
    el.style.setProperty('--tag-settle', (1 - detach).toFixed(3))
  }

  function tick(now: number) {
    if (!running.value) {
      rafId = 0
      return
    }
    frame += 1
    if (!dockEl?.isConnected && frame % SLOT_RETRY_FRAMES === 0) resolveSlots()
    place(now)
    rafId = requestAnimationFrame(tick)
  }

  function syncRunning() {
    const next = enabled.value && (anchorNear || dockNear)
    if (next === running.value) return
    running.value = next
    if (next && rafId === 0) rafId = requestAnimationFrame(tick)
  }

  function arm() {
    if (armed) return
    armed = true
    resolveSlots()
  }

  function onMediaChange() {
    enabled.value = desktopMql.matches && !motionMql.matches
    resolveSlots()
    syncRunning()
  }

  onMediaChange()

  armTimer = setTimeout(() => {
    armTimer = null
    arm()
  }, LASER_SETTLE_MS)

  window.addEventListener('scroll', arm, { passive: true, once: true })
  desktopMql.addEventListener('change', onMediaChange)
  motionMql.addEventListener('change', onMediaChange)

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    if (armTimer) clearTimeout(armTimer)
    rafId = 0
    armTimer = null
    anchorObserver.disconnect()
    dockObserver.disconnect()
    window.removeEventListener('scroll', arm)
    desktopMql.removeEventListener('change', onMediaChange)
    motionMql.removeEventListener('change', onMediaChange)
  })
})
</script>

<template>
  <div
    v-if="enabled"
    ref="root"
    class="tag-handoff"
    aria-hidden="true"
  >
    <span class="tag-handoff-seat" />
    <div class="tag-handoff-perspective">
      <div class="tag-handoff-tilt">
        <NfcTag3D />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-handoff {
  --tag-mx: 0;
  --tag-my: 0;
  --tag-seat: 0;
  --tag-settle: 1;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 55;
  width: 88px;
  height: 88px;
  /* Zero until the first frame has measured the hero slot, so the tag never
     paints once at the viewport origin. */
  opacity: 0;
  pointer-events: none;
  transform-origin: 0 0;
  will-change: transform;
}

.tag-handoff-perspective {
  width: 100%;
  height: 100%;
  perspective: 1200px;
}

.tag-handoff-tilt {
  width: 100%;
  height: 100%;
  transform:
    rotateX(calc(var(--tag-my) * var(--tag-settle) * 0.8deg))
    rotateY(calc(var(--tag-mx) * var(--tag-settle) * 0.8deg))
    rotateZ(calc(var(--tag-mx) * var(--tag-settle) * 0.35deg));
  transform-style: preserve-3d;
}

/* The machined slot the tag seats into at ScanSection: four corner brackets,
   drawn only once the tag is actually inside them. */
.tag-handoff-seat {
  position: absolute;
  inset: -13px;
  opacity: var(--tag-seat);
  background:
    linear-gradient(var(--liftag-primary) 0 0) left top / 1px 13px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) left top / 13px 1px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) right top / 1px 13px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) right top / 13px 1px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) left bottom / 1px 13px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) left bottom / 13px 1px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) right bottom / 1px 13px no-repeat,
    linear-gradient(var(--liftag-primary) 0 0) right bottom / 13px 1px no-repeat;
  filter: drop-shadow(0 0 6px rgba(204, 255, 0, 0.35));
}
</style>
