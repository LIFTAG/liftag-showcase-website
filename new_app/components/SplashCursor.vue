<script setup lang="ts">
// WebGL fluid "splash cursor" - a Vue 3 port of React Bits' SplashCursor
// (MIT, https://reactbits.dev), recolored to the LIFTAG palette. A Navier-Stokes
// velocity field advects a dye texture; pointer movement injects splats so the
// cursor drags lime/green/yellow smoke across the page. Hovering trainer cards
// dispatches `liftag:cursor-glow-tone` and the palette shifts to red neon.
//
// Cost gates (this page's Lighthouse budget is the reason this is not mounted
// eagerly): no WebGL context, listeners or rAF until the first pointer input,
// desktop fine-pointer only, skipped under prefers-reduced-motion, DPR capped,
// loop paused while the tab is hidden.

interface ColorRGB {
  r: number
  g: number
  b: number
}

interface Pointer {
  id: number
  texcoordX: number
  texcoordY: number
  prevTexcoordX: number
  prevTexcoordY: number
  deltaX: number
  deltaY: number
  down: boolean
  moved: boolean
  color: ColorRGB
}

interface TextureFormat {
  internalFormat: number
  format: number
}

interface FBO {
  texture: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  attach: (id: number) => number
}

interface DoubleFBO {
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  read: FBO
  write: FBO
  swap: () => void
}

const props = withDefaults(defineProps<{
  /**
   * When false the canvas stays hidden and WebGL is not armed. `/gym-scan`
   * holds this off until the film hands the frame to the landing hero so the
   * trail never paints over the room and never shares a context with it.
   */
  visible?: boolean
}>(), {
  visible: true,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const armed = ref(false)
const showing = computed(() => armed.value && props.visible)

// 'green' = lime family, 'red' = neon red. Flipped by the same custom event the
// old hero orb listened to, so TrainersSection keeps working unchanged.
const tone = ref<'green' | 'red'>('green')

let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null
let rafId = 0
let disposed = false

let pointers: Pointer[] = []
let config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  // Subtle-tuned vs the React Bits demo: dye fades faster, splats are smaller
  // and gentler, and the fluid settles quickly so the trail reads as a soft
  // glow behind the cursor instead of a full-screen paint storm.
  DENSITY_DISSIPATION: 5.2,
  VELOCITY_DISSIPATION: 3,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 2,
  SPLAT_RADIUS: 0.12,
  SPLAT_FORCE: 3200,
  SHADING: true,
  COLOR_UPDATE_SPEED: 10,
  TRANSPARENT: true,
}
let ext: {
  formatRGBA: TextureFormat
  formatRG: TextureFormat
  formatR: TextureFormat
  halfFloatTexType: number
  supportLinearFiltering: boolean
} | null = null

let dye: DoubleFBO | null = null
let velocity: DoubleFBO | null = null
let divergence: FBO | null = null
let curlFbo: FBO | null = null
let pressure: DoubleFBO | null = null

let copyProgram: Program | null = null
let clearProgram: Program | null = null
let splatProgram: Program | null = null
let advectionProgram: Program | null = null
let divergenceProgram: Program | null = null
let curlProgram: Program | null = null
let vorticityProgram: Program | null = null
let pressureProgram: Program | null = null
let gradientSubtractProgram: Program | null = null
let displayMaterial: Material | null = null

let lastUpdateTime = 0
let colorUpdateTimer = 0

class Program {
  program: WebGLProgram | null
  uniforms: Record<string, WebGLUniformLocation | null>

  constructor(vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null) {
    this.program = createProgram(vertexShader, fragmentShader)
    this.uniforms = this.program ? getUniforms(this.program) : {}
  }

  bind() {
    if (gl && this.program) gl.useProgram(this.program)
  }
}

class Material {
  vertexShader: WebGLShader | null
  fragmentShaderSource: string
  programs: Record<number, WebGLProgram | null>
  activeProgram: WebGLProgram | null
  uniforms: Record<string, WebGLUniformLocation | null>

  constructor(vertexShader: WebGLShader | null, fragmentShaderSource: string) {
    this.vertexShader = vertexShader
    this.fragmentShaderSource = fragmentShaderSource
    this.programs = {}
    this.activeProgram = null
    this.uniforms = {}
  }

  setKeywords(keywords: string[]) {
    let hash = 0
    for (const kw of keywords) hash += hashCode(kw)
    let program = this.programs[hash]
    if (program == null) {
      const fragmentShader = compileShader(gl!.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
      program = createProgram(this.vertexShader, fragmentShader)
      this.programs[hash] = program
    }
    if (program === this.activeProgram) return
    if (program) this.uniforms = getUniforms(program)
    this.activeProgram = program
  }

  bind() {
    if (gl && this.activeProgram) gl.useProgram(this.activeProgram)
  }
}

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
  }
}

