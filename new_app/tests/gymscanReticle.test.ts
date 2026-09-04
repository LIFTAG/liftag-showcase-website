import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createReticleTracker,
  frameMachine,
  RETICLE_IN,
  RETICLE_MORPH_END,
  RETICLE_MORPH_START,
  RETICLE_OUT_END,
  RETICLE_OUT_START,
  type ReticleUpdate,
} from '../utils/gymscan/reticle.ts'

const QR = { x: 520, y: 240, w: 96, h: 104 }
const MACHINE = { x: 80, y: 90, w: 640, h: 520 }

function base(over: Partial<ReticleUpdate> = {}): ReticleUpdate {
  return {
    dt: 1 / 60,
    elapsed: 0,
    progress: 0.08,
    pointer: { x: 0, y: 0, active: true },
    width: 1440,
    height: 900,
    qr: QR,
    machine: MACHINE,
    reducedMotion: true,
    lockToMachine: false,
    folded: false,
    landed: true,
    ...over,
  }
}

function run(over: Partial<ReticleUpdate> = {}, frames = 1) {
  const tracker = createReticleTracker()
  let box = tracker.update(base(over))
  for (let i = 1; i < frames; i++) {
    box = tracker.update(base({ ...over, elapsed: i / 60 }))
  }
  return box
}

function pointerAt(cssX: number, cssY: number, width = 1440, height = 900) {
  return {
    x: (cssX / width - 0.5) * 2,
    y: (cssY / height - 0.5) * 2,
    active: true as const,
  }
}

test('desktop seek box is centred on the pointer', () => {
  // pointer x=0.5 -> 75% of width = 1080; y=-0.2 -> 40% of height = 360
  const box = run({
    pointer: { x: 0.5, y: -0.2, active: true },
    reducedMotion: true,
  })
  assert.ok(box)
  assert.ok(Math.abs(box.x + box.w / 2 - 1080) < 0.5, `cx ${box.x + box.w / 2}`)
  assert.ok(Math.abs(box.y + box.h / 2 - 360) < 0.5, `cy ${box.y + box.h / 2}`)
  assert.ok(box.w < 160, 'seek box should be cursor-sized, not machine-sized')
})

test('hovering the QR plate acquires it before the scroll morph', () => {
  const box = run({
    progress: 0.08,
    reducedMotion: true,
    pointer: pointerAt(QR.x + QR.w / 2, QR.y + QR.h / 2),
  })
  assert.ok(box)
  assert.equal(box.x, QR.x)
  assert.equal(box.y, QR.y)
  assert.equal(box.w, QR.w)
  assert.equal(box.h, QR.h)
})

test('once the QR is acquired, leaving the pointer on it keeps the lock', () => {
  const tracker = createReticleTracker()
  tracker.update(base({
    progress: 0.08,
    reducedMotion: true,
    pointer: pointerAt(QR.x + QR.w / 2, QR.y + QR.h / 2),
  }))
  const held = tracker.update(base({
    progress: 0.08,
    reducedMotion: true,
    pointer: pointerAt(80, 800),
  }))
  assert.ok(held)
  assert.equal(held.x, QR.x)
  assert.equal(held.y, QR.y)
  assert.equal(held.w, QR.w)
  assert.equal(held.h, QR.h)
})

test('a pointer far from the QR stays on the cursor', () => {
  const box = run({
    progress: 0.08,
    reducedMotion: true,
    pointer: pointerAt(1080, 360),
  })
  assert.ok(box)
  assert.ok(Math.abs(box.x - QR.x) > 40, 'should still be on the cursor, not the plate')
})

test('phone machine frame ignores a pointer over the QR', () => {
  const box = run({
    lockToMachine: true,
    reducedMotion: true,
    pointer: pointerAt(QR.x + QR.w / 2, QR.y + QR.h / 2),
  })
  assert.ok(box)
  const framed = frameMachine(MACHINE, 1440, 900)
  assert.equal(box.x, framed.x)
  assert.equal(box.w, framed.w)
})

test('after the morph window the box matches the QR plate', () => {
  const box = run({ progress: RETICLE_MORPH_END + 0.02, reducedMotion: true })
  assert.ok(box)
  assert.equal(box.x, QR.x)
  assert.equal(box.y, QR.y)
  assert.equal(box.w, QR.w)
  assert.equal(box.h, QR.h)
})

test('mid-morph sits between the frozen seek box and the QR', () => {
  const tracker = createReticleTracker()
  const seek = tracker.update(base({
    pointer: { x: -0.6, y: 0.4, active: true },
    reducedMotion: true,
    progress: 0,
  }))
  assert.ok(seek)
  const mid = tracker.update(base({
    pointer: { x: -0.6, y: 0.4, active: true },
    reducedMotion: true,
    progress: (RETICLE_MORPH_START + RETICLE_MORPH_END) / 2,
  }))
  assert.ok(mid)
  const seekCx = seek.x + seek.w / 2
  const qrCx = QR.x + QR.w / 2
  const midCx = mid.x + mid.w / 2
  assert.ok(midCx > Math.min(seekCx, qrCx) && midCx < Math.max(seekCx, qrCx),
    `mid cx ${midCx} should sit between seek ${seekCx} and qr ${qrCx}`)
})

