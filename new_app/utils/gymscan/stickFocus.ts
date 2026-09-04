// 0C close-up defocus.
//
// A 2D rounded-rect around the card's AABB was the first version; this one
// renders the die-cut itself. The liner is a third buffer: a clear film over
// the gym has to stay sharp as *film* while the room seen through it stays
// blurred, which a coverage mask cannot do — the scene is already composited
// by the time the composite runs. So the gym is rendered without the sticker
// and blurred, the foil is drawn over black with its real material, and the
// composite over-blends them. Cost is zero outside the fly.

import * as THREE from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { PEEL_FRAGMENT_HEAD, PEEL_VERTEX_HEAD, type PeelUniforms } from './peel.ts'

/** Camera layer used only by the coverage / foil draws. Meshes keep layer 0. */
export const STICK_FOCUS_LAYER = 2

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const BLUR_FRAG = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform vec2 uDir;
  varying vec2 vUv;

  vec3 tap(vec2 uv) {
    return texture2D(tDiffuse, clamp(uv, vec2(0.001), vec2(0.999))).rgb;
  }

  void main() {
    vec3 col = tap(vUv) * 0.196
             + tap(vUv + uDir) * 0.297 + tap(vUv - uDir) * 0.297
             + tap(vUv + uDir * 2.0) * 0.090 + tap(vUv - uDir * 2.0) * 0.090
             + tap(vUv + uDir * 3.0) * 0.015 + tap(vUv - uDir * 3.0) * 0.015;
    gl_FragColor = vec4(col, 1.0);
  }