function getWebGLContext(canvas: HTMLCanvasElement) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  }

  let context = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null
  if (!context) {
    context = (canvas.getContext('webgl', params)
      || canvas.getContext('experimental-webgl', params)) as WebGL2RenderingContext | null
  }
  if (!context) return null

  const isWebGL2 = 'drawBuffers' in context

  let supportLinearFiltering = false
  let halfFloat: OES_texture_half_float | null = null

  if (isWebGL2) {
    context.getExtension('EXT_color_buffer_float')
    supportLinearFiltering = !!context.getExtension('OES_texture_float_linear')
  }
  else {
    halfFloat = context.getExtension('OES_texture_half_float')
    supportLinearFiltering = !!context.getExtension('OES_texture_half_float_linear')
  }

  context.clearColor(0, 0, 0, 1)

  const halfFloatTexType = isWebGL2
    ? (context as WebGL2RenderingContext).HALF_FLOAT
    : (halfFloat && halfFloat.HALF_FLOAT_OES) || 0

  let formatRGBA: TextureFormat | null
  let formatRG: TextureFormat | null
  let formatR: TextureFormat | null

  if (isWebGL2) {
    const gl2 = context as WebGL2RenderingContext
    formatRGBA = getSupportedFormat(context, gl2.RGBA16F, gl2.RGBA, halfFloatTexType)
    formatRG = getSupportedFormat(context, gl2.RG16F, gl2.RG, halfFloatTexType)
    formatR = getSupportedFormat(context, gl2.R16F, gl2.RED, halfFloatTexType)
  }
  else {
    formatRGBA = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType)
    formatRG = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType)
    formatR = getSupportedFormat(context, context.RGBA, context.RGBA, halfFloatTexType)
  }

  if (!formatRGBA || !formatRG || !formatR) return null

  return {
    gl: context,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    },
  }
}

function getSupportedFormat(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number,
): TextureFormat | null {
  if (!supportRenderTextureFormat(context, internalFormat, format, type)) {
    if ('drawBuffers' in context) {
      const gl2 = context as WebGL2RenderingContext
      switch (internalFormat) {
        case gl2.R16F:
          return getSupportedFormat(context, gl2.RG16F, gl2.RG, type)
        case gl2.RG16F:
          return getSupportedFormat(context, gl2.RGBA16F, gl2.RGBA, type)
        default:
          return null
      }
    }
    return null
  }
  return { internalFormat, format }
}

function supportRenderTextureFormat(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number,
) {
  const texture = context.createTexture()
  if (!texture) return false

  context.bindTexture(context.TEXTURE_2D, texture)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
  context.texImage2D(context.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)

  const fbo = context.createFramebuffer()
  if (!fbo) return false

  context.bindFramebuffer(context.FRAMEBUFFER, fbo)
  context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, texture, 0)
  return context.checkFramebufferStatus(context.FRAMEBUFFER) === context.FRAMEBUFFER_COMPLETE
}

function hashCode(s: string) {
  if (!s.length) return 0
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function addKeywords(source: string, keywords: string[] | null) {
  if (!keywords) return source
  let keywordsString = ''
  for (const keyword of keywords) keywordsString += `#define ${keyword}\n`
  return keywordsString + source
}

function compileShader(type: number, source: string, keywords: string[] | null = null): WebGLShader | null {
  if (!gl) return null
  const shaderSource = addKeywords(source, keywords)
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.trace(gl.getShaderInfoLog(shader))
  }
  return shader
}

function createProgram(vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null): WebGLProgram | null {
  if (!gl || !vertexShader || !fragmentShader) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.trace(gl.getProgramInfoLog(program))
  }
  return program
}

function getUniforms(program: WebGLProgram) {
  if (!gl) return {}
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i)
    if (uniformInfo) uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name)
  }
  return uniforms
}

