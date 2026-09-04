// 3D phone overlay for the gym-scan fold.
//
// The gym composite still grades the room; this pass maps that buffer onto the
// same phone mesh the marketing hero uses, then scales the device from a
// viewport-filling screen down to the hero's front-phone slot. Pointer tilt
// matches Phone3D as soon as the bezel reads. That mesh is the hero phone:
// there is no second device and no screen swap.
import * as THREE from 'three'
import {
  createPhoneModel,
  PHONE_CAM_FOV,
  PHONE_CAM_Z,
  PHONE_H,
  PHONE_REST_ROT_X,
  PHONE_REST_ROT_Y,
  PHONE_SCR_H,
  PHONE_SCR_R,
  PHONE_SCR_W,
  PHONE_SCREEN_Z,
} from '../phoneModel'
import {
  HERO_PHONE_KEY_LIGHT,
  HERO_PHONE_TILT_LERP,
  heroPointerTilt,
  heroTiltMix,
} from './handoff'
import {
  STICKER_FOCUS_CORNER_FRAC,
  STICKER_FOCUS_FEATHER,
  STICKER_FOCUS_LOD,
  STICKER_FOCUS_PAD,
  STICKER_FOCUS_RADIUS_PX,
  canvasUvFromCssBox,
  gymQrUvBox,
  gymScreenOffset,
  phoneFocusBlur,
} from './scanAppPass'
import { clamp01, damp, lerp, smoothstep } from './timeline'

/** Fold value at which the 3D phone starts leaving full-bleed. */
export const PHONE_SHRINK_START = 0.04

export function phoneShrink(fold: number): number {
  return smoothstep((clamp01(fold) - PHONE_SHRINK_START) / (1 - PHONE_SHRINK_START))
}

export type PhoneOverlayTarget = {
  x: number
  y: number
  w: number
  h: number
}

export type PhoneOverlayScreen = {
  x: number
  y: number
  w: number
  h: number
  radius: number
  rotX: number
  rotY: number
  perspective: number
}

export type PhoneOverlayPoseInput = {
  mx: number
  my: number
  hasPointer: boolean
  dt: number
  reducedMotion: boolean
  /** CSS-pixel box of the QR on the gym canvas. Centres it on the phone. */
  qr?: { x: number, y: number, w: number, h: number } | null
}