test('morph freezes the seek origin so a moving pointer cannot drag the lock-on', () => {
  const tracker = createReticleTracker()
  tracker.update(base({
    pointer: { x: -0.8, y: 0.5, active: true },
    reducedMotion: true,
    progress: 0.1,
  }))
  const a = tracker.update(base({
    pointer: { x: -0.8, y: 0.5, active: true },
    reducedMotion: true,
    progress: RETICLE_MORPH_START + 0.02,
  }))
  const b = tracker.update(base({
    pointer: { x: 0.9, y: -0.9, active: true },
    reducedMotion: true,
    progress: RETICLE_MORPH_START + 0.02,
  }))
  assert.ok(a && b)
  assert.ok(Math.abs(a.x - b.x) < 0.5, 'frozen seek should ignore pointer jumps')
  assert.ok(Math.abs(a.y - b.y) < 0.5)
})

test('phone layout frames the machine, not the pointer', () => {
  const box = run({
    lockToMachine: true,
    reducedMotion: true,
    pointer: { x: 0.9, y: -0.9, active: false },
  })
  assert.ok(box)
  const framed = frameMachine(MACHINE, 1440, 900)
  assert.equal(box.x, framed.x)
  assert.equal(box.y, framed.y)
  assert.equal(box.w, framed.w)
  assert.equal(box.h, framed.h)
  assert.ok(box.arm >= 36, `phone arms should be large, got ${box.arm}`)
})

test('frameMachine pulls in from a viewport-filling AABB so the L\'s are not on the bezel', () => {
  const r = frameMachine({ x: 0, y: 80, w: 390, h: 520 }, 390, 844)
  assert.ok(r.x > 16, `left ${r.x}`)
  assert.ok(r.x + r.w < 374, `right ${r.x + r.w}`)
  assert.ok(r.w < 390 * 0.86, `width ${r.w}`)
  assert.ok(r.y > 16, `top ${r.y}`)
})

test('phone frameMachine lifts the viewfinder off the floor tiles', () => {
  const aabb = { x: 10, y: 120, w: 370, h: 480 }
  const phone = frameMachine(aabb, 390, 844)
  const wide = frameMachine(aabb, 1440, 900)
  const phoneCy = phone.y + phone.h / 2
  const wideCy = wide.y + wide.h / 2
  const aabbCy = aabb.y + aabb.h * 0.58
  assert.ok(phoneCy < aabbCy - 24, `phone cy ${phoneCy} vs AABB bias ${aabbCy}`)
  assert.ok(phoneCy < wideCy - 24, `phone cy ${phoneCy} vs wide cy ${wideCy}`)
})

test('folded sequence returns null', () => {
  assert.equal(run({ folded: true }), null)
})

test('hover before the sticker plants cannot pre-acquire the plate', () => {
  const tracker = createReticleTracker()
  const overQr = pointerAt(QR.x + QR.w / 2, QR.y + QR.h / 2)

  assert.equal(tracker.update(base({
    landed: false,
    progress: 0,
    reducedMotion: true,
    pointer: overQr,
  })), null)

  const huntPointer = pointerAt(1080, 360)
  const planted = tracker.update(base({
    progress: 0,
    reducedMotion: true,
    pointer: huntPointer,
  }))
  assert.ok(planted)
  assert.ok(Math.abs(planted.x + planted.w / 2 - 1080) < 0.5)
  assert.ok(Math.abs(planted.y + planted.h / 2 - 360) < 0.5)
  assert.notEqual(planted.x, QR.x, 'a hover before planting must not latch the future target')

  const resolved = tracker.update(base({
    progress: RETICLE_MORPH_END,
    reducedMotion: true,
    pointer: huntPointer,
  }))
  assert.ok(resolved)
  assert.deepEqual(
    { x: resolved.x, y: resolved.y, w: resolved.w, h: resolved.h },
    QR,
  )

  assert.equal(tracker.update(base({
    landed: false,
    progress: 0,
    reducedMotion: true,
    pointer: overQr,
  })), null)
  const restarted = tracker.update(base({
    progress: 0,
    reducedMotion: true,
    pointer: huntPointer,
  }))
  assert.ok(restarted)
  assert.ok(Math.abs(restarted.x + restarted.w / 2 - 1080) < 0.5)
  assert.notEqual(restarted.x, QR.x, 'unplanting must clear the resolved/frozen lock')
})

test('brackets stay off until landed, then hunt the live cursor', () => {
  const tracker = createReticleTracker()
  assert.equal(tracker.update(base({ landed: false, progress: 0 })), null)
  const box = tracker.update(base({
    landed: true,
    progress: 0,
    reducedMotion: true,
    pointer: pointerAt(300, 700),
  }))
  assert.ok(box)
  assert.ok(Math.abs(box.x + box.w / 2 - 300) < 0.5)
  assert.ok(Math.abs(box.y + box.h / 2 - 700) < 0.5)
})