const BASE_VERTEX_SHADER = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const COPY_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;

void main () {
  gl_FragColor = texture2D(uTexture, vUv);
}
`

const CLEAR_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
  gl_FragColor = value * texture2D(uTexture, vUv);
}
`

const DISPLAY_SHADER_SOURCE = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
uniform vec2 texelSize;

vec3 linearToGamma (vec3 color) {
  color = max(color, vec3(0));
  return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
}

void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  #ifdef SHADING
  vec3 lc = texture2D(uTexture, vL).rgb;
  vec3 rc = texture2D(uTexture, vR).rgb;
  vec3 tc = texture2D(uTexture, vT).rgb;
  vec3 bc = texture2D(uTexture, vB).rgb;

  float dx = length(rc) - length(lc);
  float dy = length(tc) - length(bc);

  vec3 n = normalize(vec3(dx, dy, length(texelSize)));
  vec3 l = vec3(0.0, 0.0, 1.0);

  float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
  c *= diffuse;
  #endif

  float a = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c, a);
}
`

const SPLAT_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`

const ADVECTION_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);

  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  #ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
  #else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
  #endif
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}
`

const DIVERGENCE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;

  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }

  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`

const CURL_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`

const VORTICITY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`

const PRESSURE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float C = texture2D(uPressure, vUv).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`

const GRADIENT_SUBTRACT_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`

let blit: ((target: FBO | null, doClear?: boolean) => void) | null = null

function initBlit() {
  if (!gl) return
  const buffer = gl.createBuffer()
  const elemBuffer = gl.createBuffer()
  if (!buffer || !elemBuffer) return
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(0)

  blit = (target: FBO | null, doClear = false) => {
    if (!gl) return
    if (!target) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
    else {
      gl.viewport(0, 0, target.width, target.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    }
    if (doClear) {
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }
}

function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO | null {
  if (!gl) return null
  gl.activeTexture(gl.TEXTURE0)
  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
  const fbo = gl.createFramebuffer()
  if (!fbo) return null
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.viewport(0, 0, w, h)
  gl.clear(gl.COLOR_BUFFER_BIT)

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX: 1 / w,
    texelSizeY: 1 / h,
    attach(id: number) {
      if (!gl) return id
      gl.activeTexture(gl.TEXTURE0 + id)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      return id
    },
  }
}

function createDoubleFBO(
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
): DoubleFBO | null {
  const fbo1 = createFBO(w, h, internalFormat, format, type, param)
  const fbo2 = createFBO(w, h, internalFormat, format, type, param)
  if (!fbo1 || !fbo2) return null
  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    read: fbo1,
    write: fbo2,
    swap() {
      const tmp = this.read
      this.read = this.write
      this.write = tmp
    },
  }
}

function resizeFBO(
  target: FBO,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
) {
  const newFBO = createFBO(w, h, internalFormat, format, type, param)
  if (!newFBO || !copyProgram || !blit) return newFBO
  copyProgram.bind()
  if (copyProgram.uniforms.uTexture) gl!.uniform1i(copyProgram.uniforms.uTexture, target.attach(0))
  blit(newFBO, false)
  return newFBO
}

function resizeDoubleFBO(
  target: DoubleFBO,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
) {
  if (target.width === w && target.height === h) return target
  const resizedRead = resizeFBO(target.read, w, h, internalFormat, format, type, param)
  if (!resizedRead) return target
  target.read = resizedRead
  const newWrite = createFBO(w, h, internalFormat, format, type, param)
  if (newWrite) target.write = newWrite
  target.width = w
  target.height = h
  target.texelSizeX = 1 / w
  target.texelSizeY = 1 / h
  return target
}

function initFramebuffers() {
  if (!gl || !ext) return
  const simRes = getResolution(config.SIM_RESOLUTION)
  const dyeRes = getResolution(config.DYE_RESOLUTION)

  const texType = ext.halfFloatTexType
  const rgba = ext.formatRGBA
  const rg = ext.formatRG
  const r = ext.formatR
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
  gl.disable(gl.BLEND)

  dye = dye
    ? resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
    : createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
  velocity = velocity
    ? resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
    : createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
  divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
  curlFbo = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
  pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST)
}

function updateKeywords() {
  const displayKeywords: string[] = []
  if (config.SHADING && displayMaterial) displayKeywords.push('SHADING')
  displayMaterial?.setKeywords(displayKeywords)
}