const SCREEN_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Composite already ran AgX and the sRGB encode. Sample and write those
// display values as-is: a second encode, or a ColorManagement decode of a
// linear-typed composer buffer, is what crushed the room to black.
//
// tApp is the real scan-to-log capture (or a still under reduced motion).
// It is also display-referred — NoColorSpace on the texture — so mixing it
// with the gym composite does not re-decode.
const SCREEN_FRAG = /* glsl */`
  uniform sampler2D tGym;
  uniform sampler2D tApp;
  uniform float uApp;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform vec2 uAppRepeat;
  uniform vec2 uAppOffset;
  uniform vec2 uQrCenter;
  uniform vec2 uQrHalf;
  uniform vec2 uGymTexel;
  uniform float uFocus;
  varying vec2 vUv;

  const float kPad = ${STICKER_FOCUS_PAD.toFixed(4)};
  const float kCorner = ${STICKER_FOCUS_CORNER_FRAC.toFixed(6)};
  const float kFeather = ${STICKER_FOCUS_FEATHER.toFixed(4)};
  const float kLod = ${STICKER_FOCUS_LOD.toFixed(2)};
  const float kBlurRadius = ${STICKER_FOCUS_RADIUS_PX.toFixed(2)};

  // Keep the plate at lod 0, then blur its surroundings with a stable kernel
  // from a finer mip. A single very coarse mip shimmered whenever the folded
  // phone crossed subpixels; these fixed render-target offsets retain the
  // strong rack focus without exposing that tiny mip grid.
  vec4 sampleGym(vec2 uv) {
    vec2 gymUv = uv * uRepeat + uOffset;
    vec4 sharp = texture2DLodEXT(tGym, gymUv, 0.0);
    float live = uFocus * step(1e-6, uQrHalf.x);
    if (live < 0.001) return sharp;
    // Build the clear area in render-target pixels so it stays square even
    // when the gym texture is not square. The extra pad gives the code more
    // breathing room than the printed sticker itself.
    float halfSidePx = max(uQrHalf.x / uGymTexel.x, uQrHalf.y / uGymTexel.y);
    vec2 halfSize = uGymTexel * halfSidePx * kPad;
    float rr = kCorner * 2.0 * min(halfSize.x, halfSize.y);
    vec2 q = abs(gymUv - uQrCenter) - halfSize + rr;
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr;
    float feather = max(min(halfSize.x, halfSize.y) * kFeather, 1e-5);
    float outside = smoothstep(0.0, feather, sd) * live;
    if (outside < 0.001) return sharp;
    vec2 radius = uGymTexel * kBlurRadius;
    vec4 blur = texture2DLodEXT(tGym, gymUv, kLod) * 0.2;
    blur += texture2DLodEXT(tGym, gymUv + vec2(radius.x, 0.0), kLod) * 0.2;
    blur += texture2DLodEXT(tGym, gymUv - vec2(radius.x, 0.0), kLod) * 0.2;
    blur += texture2DLodEXT(tGym, gymUv + vec2(0.0, radius.y), kLod) * 0.2;
    blur += texture2DLodEXT(tGym, gymUv - vec2(0.0, radius.y), kLod) * 0.2;
    return mix(sharp, blur, outside);
  }

  void main() {
    if (uApp < 0.001) {
      gl_FragColor = sampleGym(vUv);
      return;
    }
    vec4 app = texture2D(tApp, vUv * uAppRepeat + uAppOffset);
    if (uApp > 0.999) {
      gl_FragColor = app;
      return;
    }
    gl_FragColor = mix(sampleGym(vUv), app, uApp);
  }
`

