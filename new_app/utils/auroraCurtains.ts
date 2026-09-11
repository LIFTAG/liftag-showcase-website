/** Folded, field-aligned curtains. Load gradually develops the palette from teal
 * through emerald to green with champagne edges, rather than categorical ratings.
 * Folded x coordinates overlap naturally under additive compositing. */
export function createAuroraCurtains(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return null

  // Cache one ray per curtain. Repaint these tiny textures only as energy changes;
  // a steady load never allocates gradients in the animation loop.
  const rays = Array.from({ length: 3 }, () => {
    const ray = document.createElement('canvas')
    ray.width = 12
    ray.height = 256
    return ray
  })
  let paletteStep = -1

  function ramp(value: number, start: number, end: number) {
    const t = Math.min(1, Math.max(0, (value - start) / (end - start)))
    return t * t * (3 - 2 * t)
  }

  function updatePalette(energy: number) {
    const step = Math.round(energy * 160)
    if (step === paletteStep) return
    paletteStep = step
    const green = ramp(step / 160, .08, .5)
    const gold = ramp(step / 160, .38, .76)
    for (const [layer, ray] of rays.entries()) {
      const rayContext = ray.getContext('2d')!
      // The middle curtain stays cool, preserving depth alongside the warm edges.
      const warmth = gold * (layer === 1 ? .18 : 1)
      const bodyHue = 183 - green * 37 - warmth * 14 + (layer === 1 ? 9 : 0)
      const edgeHue = 174 - green * 34 - warmth * 46
      rayContext.globalCompositeOperation = 'source-over'
      rayContext.clearRect(0, 0, 12, 256)
      const emission = rayContext.createLinearGradient(0, 0, 0, 256)
      emission.addColorStop(0, 'oklch(58% .12 315 / 0)')
      emission.addColorStop(.13, 'oklch(58% .12 315 / .025)')
      emission.addColorStop(.35, `oklch(70% .11 ${190 - green * 19} / .1)`)
      emission.addColorStop(.62, `oklch(80% ${.13 + green * .06} ${bodyHue} / .34)`)
      emission.addColorStop(.86, `oklch(86% .2 ${bodyHue - warmth * 14} / .64)`)
      emission.addColorStop(.96, `oklch(${89 + green * 3 + warmth * 2}% ${.16 - warmth * .035} ${edgeHue} / .88)`)
      emission.addColorStop(1, `oklch(80% .18 ${edgeHue} / 0)`)
      rayContext.fillStyle = emission
      rayContext.fillRect(0, 0, 12, 256)
      rayContext.globalCompositeOperation = 'destination-in'
      const softness = rayContext.createLinearGradient(0, 0, 12, 0)
      softness.addColorStop(0, 'transparent')
      softness.addColorStop(.5, 'white')
      softness.addColorStop(1, 'transparent')
      rayContext.fillStyle = softness
      rayContext.fillRect(0, 0, 12, 256)
    }
  }

  let width = 1
  let height = 1
  let pixelRatio = 1

  function resize(nextWidth: number, nextHeight: number) {
    width = Math.max(1, nextWidth)
    height = Math.max(1, nextHeight)
    // Atmospheric light doesn't need full Retina resolution.
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
  }

  function render(time: number, energy: number) {
    updatePalette(energy)
    const ctx = context!
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'lighter'
    // Fixed sampling density and clock prevent unit/input changes reseeding the sky.
    const samples = Math.min(640, Math.ceil(width / 1.1))
    const extent = Math.min(height * .8, width * 1.1)
    const movement = .45 + energy * .65
    const gold = ramp(energy, .38, .76)

    for (let layer = 0; layer < 3; layer++) {
      const phase = time * .085 + layer * 2.1
      const depth = 1 - layer * .18
      for (let i = 0; i <= samples; i++) {
        const u = i / samples
        const wave = u * 12 + phase
        const fold = Math.sin(wave + .75 * Math.sin(u * 5 - phase * .7))
        const pleat = Math.sin(u * 27 - phase * 1.3 + fold * 1.8)
        // The projected ribbon folds back on itself, creating brighter overlapping rays.
        const x = width * (-.14 + u * 1.28 + .13 * fold * depth)
        const edge = extent * (.28 + layer * .115
          + .09 * Math.sin(u * 7 + phase * .6)
          + .045 * fold * movement + .016 * pleat)
        const length = extent * depth * (.32 + .075 * Math.sin(u * 9 + phase)
          + .025 * Math.sin(u * 31 - phase * .4))
        // Coherent fine striations drift along the sheet; never random per-frame flicker.
        const filament = .55 + .25 * Math.sin(u * 193 + layer * 7 + time * .12)
          + .2 * Math.sin(u * 347 - time * .09)
        const envelope = Math.sin(Math.PI * u) ** .65
        const crestLight = 1 + gold * .16 * ((.5 + .5 * Math.sin(u * 9 - time * .18 + layer)) ** 4)
        ctx.globalAlpha = envelope * (.16 + filament * .28) * depth * crestLight
        const lean = -.16 + .05 * Math.sin(wave * .5)
        ctx.setTransform(pixelRatio, 0, lean * pixelRatio, pixelRatio,
          x * pixelRatio, (edge - length) * pixelRatio)
        const thickness = width / samples * (1.5 + .6 * filament)
        ctx.drawImage(rays[layer]!, -lean * length - thickness / 2, 0, thickness, length)
      }
    }
    ctx.globalAlpha = 1
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  return { resize, render }
}
