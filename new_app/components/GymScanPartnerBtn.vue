<script setup lang="ts">
/**
 * Gym-owner door on the 0D hold. Get LIFTAG is foil (the vinyl). This is the
 * hologram: the same triangle read as the floor splash and the machine cage,
 * driven by the pointer.
 */
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, type ComponentPublicInstance } from 'vue'
import { damp } from '../utils/gymscan/timeline.ts'
import {
  PARTNER_DRAW_EPS,
  PARTNER_SPLASH_S,
  buildPartnerMesh,
  createPartnerDraw,
  lightPartnerMesh,
  partnerSplashMaxR,
  partnerSplashR,
  type PartnerHoloDraw,
  type PartnerHoloState,
  type PartnerMesh,
} from '../utils/gymscan/partnerHolo.ts'

const rootEl = useTemplateRef<HTMLElement | ComponentPublicInstance>('rootEl')
const holoEl = useTemplateRef<HTMLCanvasElement>('holoEl')
const holoOn = shallowRef(false)

function hostEl(): HTMLElement | null {
  const v = rootEl.value
  if (!v) return null
  if (v instanceof HTMLElement) return v
  const el = v.$el
  return el instanceof HTMLElement ? el : null
}

let mesh: PartnerMesh | null = null
let heat: Float32Array | null = null
let draw: PartnerHoloDraw | null = null
let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let raf = 0
let lastT = 0
let hovering = false
let focused = false
let reduce = false
let fine = true
let splashT0 = 0
let frozenSplash = 0
let splashFrozen = false
let ptrX = 0
let ptrY = 0
let curX = 0
let curY = 0
let velX = 0
let velY = 0
let originX = 0
let originY = 0
let hoverAmp = 0
let probeAmp = 0
let ro: ResizeObserver | null = null
let unbindMql: (() => void) | null = null

const state: PartnerHoloState = {
  originX: 0,
  originY: 0,
  cursorX: 0,
  cursorY: 0,
  velX: 0,
  velY: 0,
  splashR: 0,
  hover: 0,
  probe: 0,
}

function cssSize(): { w: number, h: number } {
  const el = hostEl()
  if (!el) return { w: 1, h: 1 }
  const r = el.getBoundingClientRect()
  return {
    w: Math.max(1, Math.round(r.width)),
    h: Math.max(1, Math.round(r.height)),
  }
}