`

function makeTarget(opts: {
  type: THREE.TextureDataType
  depth: boolean
}): THREE.WebGLRenderTarget {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: opts.type,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: opts.depth,
    stencilBuffer: false,
  })
  target.texture.generateMipmaps = false
  return target
}

function makeMaskMaterial(peel: PeelUniforms, halfW: number, halfH: number, round: number): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPeelAxis: peel.uPeelAxis,
      uPeelFront: peel.uPeelFront,
      uPeelRadius: peel.uPeelRadius,
      uPeelMaxTurn: peel.uPeelMaxTurn,
      uPeelGrow: peel.uPeelGrow,
      uPeelSide: peel.uPeelSide,
      uPeelThickness: peel.uPeelThickness,
      uHalf: { value: new THREE.Vector2(halfW, halfH) },
      uRound: { value: round },
    },
    vertexShader: /* glsl */`
      ${PEEL_VERTEX_HEAD}
      void main() {
        vec3 pos;
        vec3 nrm;
        float turn;
        lgPeel(position.xy, pos, nrm, turn);
        vLgPlane = position.xy;
        vLgTurn = turn;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      ${PEEL_FRAGMENT_HEAD}
      uniform vec2 uHalf;
      uniform float uRound;
      void main() {
        vec2 q = abs(vLgPlane) - (uHalf - vec2(uRound));
        float cut = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRound;
        float die = 1.0 - smoothstep(-0.0005, 0.0005, cut);
        if (die < 0.002) discard;
        gl_FragColor = vec4(die);
      }
    `,
    side: THREE.DoubleSide,
    toneMapped: false,
    fog: false,
    depthTest: true,
    depthWrite: true,
  })
  material.customProgramCacheKey = () => 'liftag-stick-focus-mask-v2'
  return material
}

export type StickFocusSubject = {
  rig: THREE.Object3D
  print: THREE.Mesh
  inlay: THREE.Mesh
  foil: THREE.Mesh
}

export type StickFocus = {
  enabled: boolean
  maskTexture: THREE.Texture
  blurTexture: THREE.Texture
  foilTexture: THREE.Texture
  setDof: (dof: number) => void
  setSize: (width: number, height: number) => void
  prepare: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subject: StickFocusSubject,
  ) => void
  dispose: () => void
}

export function createStickFocus(opts: {
  cheap: boolean
  printPeel: PeelUniforms
  halfW: number
  halfH: number
  round: number
}): StickFocus {
  const maskPrint = makeMaskMaterial(opts.printPeel, opts.halfW, opts.halfH, opts.round)
  const mask = makeTarget({ type: THREE.UnsignedByteType, depth: true })
  const foilRt = makeTarget({ type: THREE.HalfFloatType, depth: true })
  const gym = makeTarget({ type: THREE.HalfFloatType, depth: true })
  const scratch = makeTarget({ type: THREE.HalfFloatType, depth: false })
  const blur = makeTarget({ type: THREE.HalfFloatType, depth: false })
  const blurMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uDir: { value: new THREE.Vector2() },
    },
    vertexShader: VERT,
    fragmentShader: BLUR_FRAG,
    toneMapped: false,
    depthTest: false,
    depthWrite: false,
  })
  const quad = new FullScreenQuad(blurMat)
  const clear = new THREE.Color(0, 0, 0)
  const prevClear = new THREE.Color()
  let dof = 0
  let enabled = false

  function setSize(width: number, height: number) {
    const w = Math.max(1, Math.round(width))
    const h = Math.max(1, Math.round(height))
    mask.setSize(w, h)
    foilRt.setSize(w, h)
    const bw = Math.max(1, Math.ceil(w / 4))
    const bh = Math.max(1, Math.ceil(h / 4))
    gym.setSize(bw, bh)
    scratch.setSize(bw, bh)
    blur.setSize(bw, bh)
  }

  function beginOffscreen(renderer: THREE.WebGLRenderer) {
    const prev = {
      target: renderer.getRenderTarget(),
      autoClear: renderer.autoClear,
      alpha: renderer.getClearAlpha(),
      shadow: renderer.shadowMap.autoUpdate,
    }
    renderer.getClearColor(prevClear)
    renderer.autoClear = true
    renderer.shadowMap.autoUpdate = false
    renderer.setClearColor(clear, 0)
    return prev
  }

  function endOffscreen(
    renderer: THREE.WebGLRenderer,
    prev: ReturnType<typeof beginOffscreen>,
  ) {
    renderer.setClearColor(prevClear, prev.alpha)
    renderer.autoClear = prev.autoClear
    renderer.shadowMap.autoUpdate = prev.shadow
    renderer.setRenderTarget(prev.target)
  }

  function renderMask(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subject: StickFocusSubject,
  ) {
    const prevPrint = subject.print.material
    const prevInlay = subject.inlay.material
    const prevFoil = subject.foil.visible
    const prevBg = scene.background
    const prevFog = scene.fog
    const layers = camera.layers.mask
    subject.print.material = maskPrint
    subject.inlay.material = maskPrint
    subject.foil.visible = false
    scene.background = null
    scene.fog = null
    camera.layers.set(STICK_FOCUS_LAYER)
    renderer.setRenderTarget(mask)
    renderer.clear()
    renderer.render(scene, camera)
    subject.print.material = prevPrint
    subject.inlay.material = prevInlay
    subject.foil.visible = prevFoil
    scene.background = prevBg
    scene.fog = prevFog
    camera.layers.mask = layers
  }

  function renderFoil(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subject: StickFocusSubject,
  ) {
    renderer.setRenderTarget(foilRt)
    renderer.clear()
    if (!subject.foil.visible) return
    const prevPrint = subject.print.visible
    const prevInlay = subject.inlay.visible
    const prevBg = scene.background
    const layers = camera.layers.mask
    subject.print.visible = false
    subject.inlay.visible = false
    scene.background = null
    camera.layers.set(STICK_FOCUS_LAYER)
    renderer.render(scene, camera)
    subject.print.visible = prevPrint
    subject.inlay.visible = prevInlay
    scene.background = prevBg
    camera.layers.mask = layers
  }

  function renderGymBlur(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subject: StickFocusSubject,
  ) {
    const prevRig = subject.rig.visible
    subject.rig.visible = false
    renderer.setRenderTarget(gym)
    renderer.clear()
    renderer.render(scene, camera)
    subject.rig.visible = prevRig

    const bw = Math.max(gym.width, 1)
    const bh = Math.max(gym.height, 1)
    const radius = (opts.cheap ? 1.6 : 2.2) * (0.35 + 0.65 * dof)
    const dir = blurMat.uniforms.uDir!.value as THREE.Vector2
    const passes = opts.cheap ? 1 : 2
    let src: THREE.WebGLRenderTarget = gym
    for (let i = 0; i < passes; i++) {
      blurMat.uniforms.tDiffuse!.value = src.texture
      dir.set(radius / bw, 0)
      renderer.setRenderTarget(scratch)
      quad.render(renderer)
      blurMat.uniforms.tDiffuse!.value = scratch.texture
      dir.set(0, radius / bh)
      renderer.setRenderTarget(blur)
      quad.render(renderer)
      src = blur
    }
  }

  function prepare(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subject: StickFocusSubject,
  ) {
    if (!enabled) return
    const prev = beginOffscreen(renderer)
    try {
      renderMask(renderer, scene, camera, subject)
      renderFoil(renderer, scene, camera, subject)
      renderGymBlur(renderer, scene, camera, subject)
    }
    finally {
      endOffscreen(renderer, prev)
    }
  }

  return {
    get enabled() { return enabled },
    maskTexture: mask.texture,
    blurTexture: blur.texture,
    foilTexture: foilRt.texture,
    setDof(value: number) {
      dof = value
      enabled = value > 0.001
    },
    setSize,
    prepare,
    dispose() {
      mask.dispose()
      foilRt.dispose()
      gym.dispose()
      scratch.dispose()
      blur.dispose()
      blurMat.dispose()
      maskPrint.dispose()
    },
  }
}