function getResolution(resolution: number) {
  if (!gl) return { width: 128, height: 128 }
  const w = gl.drawingBufferWidth
  const h = gl.drawingBufferHeight
  const aspectRatio = w / h
  const aspect = aspectRatio < 1 ? 1 / aspectRatio : aspectRatio
  const min = Math.round(resolution)
  const max = Math.round(resolution * aspect)
  if (w > h) return { width: max, height: min }
  return { width: min, height: max }
}

function scaleByPixelRatio(input: number) {
  // Capped below devicePixelRatio: a 2x/3x phone-class screen gains nothing
  // from a full-res fluid sim, and the cap keeps fill-rate bounded on retina.
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  return Math.floor(input * pixelRatio)
}

function loopAllowed() {
  return !disposed && armed.value && props.visible && !document.hidden
}

function pauseLoop() {
  if (!rafId) return
  cancelAnimationFrame(rafId)
  rafId = 0
}

function resumeLoop() {
  if (!loopAllowed() || rafId) return
  lastUpdateTime = Date.now()
  rafId = requestAnimationFrame(updateFrame)
}

function updateFrame() {
  if (!loopAllowed() || !blit) {
    rafId = 0
    return
  }
  const dt = calcDeltaTime()
  if (resizeCanvas()) initFramebuffers()
  updateColors(dt)
  applyInputs()
  step(dt)
  render(null)
  rafId = requestAnimationFrame(updateFrame)
}

function calcDeltaTime() {
  const now = Date.now()
  let dt = (now - lastUpdateTime) / 1000
  dt = Math.min(dt, 0.016666)
  lastUpdateTime = now
  return dt
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !gl) return false
  const width = scaleByPixelRatio(canvas.clientWidth)
  const height = scaleByPixelRatio(canvas.clientHeight)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    return true
  }
  return false
}

function updateColors(dt: number) {
  colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED
  if (colorUpdateTimer >= 1) {
    colorUpdateTimer = wrap(colorUpdateTimer, 0, 1)
    pointers.forEach((p) => {
      p.color = generateColor()
    })
  }
}

function applyInputs() {
  if (!props.visible) return
  for (const p of pointers) {
    if (p.moved) {
      p.moved = false
      splatPointer(p)
    }
  }
}

function step(dt: number) {
  if (!gl || !blit || !velocity || !dye || !divergence || !curlFbo || !pressure) return
  gl.disable(gl.BLEND)

  curlProgram?.bind()
  if (curlProgram?.uniforms.texelSize) {
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (curlProgram?.uniforms.uVelocity) {
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0))
  }
  blit(curlFbo)

  vorticityProgram?.bind()
  if (vorticityProgram?.uniforms.texelSize) {
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (vorticityProgram?.uniforms.uVelocity) {
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
  }
  if (vorticityProgram?.uniforms.uCurl) {
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curlFbo.attach(1))
  }
  if (vorticityProgram?.uniforms.curl) {
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL)
  }
  if (vorticityProgram?.uniforms.dt) {
    gl.uniform1f(vorticityProgram.uniforms.dt, dt)
  }
  blit(velocity.write)
  velocity.swap()

  divergenceProgram?.bind()
  if (divergenceProgram?.uniforms.texelSize) {
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (divergenceProgram?.uniforms.uVelocity) {
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
  }
  blit(divergence)

  clearProgram?.bind()
  if (clearProgram?.uniforms.uTexture) {
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0))
  }
  if (clearProgram?.uniforms.value) {
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE)
  }
  blit(pressure.write)
  pressure.swap()

  pressureProgram?.bind()
  if (pressureProgram?.uniforms.texelSize) {
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (pressureProgram?.uniforms.uDivergence) {
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0))
  }
  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    if (pressureProgram?.uniforms.uPressure) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1))
    }
    blit(pressure.write)
    pressure.swap()
  }

  gradientSubtractProgram?.bind()
  if (gradientSubtractProgram?.uniforms.texelSize) {
    gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (gradientSubtractProgram?.uniforms.uPressure) {
    gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
  }
  if (gradientSubtractProgram?.uniforms.uVelocity) {
    gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
  }
  blit(velocity.write)
  velocity.swap()

  advectionProgram?.bind()
  if (advectionProgram?.uniforms.texelSize) {
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  if (!ext?.supportLinearFiltering && advectionProgram?.uniforms.dyeTexelSize) {
    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
  }
  const velocityId = velocity.read.attach(0)
  if (advectionProgram?.uniforms.uVelocity) {
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId)
  }
  if (advectionProgram?.uniforms.uSource) {
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId)
  }
  if (advectionProgram?.uniforms.dt) {
    gl.uniform1f(advectionProgram.uniforms.dt, dt)
  }
  if (advectionProgram?.uniforms.dissipation) {
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION)
  }
  blit(velocity.write)
  velocity.swap()

  if (!ext?.supportLinearFiltering && advectionProgram?.uniforms.dyeTexelSize) {
    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
  }
  if (advectionProgram?.uniforms.uVelocity) {
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
  }
  if (advectionProgram?.uniforms.uSource) {
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1))
  }
  if (advectionProgram?.uniforms.dissipation) {
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION)
  }
  blit(dye.write)
  dye.swap()
}

