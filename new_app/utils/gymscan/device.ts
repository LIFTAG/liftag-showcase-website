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
export async function probeCanvasWebGL2(canvas: HTMLCanvasElement): Promise<WebGL2Probe> {
  if (typeof document === 'undefined') return NO_WEBGL
  let gl: WebGL2RenderingContext | null = null
  let result: WebGL2Probe
  try {
    const attributes: WebGLContextAttributes = { ...GYM_STAGE_CONTEXT }
    gl = canvas.getContext('webgl2', attributes)
    if (!gl) return NO_WEBGL
    result = await compileTestAsync(gl)
  }
  catch {
    result = { webgl2: Boolean(gl), maxTextureSize: 0, probeFailed: true }
  }
  if (result.probeFailed) gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return result
}

/** How long the probe waits for the GPU to link before calling it failed. */
const PROBE_LINK_WAIT_MS = 4000
const PROBE_FAILED: WebGL2Probe = { webgl2: true, maxTextureSize: 0, probeFailed: true }

type TestProgram = { vertex: WebGLShader, fragment: WebGLShader, program: WebGLProgram }

/** Queue the compile and link of a trivial program. Null if it cannot be made. */
function startCompileTest(gl: WebGL2RenderingContext): TestProgram | null {
  const vertex = gl.createShader(gl.VERTEX_SHADER)
  const fragment = gl.createShader(gl.FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) {
    if (program) gl.deleteProgram(program)
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
    return null
  }
  const test = { vertex, fragment, program }
  try {
    gl.shaderSource(vertex, '#version 300 es\nin vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }')
    gl.shaderSource(fragment, '#version 300 es\nprecision mediump float; out vec4 color; void main(){ color=vec4(1.0); }')
    gl.compileShader(vertex)
    gl.compileShader(fragment)
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    return test
  }
  catch (error) {
    releaseTest(gl, test)
    throw error
  }
}

/** Read the statuses (blocking until the GPU is done) and release the program. */
function finishCompileTest(gl: WebGL2RenderingContext, test: TestProgram): WebGL2Probe {
  try {
    const compiled = gl.getShaderParameter(test.vertex, gl.COMPILE_STATUS)
      && gl.getShaderParameter(test.fragment, gl.COMPILE_STATUS)
      && gl.getProgramParameter(test.program, gl.LINK_STATUS)
    return {
      webgl2: true,
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0,
      probeFailed: !compiled,
    }
  }
  catch {
    return PROBE_FAILED
  }
  finally {
    releaseTest(gl, test)
  }
}

function releaseTest(gl: WebGL2RenderingContext, test: TestProgram) {
  gl.deleteProgram(test.program)
  gl.deleteShader(test.vertex)
  gl.deleteShader(test.fragment)
}

/** Compile and link a trivial program; release it, keep the context. */
function compileTest(gl: WebGL2RenderingContext): WebGL2Probe {
  try {
    const test = startCompileTest(gl)
    return test ? finishCompileTest(gl, test) : PROBE_FAILED
  }
  catch {
    return PROBE_FAILED
  }
}

/**
 * compileTest without the stall. Reading COMPILE_STATUS / LINK_STATUS blocks
 * the main thread until the GPU process has finished; with
 * KHR_parallel_shader_compile the probe polls COMPLETION_STATUS_KHR from
 * timers first, so the statuses are ready when read and the arrival keeps
 * animating meanwhile. Without the extension it is compileTest.
 */
async function compileTestAsync(gl: WebGL2RenderingContext): Promise<WebGL2Probe> {
  let test: TestProgram | null
  try {
    test = startCompileTest(gl)
  }
  catch {
    return PROBE_FAILED
  }
  if (!test) return PROBE_FAILED
  const parallel = gl.getExtension('KHR_parallel_shader_compile')
  if (parallel) {
    const start = performance.now()
    try {
      while (
        !gl.isContextLost()
        && !gl.getProgramParameter(test.program, parallel.COMPLETION_STATUS_KHR)
        && performance.now() - start < PROBE_LINK_WAIT_MS
      ) {
        await new Promise(resolve => setTimeout(resolve, 8))
      }
    }
    catch {
      // Read the statuses below either way.
    }
  }
  return finishCompileTest(gl, test)
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