test('a planted machine hunts the cursor with no scroll, act or click first', () => {
  // This is the whole point of the brackets: they are cursor feedback. Any
  // gate that makes the visitor scroll, skip or click before they appear
  // leaves the film feeling unresponsive until they do it.
  const box = run({ landed: true, progress: 0, reducedMotion: true, pointer: pointerAt(300, 700) })
  assert.ok(box)
  assert.ok(Math.abs(box.x + box.w / 2 - 300) < 0.5)
  assert.ok(Math.abs(box.y + box.h / 2 - 700) < 0.5)
})

test('locked brackets are fully opaque', () => {
  const box = run({ progress: RETICLE_MORPH_END + 0.05, reducedMotion: true })
  assert.ok(box)
  assert.equal(box.opacity, 1)
})

test('brackets fade on the plate as the glass forms', () => {
  const mid = run({
    progress: (RETICLE_OUT_START + RETICLE_OUT_END) / 2,
    reducedMotion: true,
  })
  assert.ok(mid)
  assert.ok(mid.opacity > 0 && mid.opacity < 1, `fade opacity ${mid.opacity}`)
  assert.equal(mid.x, QR.x)
  assert.equal(mid.y, QR.y)
  assert.equal(mid.w, QR.w)
  assert.equal(mid.h, QR.h)
})

test('brackets hold onto the plate, then retire as the fold completes', () => {
  assert.ok(RETICLE_OUT_START > RETICLE_MORPH_END, 'resolved lock needs a readable hold')
  assert.equal(RETICLE_OUT_END, 1, 'reticle ends as the glass finishes forming')
  assert.equal(run({ progress: RETICLE_OUT_END, reducedMotion: true }), null)
  const held = run({ progress: RETICLE_OUT_START - 0.02, reducedMotion: true })
  assert.ok(held)
  assert.equal(held.opacity, 1, 'brackets should remain fully visible through the hold')
})

test('brackets stay off until the machine has planted', () => {
  assert.equal(run({ landed: false }), null)
})

test('brackets fade in after landing instead of popping on', () => {
  const tracker = createReticleTracker()
  const first = tracker.update(base({
    landed: true,
    reducedMotion: false,
    progress: 0,
    pointer: pointerAt(300, 700),
  }))
  assert.ok(first)
  assert.equal(first.opacity, 0, 'first landed frame is still invisible')

  let box = first
  const frames = Math.ceil(RETICLE_IN * 60) + 2
  for (let i = 1; i < frames; i++) {
    box = tracker.update(base({
      landed: true,
      reducedMotion: false,
      progress: 0,
      dt: 1 / 60,
      pointer: pointerAt(300, 700),
    }))!
  }
  assert.ok(box)
  assert.equal(box.opacity, 1)

  const midTracker = createReticleTracker()
  midTracker.update(base({
    landed: true,
    reducedMotion: false,
    progress: 0,
    dt: RETICLE_IN * 0.5,
    pointer: pointerAt(300, 700),
  }))
  const mid = midTracker.update(base({
    landed: true,
    reducedMotion: false,
    progress: 0,
    dt: 0,
    pointer: pointerAt(300, 700),
  }))
  assert.ok(mid)
  assert.ok(mid.opacity > 0.2 && mid.opacity < 0.9, `mid fade ${mid.opacity}`)
})

test('reduced motion skips the reticle fade-in', () => {
  const box = run({ landed: true, reducedMotion: true, progress: 0 })
  assert.ok(box)
  assert.equal(box.opacity, 1)
})

test('once planted, the seek box is live at progress zero', () => {
  const box = run({ landed: true, progress: 0, reducedMotion: true })
  assert.ok(box)
  assert.ok(box.w > 0 && box.h > 0)
})

test('desktop pulse changes size over time when motion is allowed', () => {
  const settled = (elapsed: number) => {
    const tracker = createReticleTracker()
    let box = tracker.update(base({
      reducedMotion: false,
      elapsed,
      pointer: { x: 0, y: 0, active: true },
    }))
    for (let i = 1; i < 90; i++) {
      box = tracker.update(base({
        reducedMotion: false,
        elapsed,
        pointer: { x: 0, y: 0, active: true },
      }))
    }
    return box
  }
  const a = settled(0.8)
  const b = settled(2.4)
  assert.ok(a && b)
  assert.ok(Math.abs(a.w - b.w) > 4, `pulse should move size, got ${a.w} then ${b.w}`)
  assert.ok(a.w > 55 && a.w < 90, `pulse should stay near rest size, got ${a.w}`)
  assert.ok(b.w > 55 && b.w < 90, `pulse should stay near rest size, got ${b.w}`)
})

test('reduced motion keeps a steady seek size', () => {
  const a = run({ reducedMotion: true, elapsed: 0.1 })
  const b = run({ reducedMotion: true, elapsed: 1.2 })
  assert.ok(a && b)
  assert.equal(a.w, b.w)
  assert.equal(a.h, b.h)
})