function render(target: FBO | null) {
  if (!gl || !blit) return
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.enable(gl.BLEND)
  drawDisplay(target)
}

function drawDisplay(target: FBO | null) {
  if (!gl || !blit || !displayMaterial || !dye) return
  const width = target ? target.width : gl.drawingBufferWidth
  const height = target ? target.height : gl.drawingBufferHeight
  displayMaterial.bind()
  if (config.SHADING && displayMaterial.uniforms.texelSize) {
    gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height)
  }
  if (displayMaterial.uniforms.uTexture) {
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
  }
  blit(target, false)
}

function splatPointer(pointer: Pointer) {
  const dx = pointer.deltaX * config.SPLAT_FORCE
  const dy = pointer.deltaY * config.SPLAT_FORCE
  splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color)
}

function clickSplat(pointer: Pointer) {
  if (!props.visible) return
  const color = generateColor()
  // 4x instead of the original 10x so clicks read as a bright pulse, not a
  // flashbang.
  color.r *= 4
  color.g *= 4
  color.b *= 4
  const dx = 10 * (Math.random() - 0.5)
  const dy = 30 * (Math.random() - 0.5)
  splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color)
}

function splat(x: number, y: number, dx: number, dy: number, color: ColorRGB) {
  if (!gl || !blit || !velocity || !dye) return
  const canvas = canvasRef.value
  if (!canvas) return
  splatProgram?.bind()
  if (splatProgram?.uniforms.uTarget) {
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
  }
  if (splatProgram?.uniforms.aspectRatio) {
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height)
  }
  if (splatProgram?.uniforms.point) {
    gl.uniform2f(splatProgram.uniforms.point, x, y)
  }
  if (splatProgram?.uniforms.color) {
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0)
  }
  if (splatProgram?.uniforms.radius) {
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100))
  }
  blit(velocity.write)
  velocity.swap()

  if (splatProgram?.uniforms.uTarget) {
    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0))
  }
  if (splatProgram?.uniforms.color) {
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b)
  }
  blit(dye.write)
  dye.swap()
}

function correctRadius(radius: number) {
  const canvas = canvasRef.value
  if (!canvas) return radius
  const aspectRatio = canvas.width / canvas.height
  if (aspectRatio > 1) radius *= aspectRatio
  return radius
}

function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number) {
  pointer.id = id
  pointer.down = true
  pointer.moved = false
  pointer.texcoordX = posX / canvasRef.value!.width
  pointer.texcoordY = 1 - posY / canvasRef.value!.height
  pointer.prevTexcoordX = pointer.texcoordX
  pointer.prevTexcoordY = pointer.texcoordY
  pointer.deltaX = 0
  pointer.deltaY = 0
  pointer.color = generateColor()
}

function updatePointerMoveData(pointer: Pointer, posX: number, posY: number, color: ColorRGB) {
  const canvas = canvasRef.value
  if (!canvas) return
  pointer.prevTexcoordX = pointer.texcoordX
  pointer.prevTexcoordY = pointer.texcoordY
  pointer.texcoordX = posX / canvas.width
  pointer.texcoordY = 1 - posY / canvas.height
  pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
  pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
  pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
  pointer.color = color
}

function correctDeltaX(delta: number) {
  const canvas = canvasRef.value
  if (!canvas) return delta
  const aspectRatio = canvas.width / canvas.height
  if (aspectRatio < 1) delta *= aspectRatio
  return delta
}