function localPoint(e: PointerEvent | FocusEvent): { x: number, y: number } {
  const el = hostEl()
  if (!el) return { x: 0, y: 0 }
  const r = el.getBoundingClientRect()
  if ('clientX' in e) {
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  return { x: r.width * 0.5, y: r.height * 0.5 }
}

function rebuild() {
  const canvas = holoEl.value
  if (!canvas) return
  const { w, h } = cssSize()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const bw = Math.max(1, Math.round(w * dpr))
  const bh = Math.max(1, Math.round(h * dpr))
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  mesh = buildPartnerMesh(w, h)
  heat = new Float32Array(mesh.count)
  draw = createPartnerDraw(mesh.count)
  ctx = canvas.getContext('2d')
}

function arm(x: number, y: number) {
  if (!mesh) rebuild()
  const m = mesh
  if (!m || !heat) return
  originX = x
  originY = y
  ptrX = x
  ptrY = y
  curX = x
  curY = y
  velX = 0
  velY = 0
  splashT0 = performance.now()
  splashFrozen = false
  frozenSplash = 0
  heat.fill(0)
  kick()
}

function kick() {
  if (raf || reduce) return
  lastT = performance.now()
  raf = requestAnimationFrame(frame)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function clearCanvas() {
  const canvas = holoEl.value
  if (!ctx || !canvas) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function frame(now: number) {
  raf = 0
  const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000))
  lastT = now

  const want = hovering || focused
  hoverAmp = damp(hoverAmp, want ? 1 : 0, want ? 0.28 : 0.16, dt)
  probeAmp = damp(probeAmp, hovering ? 1 : 0, hovering ? 0.34 : 0.2, dt)

  const on = hoverAmp > 0.04
  if (on !== holoOn.value) holoOn.value = on

  if (!mesh || !heat || !draw || !ctx || reduce) {
    if (hoverAmp > 0.01 && !reduce) kick()
    else {
      hoverAmp = 0
      clearCanvas()
      if (holoOn.value) holoOn.value = false
    }
    return
  }

  const prevX = curX
  const prevY = curY
  curX = damp(curX, ptrX, 0.42, dt)
  curY = damp(curY, ptrY, 0.42, dt)
  const vx = (curX - prevX) / dt
  const vy = (curY - prevY) / dt
  velX = damp(velX, vx, 0.22, dt)
  velY = damp(velY, vy, 0.22, dt)

  const maxR = partnerSplashMaxR(originX, originY, mesh.w, mesh.h)
  if (splashFrozen) {
    state.splashR = frozenSplash
  }
  else {
    const u = Math.min(1, (now - splashT0) / (PARTNER_SPLASH_S * 1000))
    state.splashR = partnerSplashR(u, maxR)
    if (u >= 1) {
      splashFrozen = true
      frozenSplash = state.splashR
    }
  }

  state.originX = originX
  state.originY = originY
  state.cursorX = curX
  state.cursorY = curY
  state.velX = velX
  state.velY = velY
  state.hover = hoverAmp
  state.probe = probeAmp

  lightPartnerMesh(mesh, heat, state, dt, draw)
  paint(mesh, draw, state)

  if (hoverAmp > 0.01 || want) kick()
  else {
    hoverAmp = 0
    clearCanvas()
    if (holoOn.value) holoOn.value = false
  }
}

function liftPoint(
  x: number, y: number,
  ox: number, oy: number,
  lift: number,
): [number, number] {
  const dx = x - ox
  const dy = y - oy
  const len = Math.hypot(dx, dy) || 1
  return [x + (dx / len) * lift, y + (dy / len) * lift]
}

function paint(m: PartnerMesh, buf: PartnerHoloDraw, s: PartnerHoloState) {
  if (!ctx) return
  const w = m.w
  const h = m.h
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, Math.min(w, h) * 0.5)
  ctx.clip()
  ctx.lineJoin = 'bevel'
  ctx.lineCap = 'butt'
  ctx.lineWidth = 1

  const verts = m.verts
  const n = m.count
  const ox = s.probe > 0.08 ? s.cursorX : s.originX
  const oy = s.probe > 0.08 ? s.cursorY : s.originY

  ctx.globalCompositeOperation = 'source-over'
  for (let i = 0; i < n; i++) {
    const a = buf.fill[i * 4 + 3]!
    if (a < PARTNER_DRAW_EPS) continue
    const v = i * 6
    const lift = buf.core[i]! * 2.1
    const A = liftPoint(verts[v]!, verts[v + 1]!, ox, oy, lift)
    const B = liftPoint(verts[v + 2]!, verts[v + 3]!, ox, oy, lift)
    const C = liftPoint(verts[v + 4]!, verts[v + 5]!, ox, oy, lift)
    ctx.fillStyle = `rgba(${Math.round(buf.fill[i * 4]! * 255)},${Math.round(buf.fill[i * 4 + 1]! * 255)},${Math.round(buf.fill[i * 4 + 2]! * 255)},${a})`
    ctx.beginPath()
    ctx.moveTo(A[0], A[1])
    ctx.lineTo(B[0], B[1])
    ctx.lineTo(C[0], C[1])
    ctx.closePath()
    ctx.fill()
  }

  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < n; i++) {
    const a = buf.wire[i * 4 + 3]!
    if (a < PARTNER_DRAW_EPS) continue
    const v = i * 6
    const lift = buf.core[i]! * 2.1
    const A = liftPoint(verts[v]!, verts[v + 1]!, ox, oy, lift)
    const B = liftPoint(verts[v + 2]!, verts[v + 3]!, ox, oy, lift)
    const C = liftPoint(verts[v + 4]!, verts[v + 5]!, ox, oy, lift)
    ctx.strokeStyle = `rgba(${Math.round(buf.wire[i * 4]! * 255)},${Math.round(buf.wire[i * 4 + 1]! * 255)},${Math.round(buf.wire[i * 4 + 2]! * 255)},${a})`
    ctx.beginPath()
    ctx.moveTo(A[0], A[1])
    ctx.lineTo(B[0], B[1])
    ctx.lineTo(C[0], C[1])
    ctx.closePath()
    ctx.stroke()
  }

  if (s.probe * s.hover > 0.04) {
    ctx.fillStyle = `rgba(204,255,0,${0.42 * s.probe * s.hover})`
    ctx.beginPath()
    ctx.arc(s.cursorX, s.cursorY, 1.35, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function onEnter(e: PointerEvent) {
  if (reduce) return
  if (e.pointerType === 'touch' || e.pointerType === 'pen') {
    if (!fine) return
  }
  hovering = true
  const p = localPoint(e)
  arm(p.x, p.y)
}

function onMove(e: PointerEvent) {
  if (!hovering || reduce) return
  const p = localPoint(e)
  ptrX = p.x
  ptrY = p.y
}

function onLeave() {
  hovering = false
  if (!splashFrozen && mesh) {
    frozenSplash = state.splashR
    splashFrozen = true
  }
  kick()
}

function onFocus(e: FocusEvent) {
  if (reduce) return
  focused = true
  if (!hovering) {
    const p = localPoint(e)
    arm(p.x, p.y)
  }
}

function onBlur() {
  focused = false
  if (!hovering) {
    splashFrozen = true
    frozenSplash = state.splashR
    kick()
  }
}

onMounted(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const sync = () => {
    reduce = motion.matches
    fine = pointer.matches
    if (reduce) {
      hovering = false
      focused = false
      stop()
      clearCanvas()
      if (holoOn.value) holoOn.value = false
    }
  }
  sync()
  motion.addEventListener('change', sync)
  pointer.addEventListener('change', sync)
  unbindMql = () => {
    motion.removeEventListener('change', sync)
    pointer.removeEventListener('change', sync)
  }
  rebuild()
  const el = hostEl()
  if (el && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => rebuild())
    ro.observe(el)
  }
})

onBeforeUnmount(() => {
  stop()
  ro?.disconnect()
  ro = null
  unbindMql?.()
  unbindMql = null
  ctx = null
  mesh = null
  heat = null
  draw = null
})
</script>

<template>
  <NuxtLink
    ref="rootEl"
    class="gs__btn gs__btn--ghost gs__btn--partner"
    :class="{ 'is-holo': holoOn }"
    to="/contact/partner"
    @pointerenter="onEnter"
    @pointermove="onMove"
    @pointerleave="onLeave"
    @focus="onFocus"
    @blur="onBlur"
  >
    <canvas ref="holoEl" class="gs__partner-holo" aria-hidden="true" />
    <span class="gs__partner-label">Partner</span>
  </NuxtLink>
</template>

<style scoped>
.gs__partner-holo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.gs__partner-label {
  position: relative;
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .gs__partner-holo {
    display: none;
  }
}
</style>
