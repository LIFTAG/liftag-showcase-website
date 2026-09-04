export type GymScanCut = 'floor' | 'seat'
export type GymScanDeviceClass = 'floor' | 'A' | 'B' | 'C'

export type GymScanDeviceSignals = {
  /** `(pointer: coarse) and (hover: none)`. Width never selects the cut. */
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
 * Make, compile-test, and immediately release a temporary WebGL2 context.
 * This is deliberately separate from the real stage so a failed probe cannot
 * leave a half-created renderer behind.
 */
export function probeTemporaryWebGL2(): WebGL2Probe {
  if (typeof document === 'undefined') return NO_WEBGL

  let gl: WebGL2RenderingContext | null = null
  let vertex: WebGLShader | null = null
  let fragment: WebGLShader | null = null
  let program: WebGLProgram | null = null

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
    return { webgl2: Boolean(gl), maxTextureSize: 0, probeFailed: true }
  }
  finally {
    if (gl) {
      if (program) gl.deleteProgram(program)
      if (vertex) gl.deleteShader(vertex)
      if (fragment) gl.deleteShader(fragment)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }
}

function browserSaveData(): boolean {
  if (typeof navigator === 'undefined') return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

/** Browser entry point, with injectable seams for SSR and deterministic tests. */
export function detectGymScanDevice(detector: BrowserDeviceDetector = {}): GymScanDevice {
  const matchMedia = detector.matchMedia
    ?? (typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia.bind(window)
      : undefined)
  const seatCut = matchMedia?.('(pointer: coarse) and (hover: none)').matches === true
  const saveData = (detector.saveData ?? browserSaveData)()
  const probe = (detector.probe ?? probeTemporaryWebGL2)()

  return classifyGymScanDevice({ seatCut, saveData, ...probe })
}