export function createPhoneOverlay(opts: { shadows: boolean }) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(PHONE_CAM_FOV, 1, 0.1, 100)
  camera.position.set(0, 0, PHONE_CAM_Z)

  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(2, 3, 5)
  keyLight.castShadow = opts.shadows
  if (opts.shadows) {
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 15
    keyLight.shadow.camera.left = -2
    keyLight.shadow.camera.right = 2
    keyLight.shadow.camera.top = 3
    keyLight.shadow.camera.bottom = -3
    keyLight.shadow.radius = 6
  }
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x8899cc, 0.55)
  fillLight.position.set(-3, 1, 3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.45)
  rimLight.position.set(-1.5, 2.5, -3)
  scene.add(rimLight)

  const screenMat = new THREE.ShaderMaterial({
    uniforms: {
      tGym: { value: null },
      tApp: { value: null },
      uApp: { value: 0 },
      uRepeat: { value: new THREE.Vector2(1, 1) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uAppRepeat: { value: new THREE.Vector2(1, 1) },
      uAppOffset: { value: new THREE.Vector2(0, 0) },
      uQrCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uQrHalf: { value: new THREE.Vector2(0, 0) },
      uGymTexel: { value: new THREE.Vector2(1, 1) },
      uFocus: { value: 0 },
    },
    vertexShader: SCREEN_VERT,
    fragmentShader: SCREEN_FRAG,
    toneMapped: false,
    depthWrite: true,
    depthTest: true,
    fog: false,
  })

  // Same material as the phone screen. The live room and the fold both
  // sample the composite RT through this shader so the handoff cannot
  // change the grade.
  const blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const blitScene = new THREE.Scene()
  blitScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), screenMat))

  const model = createPhoneModel({
    screenMaterial: screenMat,
    castShadow: opts.shadows,
  })
  const glassMat = model.glass.material as THREE.MeshPhysicalMaterial
  glassMat.depthWrite = false
  scene.add(model.group)

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.ShadowMaterial({ opacity: 0 }),
  )
  shadowPlane.position.z = -0.15
  shadowPlane.receiveShadow = opts.shadows
  model.group.add(shadowPlane)

  let scale = 1
  let lightMix = 0
  let currentRotX = 0
  let currentRotY = 0
  const screenCorner = new THREE.Vector3()
  const screenLocal = [
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(),
  ]

  function visibleHeight() {
    return 2 * Math.tan((PHONE_CAM_FOV * Math.PI) / 180 / 2) * PHONE_CAM_Z
  }

  function pose(
    fold: number,
    target: PhoneOverlayTarget,
    width: number,
    heightPx: number,
    input: PhoneOverlayPoseInput,
  ): PhoneOverlayScreen {
    camera.aspect = width / Math.max(heightPx, 1e-6)
    camera.updateProjectionMatrix()

    const visH = visibleHeight()
    const visW = visH * camera.aspect
    const t = Math.min(1, Math.max(0, fold))

    // Cover the viewport with the *screen* sitting on the camera plane
    // (group is pulled back by PHONE_SCREEN_Z * scale while shrink is 0).
    // No extra overscan: that was a zoom the UVs did not fully cancel.
    const sStart = Math.max(visW / PHONE_SCR_W, visH / PHONE_SCR_H)
    const sFinal = (target.h / heightPx) * visH / PHONE_H
    const shrink = phoneShrink(t)
    scale = lerp(sStart, sFinal, shrink)

    const xFinal = ((target.x + target.w / 2) / width - 0.5) * visW
    const yFinal = (0.5 - (target.y + target.h / 2) / heightPx) * visH
    model.group.position.set(
      lerp(0, xFinal, shrink),
      lerp(0, yFinal, shrink),
      lerp(-PHONE_SCREEN_Z * scale, 0, shrink),
    )
    model.group.scale.setScalar(scale)

    // Face-on while the frame is still the whole viewport, then settle into
    // the hero rest pose once the body is actually readable as a phone.
    const rotT = smoothstep((t - 0.38) / 0.62)
    let targetRotX = PHONE_REST_ROT_X * rotT
    let targetRotY = PHONE_REST_ROT_Y * rotT
    const tiltMix = input.reducedMotion ? 0 : heroTiltMix(shrink)
    if (input.hasPointer && tiltMix > 0) {
      const pointer = heroPointerTilt(input.mx, input.my)
      targetRotX = lerp(targetRotX, pointer.rotX, tiltMix)
      targetRotY = lerp(targetRotY, pointer.rotY, tiltMix)
    }
    if (input.reducedMotion) {
      currentRotX = targetRotX
      currentRotY = targetRotY
    } else {
      currentRotX = damp(currentRotX, targetRotX, HERO_PHONE_TILT_LERP, input.dt)
      currentRotY = damp(currentRotY, targetRotY, HERO_PHONE_TILT_LERP, input.dt)
    }
    model.group.rotation.set(currentRotX, currentRotY, 0)
    model.group.updateMatrixWorld(true)

    const lightMx = input.hasPointer && !input.reducedMotion ? input.mx * tiltMix : 0
    const lightMy = input.hasPointer && !input.reducedMotion ? input.my * tiltMix : 0
    keyLight.position.set(
      HERO_PHONE_KEY_LIGHT.x + lightMx * HERO_PHONE_KEY_LIGHT.xGain,
      HERO_PHONE_KEY_LIGHT.y - lightMy,
      HERO_PHONE_KEY_LIGHT.z,
    )

    const canvasAspect = width / Math.max(heightPx, 1e-6)
    const screenAspect = PHONE_SCR_W / PHONE_SCR_H
    const idX = scale * PHONE_SCR_W / visW
    const idY = scale * PHONE_SCR_H / visH
    const r1x = canvasAspect > screenAspect ? screenAspect / canvasAspect : 1
    const r1y = canvasAspect > screenAspect ? 1 : canvasAspect / screenAspect
    const rx = lerp(idX, r1x, shrink)
    const ry = lerp(idY, r1y, shrink)
    const qrUv = input.qr && input.qr.w > 2
      ? canvasUvFromCssBox(input.qr, width, heightPx)
      : null
    const uv = gymScreenOffset({ shrink, rx, ry, qrUv })
    screenMat.uniforms.uRepeat!.value.set(rx, ry)
    screenMat.uniforms.uOffset!.value.set(uv.ox, uv.oy)
    screenMat.uniforms.uFocus!.value = qrUv ? phoneFocusBlur(shrink) : 0
    if (input.qr && qrUv) {
      const box = gymQrUvBox(input.qr, width, heightPx)
      screenMat.uniforms.uQrCenter!.value.set(box.cx, box.cy)
      screenMat.uniforms.uQrHalf!.value.set(box.hx, box.hy)
    } else {
      screenMat.uniforms.uQrHalf!.value.set(0, 0)
    }

    if (opts.shadows) {
      (shadowPlane.material as THREE.ShadowMaterial).opacity = 0.35 * shrink
    }
    glassMat.opacity = 0.03 * shrink

    // Fold lighting is hotter so the bezel reads while the room is still the
    // screen. Once the overlay is the landing hero's front phone, match the
    // flanking Phone3D rig without touching the screen contents.
    ambient.intensity = lerp(0.7, 0.5, lightMix)
    keyLight.intensity = lerp(2.2, 1.5, lightMix)
    fillLight.intensity = lerp(0.55, 0.3, lightMix)
    rimLight.intensity = lerp(0.45, 0, lightMix)

    // Projected AABB of the screen face. CSS perspective on an offset phone
    // does not match the overlay camera, so the DOM app is axis-aligned to
    // this box rather than CSS-rotated.
    const hw = PHONE_SCR_W / 2
    const hh = PHONE_SCR_H / 2
    screenLocal[0]!.set(-hw, -hh, PHONE_SCREEN_Z)
    screenLocal[1]!.set(hw, -hh, PHONE_SCREEN_Z)
    screenLocal[2]!.set(hw, hh, PHONE_SCREEN_Z)
    screenLocal[3]!.set(-hw, hh, PHONE_SCREEN_Z)
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const corner of screenLocal) {
      screenCorner.copy(corner).applyMatrix4(model.group.matrixWorld).project(camera)
      const sx = (screenCorner.x * 0.5 + 0.5) * width
      const sy = (-screenCorner.y * 0.5 + 0.5) * heightPx
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy)
      maxY = Math.max(maxY, sy)
    }

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      radius: (PHONE_SCR_R / PHONE_SCR_H) * (maxY - minY),
      rotX: currentRotX,
      rotY: currentRotY,
      perspective: 0,
    }
  }

  function prewarm(renderer: THREE.WebGLRenderer) {
    renderer.compile(scene, camera)
    renderer.compile(blitScene, blitCamera)
  }

  function bindGymTexture(gymTexture: THREE.Texture) {
    screenMat.uniforms.tGym!.value = gymTexture
    const image = gymTexture.image as { width?: number, height?: number } | undefined
    screenMat.uniforms.uGymTexel!.value.set(
      1 / Math.max(image?.width ?? 1, 1),
      1 / Math.max(image?.height ?? 1, 1),
    )
  }

  function bindAppTexture(
    appTexture: THREE.Texture | null,
    repeatX = 1,
    repeatY = 1,
    offsetX = 0,
    offsetY = 0,
  ) {
    screenMat.uniforms.tApp!.value = appTexture
    screenMat.uniforms.uAppRepeat!.value.set(repeatX, repeatY)
    screenMat.uniforms.uAppOffset!.value.set(offsetX, offsetY)
  }

  function setAppMix(mix: number) {
    screenMat.uniforms.uApp!.value = Math.min(1, Math.max(0, mix))
  }

  function present(
    renderer: THREE.WebGLRenderer,
    draw: () => void,
    exposure: number,
    clearAlpha = 1,
  ) {
    const prevExp = renderer.toneMappingExposure
    const prevAutoClear = renderer.autoClear
    renderer.toneMappingExposure = exposure
    renderer.autoClear = true
    renderer.setClearColor(0x000000, clearAlpha)
    renderer.setRenderTarget(null)
    draw()
    renderer.toneMappingExposure = prevExp
    renderer.autoClear = prevAutoClear
  }

  function blitToScreen(renderer: THREE.WebGLRenderer, gymTexture: THREE.Texture) {
    bindGymTexture(gymTexture)
    screenMat.uniforms.uRepeat!.value.set(1, 1)
    screenMat.uniforms.uOffset!.value.set(0, 0)
    screenMat.uniforms.uFocus!.value = 0
    const prevApp = screenMat.uniforms.uApp!.value as number
    screenMat.uniforms.uApp!.value = 0
    present(renderer, () => renderer.render(blitScene, blitCamera), renderer.toneMappingExposure)
    screenMat.uniforms.uApp!.value = prevApp
  }

  /**
   * The gym as currently mapped onto the phone glass, flattened to `outW` x
   * `outH`. Used to recapture `gym-scene.png` so the scan-flow LOG cut matches
   * the live lock instead of an older, more zoomed-out still.
   *
   * Call after `pose()` so uRepeat / uOffset already hold the lock UVs.
   */
  function exportScreen(
    renderer: THREE.WebGLRenderer,
    outW: number,
    outH: number,
  ): string | null {
    const target = new THREE.WebGLRenderTarget(outW, outH, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
    })
    target.texture.colorSpace = THREE.NoColorSpace
    const prevTarget = renderer.getRenderTarget()
    const prevAutoClear = renderer.autoClear
    const prevApp = screenMat.uniforms.uApp!.value as number
    screenMat.uniforms.uApp!.value = 0
    renderer.autoClear = true
    renderer.setClearColor(0x000000, 1)
    renderer.setRenderTarget(target)
    renderer.render(blitScene, blitCamera)
    const buf = new Uint8Array(outW * outH * 4)
    renderer.readRenderTargetPixels(target, 0, 0, outW, outH, buf)
    renderer.setRenderTarget(prevTarget)
    renderer.autoClear = prevAutoClear
    screenMat.uniforms.uApp!.value = prevApp
    target.dispose()

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const image = ctx.createImageData(outW, outH)
    for (let y = 0; y < outH; y++) {
      const src = (outH - 1 - y) * outW * 4
      image.data.set(buf.subarray(src, src + outW * 4), y * outW * 4)
    }
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL('image/png')
  }

  function renderFromTexture(renderer: THREE.WebGLRenderer, gymTexture: THREE.Texture, shrink: number) {
    bindGymTexture(gymTexture)
    // Lift the phone body as it becomes a device. At shrink 0 the gym on the
    // screen keeps the room's 0.82 exposure. As it parks in the hero slot,
    // land on Phone3D's 1.4 so the flanking phones match.
    const exposure = lerp(
      lerp(renderer.toneMappingExposure, 1.35, shrink),
      1.4,
      lightMix,
    )
    // Once the overlay is the hero's front phone, drop the black plate around
    // it so the flanking devices can sit beside the same mesh.
    present(renderer, () => renderer.render(scene, camera), exposure, lightMix > 0.1 ? 0 : 1)
  }

  function setHeroMix(mix: number) {
    lightMix = Math.min(1, Math.max(0, mix))
  }

  function dispose() {
    screenMat.dispose()
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        if (material !== screenMat) material.dispose()
      })
    })
    blitScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
    })
  }

  return {
    pose,
    blitToScreen,
    exportScreen,
    renderFromTexture,
    bindAppTexture,
    setAppMix,
    setHeroMix,
    getRotation: () => ({ x: currentRotX, y: currentRotY }),
    prewarm,
    dispose,
  }
}

export type PhoneOverlay = ReturnType<typeof createPhoneOverlay>
