export type GymScanCut = 'floor' | 'seat'
export type GymScanDeviceClass = 'floor' | 'A' | 'B' | 'C'

export type GymScanDeviceSignals = {
  /**
   * Historical seat-crop flag. The live detector never sets this: a 390-wide
   * desktop window still has a fine pointer, so pointer/hover used to pick a
   * different film on a real iPhone than on the same-width laptop window.
   */
  seatCut: boolean
  webgl2: boolean
  maxTextureSize: number
  saveData: boolean
  probeFailed: boolean
}

export type GymScanDevice = {
  cut: GymScanCut
  deviceClass: GymScanDeviceClass
  dprCap: number
  bloom: boolean
  shadows: boolean
  msaa: boolean
  startStage: boolean
  blitAfterLock: boolean
}

export type WebGL2Probe = Pick<GymScanDeviceSignals, 'webgl2' | 'maxTextureSize' | 'probeFailed'>

export type BrowserDeviceDetector = {
  matchMedia?: (query: string) => { matches: boolean }
  saveData?: () => boolean
  probe?: () => WebGL2Probe
}

const NO_WEBGL: WebGL2Probe = { webgl2: false, maxTextureSize: 0, probeFailed: false }

/** Pure device policy. Keep capability detection outside this function. */
export function classifyGymScanDevice(signals: GymScanDeviceSignals): GymScanDevice {
  if (!signals.seatCut) {
    return {
      cut: 'floor',
      deviceClass: 'floor',
      dprCap: 1.5,
      bloom: true,
      shadows: true,
      msaa: true,
      startStage: true,
      blitAfterLock: false,
    }
  }

  const deviceClass: GymScanDeviceClass = (
    signals.saveData || signals.probeFailed || !signals.webgl2
      ? 'C'
      : signals.maxTextureSize >= 4096
        ? 'A'
        : 'B'
  )

  return {
    cut: 'seat',
    deviceClass,
    dprCap: deviceClass === 'A' ? 1.25 : 1,
    bloom: false,
    shadows: false,
    msaa: false,
    startStage: deviceClass !== 'C',
    blitAfterLock: deviceClass !== 'C',
  }
}

/**
 * The context attributes the gym stage's WebGLRenderer asks for. Three takes
 * `alpha: true` and its own defaults for the rest; `stage.ts` builds its
 * renderer from this object so a probe made with it is the same context.
 */
export const GYM_STAGE_CONTEXT = {
  alpha: true,
  depth: true,
  stencil: false,
  antialias: false,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: false,
} as const satisfies WebGLContextAttributes

/**
 * Make, compile-test, and immediately release a temporary WebGL2 context.
 * This is deliberately separate from the real stage so a failed probe cannot
 * leave a half-created renderer behind.
 */
export function probeTemporaryWebGL2(): WebGL2Probe {
  if (typeof document === 'undefined') return NO_WEBGL

  let gl: WebGL2RenderingContext | null = null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) return NO_WEBGL
    return compileTest(gl)
  }
  catch {
    return { webgl2: Boolean(gl), maxTextureSize: 0, probeFailed: true }
  }
  finally {
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

/**
 * Probe on the stage's own canvas instead of a throwaway one.
 *
 * The temporary probe paid for a second WebGL context (creation, a compile
 * round trip, and the loss) on the main thread right before the real one was
 * made. Creating the context here with GYM_STAGE_CONTEXT means three's
 * `canvas.getContext('webgl2', ...)` hands this same context back, so there
 * is only ever one. A failed probe loses the context again so no renderer is
 * ever built on it; the canvas is not drawn to after that.
 */
export function probeCanvasWebGL2(canvas: HTMLCanvasElement): WebGL2Probe {
  if (typeof document === 'undefined') return NO_WEBGL
  let gl: WebGL2RenderingContext | null = null
  let result: WebGL2Probe
  try {
    const attributes: WebGLContextAttributes = { ...GYM_STAGE_CONTEXT }
    gl = canvas.getContext('webgl2', attributes)
    if (!gl) return NO_WEBGL
    result = compileTest(gl)
  }
  catch {
    result = { webgl2: Boolean(gl), maxTextureSize: 0, probeFailed: true }
  }
  if (result.probeFailed) gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return result
}

/** Compile and link a trivial program; release it, keep the context. */
function compileTest(gl: WebGL2RenderingContext): WebGL2Probe {
  let vertex: WebGLShader | null = null
  let fragment: WebGLShader | null = null
  let program: WebGLProgram | null = null

  try {
    vertex = gl.createShader(gl.VERTEX_SHADER)
    fragment = gl.createShader(gl.FRAGMENT_SHADER)
    program = gl.createProgram()
    if (!vertex || !fragment || !program) {
      return { webgl2: true, maxTextureSize: 0, probeFailed: true }
    }

    gl.shaderSource(vertex, '#version 300 es\nin vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }')
    gl.shaderSource(fragment, '#version 300 es\nprecision mediump float; out vec4 color; void main(){ color=vec4(1.0); }')
    gl.compileShader(vertex)
    gl.compileShader(fragment)
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)

    const compiled = gl.getShaderParameter(vertex, gl.COMPILE_STATUS)
      && gl.getShaderParameter(fragment, gl.COMPILE_STATUS)
      && gl.getProgramParameter(program, gl.LINK_STATUS)

    return {
      webgl2: true,
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0,
      probeFailed: !compiled,
    }
  }
  catch {
    return { webgl2: true, maxTextureSize: 0, probeFailed: true }
  }
  finally {
    if (program) gl.deleteProgram(program)
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
  }
}

/**
 * Live entry. Every device plays FROM THE FLOOR.
 *
 * Seat used to be selected by `(pointer: coarse) and (hover: none)`. That made
 * a narrowed desktop window and an iPhone two different films, and the phone
 * path asked iOS for motion permission so the overlay could gyro-tilt.
 * Capability fallbacks stay in the stage constructor's catch path.
 */
export function detectGymScanDevice(_detector: BrowserDeviceDetector = {}): GymScanDevice {
  return classifyGymScanDevice({
    seatCut: false,
    webgl2: true,
    maxTextureSize: 4096,
    saveData: false,
    probeFailed: false,
  })
}