function correctDeltaY(delta: number) {
  const canvas = canvasRef.value
  if (!canvas) return delta
  const aspectRatio = canvas.width / canvas.height
  if (aspectRatio > 1) delta /= aspectRatio
  return delta
}

// ─── LIFTAG palette ──────────────────────────────────────────────────────────
// The original picks a fully random hue per splat. Here the hue is confined to
// a band so every splat reads as the brand: green tone walks yellow -> lime ->
// green around #CCFF00 (~72deg); red tone walks crimson -> pink around
// #FF2D55 (~347deg). The red band is narrower and its dye runs hotter than
// lime's: red is the page's deliberate accent (coaches section), and at the
// shared subtle intensity the hue shift was invisible, so the tone flip needs
// the extra presence to read at all.
const GREEN_HUE_BAND = { min: 58, max: 108 } // yellow -> lime -> green
const RED_HUE_BAND = { min: 336, max: 362 } // wraps past 360 into crimson
const GREEN_DYE_SCALE = 0.07
const RED_DYE_SCALE = 0.13

function bandHue(band: { min: number, max: number }) {
  return ((band.min + Math.random() * (band.max - band.min)) % 360) / 360
}

function generateColor(): ColorRGB {
  const isRed = tone.value === 'red'
  const band = isRed ? RED_HUE_BAND : GREEN_HUE_BAND
  const c = HSVtoRGB(bandHue(band), 1.0, 1.0)
  // The canvas alpha is the brightest channel, so this scale directly caps how
  // strongly the trail occludes the page.
  const s = isRed ? RED_DYE_SCALE : GREEN_DYE_SCALE
  c.r *= s
  c.g *= s
  c.b *= s
  return c
}

function HSVtoRGB(h: number, s: number, v: number): ColorRGB {
  let r = 0
  let g = 0
  let b = 0
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return { r, g, b }
}

function wrap(value: number, min: number, max: number) {
  const range = max - min
  if (range === 0) return min
  return ((value - min) % range) + min
}

// ─── arming, listeners, cleanup ──────────────────────────────────────────────

let onFirstPointerMove: ((event: PointerEvent) => void) | null = null
let onWindowMouseMove: ((event: MouseEvent) => void) | null = null
let onWindowMouseDown: ((event: MouseEvent) => void) | null = null
let onVisibilityChange: (() => void) | null = null
let onToneChange: EventListener | null = null
let pendingClientX = 0
let pendingClientY = 0
let hasPendingPointer = false

function shouldRun() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Touch devices never see it - same gate the old orb had via CSS.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false
  return true
}

function dropPointerSampler() {
  if (!onFirstPointerMove) return
  window.removeEventListener('pointermove', onFirstPointerMove)
  onFirstPointerMove = null
}

function tryArm() {
  if (!hasPendingPointer) return
  arm({ clientX: pendingClientX, clientY: pendingClientY })
}

function arm(event: { clientX: number, clientY: number }) {
  const canvas = canvasRef.value
  if (!canvas || disposed || armed.value || !props.visible) return
  if (!shouldRun()) return

  const context = getWebGLContext(canvas)
  if (!context) {
    dropPointerSampler()
    return
  }
  gl = context.gl
  ext = context.ext

  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256
    config.SHADING = false
  }

  pointers = [pointerPrototype()]

  initBlit()

  const baseVertexShader = compileShader(gl.VERTEX_SHADER, BASE_VERTEX_SHADER)
  const copyShader = compileShader(gl.FRAGMENT_SHADER, COPY_SHADER)
  const clearShader = compileShader(gl.FRAGMENT_SHADER, CLEAR_SHADER)
  const splatShader = compileShader(gl.FRAGMENT_SHADER, SPLAT_SHADER)
  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    ADVECTION_SHADER,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING'],
  )
  const divergenceShader = compileShader(gl.FRAGMENT_SHADER, DIVERGENCE_SHADER)
  const curlShader = compileShader(gl.FRAGMENT_SHADER, CURL_SHADER)
  const vorticityShader = compileShader(gl.FRAGMENT_SHADER, VORTICITY_SHADER)
  const pressureShader = compileShader(gl.FRAGMENT_SHADER, PRESSURE_SHADER)
  const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, GRADIENT_SUBTRACT_SHADER)

  copyProgram = new Program(baseVertexShader, copyShader)
  clearProgram = new Program(baseVertexShader, clearShader)
  splatProgram = new Program(baseVertexShader, splatShader)
  advectionProgram = new Program(baseVertexShader, advectionShader)
  divergenceProgram = new Program(baseVertexShader, divergenceShader)
  curlProgram = new Program(baseVertexShader, curlShader)
  vorticityProgram = new Program(baseVertexShader, vorticityShader)
  pressureProgram = new Program(baseVertexShader, pressureShader)
  gradientSubtractProgram = new Program(baseVertexShader, gradientSubtractShader)
  displayMaterial = new Material(baseVertexShader, DISPLAY_SHADER_SOURCE)

  updateKeywords()
  resizeCanvas()
  initFramebuffers()

  lastUpdateTime = Date.now()
  colorUpdateTimer = 0

  dropPointerSampler()
  installListeners()
  armed.value = true
  resumeLoop()

  // Feed the triggering move in as the first splat so the trail starts at the
  // cursor instead of appearing one gesture later.
  updatePointerMoveData(pointers[0], scaleByPixelRatio(event.clientX), scaleByPixelRatio(event.clientY), generateColor())
}

