// A read tap on SplashCursor's dye field.
//
// SplashCursor already advects a Navier-Stokes dye texture across the whole
// viewport. This module lets a product surface ask what the fluid is doing
// where *it* sits, without opening a second WebGL context or drawing another
// full-screen layer: SplashCursor copies its dye down to one small RGBA8 grid,
// reads it back once every few frames, and hands the grid here. Each registered
// probe maps its own client rect into that grid and receives the dye energy,
// hot spot and colour under it.
//
// Everything is pull-driven from the one existing simulation loop, so a page
// with no probes on screen costs exactly nothing: SplashCursor skips the
// readback entirely while `fluidProbeCount()` is zero.

export interface FluidSample {
  /** Dye energy under the element, 0..1 after gain and clamping. */
  heat: number
  /** Hot spot inside the element box, 0..1 from its top-left corner. */
  x: number
  y: number
  /** Dye colour at the hot spot, 0..255 per channel. */
  r: number
  g: number
  b: number
}

interface FluidProbe {
  el: HTMLElement
  apply: (sample: FluidSample) => void
}

// The dye is deliberately faint (SplashCursor scales every splat to ~0.07) so
// the trail reads as a glow rather than paint. Reading it back at that
// amplitude gives single-digit byte values, so the tap needs gain to land in a
// usable 0..1 range.
const HEAT_GAIN = 7.5

const probes = new Set<FluidProbe>()

const ZERO_SAMPLE: FluidSample = { heat: 0, x: 0.5, y: 0.5, r: 204, g: 255, b: 0 }

export function registerFluidProbe(
  el: HTMLElement,
  apply: (sample: FluidSample) => void,
): () => void {
  const probe: FluidProbe = { el, apply }
  probes.add(probe)
  return () => {
    probes.delete(probe)
    apply(ZERO_SAMPLE)
  }
}

export function fluidProbeCount() {
  return probes.size
}

function clampIndex(value: number, max: number) {
  return value < 0 ? 0 : value > max ? max : value
}

/**
 * Fan one dye readback out to every probe. `pixels` is a bottom-up RGBA8 grid
 * covering the viewport, which is what `gl.readPixels` produces.
 */
export function distributeFluidGrid(pixels: Uint8Array, gridW: number, gridH: number) {
  if (probes.size === 0) return

  const viewportW = Math.max(window.innerWidth, 1)
  const viewportH = Math.max(window.innerHeight, 1)

  probes.forEach((probe) => {
    const rect = probe.el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0
      || rect.bottom <= 0 || rect.top >= viewportH
      || rect.right <= 0 || rect.left >= viewportW) {
      probe.apply(ZERO_SAMPLE)
      return
    }

    const c0 = clampIndex(Math.floor((rect.left / viewportW) * gridW), gridW - 1)
    const c1 = clampIndex(Math.ceil((rect.right / viewportW) * gridW) - 1, gridW - 1)
    // Rows run bottom-up, so the element's bottom edge is the lower row index.
    const r0 = clampIndex(Math.floor((1 - rect.bottom / viewportH) * gridH), gridH - 1)
    const r1 = clampIndex(Math.ceil((1 - rect.top / viewportH) * gridH) - 1, gridH - 1)

    let peak = 0
    let peakRow = r0
    let peakCol = c0
    let peakR = 0
    let peakG = 0
    let peakB = 0

    for (let row = r0; row <= r1; row++) {
      const rowOffset = row * gridW * 4
      for (let col = c0; col <= c1; col++) {
        const i = rowOffset + col * 4
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const energy = r > g ? (r > b ? r : b) : (g > b ? g : b)
        if (energy <= peak) continue
        peak = energy
        peakRow = row
        peakCol = col
        peakR = r
        peakG = g
        peakB = b
      }
    }

    if (peak === 0) {
      probe.apply(ZERO_SAMPLE)
      return
    }

    const hotX = ((peakCol + 0.5) / gridW) * viewportW
    const hotY = (1 - (peakRow + 0.5) / gridH) * viewportH
    const heat = Math.min(1, (peak / 255) * HEAT_GAIN)

    probe.apply({
      heat,
      x: Math.min(1, Math.max(0, (hotX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (hotY - rect.top) / rect.height)),
      // Normalise the colour so a faint splat still reads as its own hue
      // instead of collapsing to near-black.
      r: Math.round((peakR / peak) * 255),
      g: Math.round((peakG / peak) * 255),
      b: Math.round((peakB / peak) * 255),
    })
  })
}