function installListeners() {
  onWindowMouseMove = (e) => {
    const pointer = pointers[0]
    if (!pointer) return
    updatePointerMoveData(pointer, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY), pointer.color)
  }
  window.addEventListener('mousemove', onWindowMouseMove, { passive: true })

  onWindowMouseDown = (e) => {
    const pointer = pointers[0]
    if (!pointer) return
    updatePointerDownData(pointer, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY))
    clickSplat(pointer)
  }
  window.addEventListener('mousedown', onWindowMouseDown)

  onVisibilityChange = () => {
    if (loopAllowed()) resumeLoop()
    else pauseLoop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  onToneChange = (event: Event) => {
    const next = (event as CustomEvent<{ tone?: 'green' | 'red' }>).detail?.tone
    tone.value = next === 'red' ? 'red' : 'green'
  }
  window.addEventListener('liftag:cursor-glow-tone', onToneChange)
}

onMounted(() => {
  if (!shouldRun()) return
  // Sample pointer from the first move, but do not arm WebGL until `visible`
  // is true. `/gym-scan` keeps this false through the film so the trail is
  // already aimed at the cursor the frame the landing hero takes over.
  onFirstPointerMove = (event) => {
    pendingClientX = event.clientX
    pendingClientY = event.clientY
    hasPendingPointer = true
    tryArm()
  }
  window.addEventListener('pointermove', onFirstPointerMove, { passive: true })
})

watch(() => props.visible, (visible) => {
  if (visible) {
    tryArm()
    resumeLoop()
    return
  }
  pauseLoop()
})

onBeforeUnmount(() => {
  disposed = true
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0

  if (onFirstPointerMove) window.removeEventListener('pointermove', onFirstPointerMove)
  if (onWindowMouseMove) window.removeEventListener('mousemove', onWindowMouseMove)
  if (onWindowMouseDown) window.removeEventListener('mousedown', onWindowMouseDown)
  if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
  if (onToneChange) window.removeEventListener('liftag:cursor-glow-tone', onToneChange)
  onFirstPointerMove = null
  onWindowMouseMove = null
  onWindowMouseDown = null
  onVisibilityChange = null
  onToneChange = null

  const loseContext = gl?.getExtension('WEBGL_lose_context')
  loseContext?.loseContext()
  gl = null
})
</script>

<template>
  <!-- Fixed overlay above section content but under SiteNav (99) and
       AppCtaBar (90). Transparent canvas: the dye renders straight over the
       black page. pointer-events none keeps every control clickable. Rendered
       from SSR as an inert empty node - arming only touches its backing store,
       so there is nothing to hydrate and no v-if/timing race with arm(). -->
  <canvas
    ref="canvasRef"
    class="splash-cursor"
    :class="{ 'is-armed': showing }"
    aria-hidden="true"
  />
</template>

<style scoped>
.splash-cursor {
  position: fixed;
  inset: 0;
  z-index: 60;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Invisible until armed keeps the empty element out of paint entirely. */
  visibility: hidden;
}

.splash-cursor.is-armed {
  visibility: visible;
}
</style>
