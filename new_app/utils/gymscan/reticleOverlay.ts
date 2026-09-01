// Single-pass screen-space scanner brackets.
//
// The old reticle was four filtered DOM nodes updated from the WebGL frame
// callback. Those styles were committed by a separate compositor path and
// could visibly trail the QR during scroll. This shader is drawn into the same
// canvas, in the same animation frame, after the gym/phone presentation.
import * as THREE from 'three'

import type { ReticleBox } from './reticle.ts'
import { RETICLE_RGB } from './hologramColor.ts'

const VERT = /* glsl */`
  uniform vec2 uViewport;
  uniform vec4 uBounds;
  varying vec2 vPixel;

  void main() {
    // PlaneGeometry's UV y is bottom-up. Flip it before mapping into our
    // top-down pixel bounds so the projected triangles keep their front face.
    vec2 local = vec2(uv.x, 1.0 - uv.y);
    vPixel = mix(uBounds.xy, uBounds.zw, local);
    vec2 clip = vec2(
      vPixel.x / uViewport.x * 2.0 - 1.0,
      1.0 - vPixel.y / uViewport.y * 2.0
    );
    gl_Position = vec4(clip, 0.0, 1.0);
  }
`

const FRAG = /* glsl */`
  precision highp float;

  uniform vec2 uViewport;
  uniform vec4 uRect;
  uniform float uArm;
  uniform float uStroke;
  uniform float uOpacity;
  uniform float uGlow;
  uniform vec3  uColor;
  varying vec2 vPixel;

  float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
    return length(p - (a + ab * t));
  }

  float cornerDistance(vec2 p, vec2 corner, vec2 inward) {
    // Mirror every corner into one canonical L so left and right cannot drift.
    vec2 q = (p - corner) * inward;
    float horizontal = segmentDistance(q, vec2(0.0), vec2(uArm, 0.0));
    float vertical = segmentDistance(q, vec2(0.0), vec2(0.0, uArm));
    return min(horizontal, vertical);
  }

  void main() {
    vec2 p = vPixel;
    float x0 = uRect.x - uArm * 0.5;
    float y0 = uRect.y - uArm * 0.5;
    float x1 = uRect.x + uRect.z + uArm * 0.5;
    float y1 = uRect.y + uRect.w + uArm * 0.5;

    vec2 tl = vec2(x0, y0);
    vec2 tr = vec2(x1, y0);
    vec2 bl = vec2(x0, y1);
    vec2 br = vec2(x1, y1);

    float d = cornerDistance(p, tl, vec2(1.0, 1.0));
    d = min(d, cornerDistance(p, tr, vec2(-1.0, 1.0)));
    d = min(d, cornerDistance(p, bl, vec2(1.0, -1.0)));
    d = min(d, cornerDistance(p, br, vec2(-1.0, -1.0)));

    // One physical pixel of edge softness. The exponential is the old lime
    // bloom without a CSS filter or an intermediate texture.
    float halfStroke = uStroke * 0.5;
    float core = 1.0 - smoothstep(halfStroke - 1.0, halfStroke + 1.0, d);
    float halo = exp(-max(d - halfStroke, 0.0) / 5.5) * uGlow;
    float alpha = max(core * 0.94, halo) * uOpacity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

export interface ReticlePixelState {
  x: number
  y: number
  w: number
  h: number
  arm: number
  stroke: number
}

export type ReticlePixelBounds = [minX: number, minY: number, maxX: number, maxY: number]

/** Convert CSS-pixel tracking data into the renderer's physical pixel buffer. */
export function reticlePixelState(
  box: ReticleBox,
  cssWidth: number,
  cssHeight: number,
  bufferWidth: number,
  bufferHeight: number,
): ReticlePixelState {
  const sx = bufferWidth / Math.max(cssWidth, 1)
  const sy = bufferHeight / Math.max(cssHeight, 1)
  const scale = Math.min(sx, sy)
  const strokeCss = Math.min(2.75, Math.max(1.5, box.arm * 0.08))
  return {
    x: box.x * sx,
    y: box.y * sy,
    w: box.w * sx,
    h: box.h * sy,
    arm: box.arm * scale,
    stroke: strokeCss * scale,
  }
}

/** Tight draw region around the brackets and their short glow falloff. */
export function reticlePixelBounds(
  state: ReticlePixelState,
  bufferWidth: number,
  bufferHeight: number,
): ReticlePixelBounds {
  const halfArm = state.arm * 0.5
  const pad = Math.max(12, state.stroke * 6)
  return [
    Math.max(0, state.x - halfArm - pad),
    Math.max(0, state.y - halfArm - pad),
    Math.min(bufferWidth, state.x + state.w + halfArm + pad),
    Math.min(bufferHeight, state.y + state.h + halfArm + pad),
  ]
}

export function createReticleOverlay() {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const bufferSize = new THREE.Vector2()
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uViewport: { value: new THREE.Vector2(1, 1) },
      uBounds: { value: new THREE.Vector4(0, 0, 1, 1) },
      uRect: { value: new THREE.Vector4() },
      uArm: { value: 16 },
      uStroke: { value: 1.5 },
      uOpacity: { value: 0 },
      uGlow: { value: 0.22 },
      uColor: { value: new THREE.Color(RETICLE_RGB[0], RETICLE_RGB[1], RETICLE_RGB[2]) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  scene.add(quad)

  function render(
    renderer: THREE.WebGLRenderer,
    box: ReticleBox | null,
    cssWidth: number,
    cssHeight: number,
    locked: boolean,
    target: THREE.WebGLRenderTarget | null = null,
  ) {
    if (!box || box.opacity <= 0) return
    if (target) bufferSize.set(target.width, target.height)
    else renderer.getDrawingBufferSize(bufferSize)
    const px = reticlePixelState(box, cssWidth, cssHeight, bufferSize.x, bufferSize.y)
    const bounds = reticlePixelBounds(px, bufferSize.x, bufferSize.y)
    material.uniforms.uViewport!.value.copy(bufferSize)
    material.uniforms.uBounds!.value.set(...bounds)
    material.uniforms.uRect!.value.set(px.x, px.y, px.w, px.h)
    material.uniforms.uArm!.value = px.arm
    material.uniforms.uStroke!.value = px.stroke
    material.uniforms.uOpacity!.value = box.opacity
    material.uniforms.uGlow!.value = locked ? 0.32 : 0.20

    const previousTarget = renderer.getRenderTarget()
    const previousAutoClear = renderer.autoClear
    renderer.setRenderTarget(target)
    renderer.autoClear = false
    renderer.render(scene, camera)
    renderer.autoClear = previousAutoClear
    renderer.setRenderTarget(previousTarget)
  }

  function prewarm(renderer: THREE.WebGLRenderer) {
    renderer.compile(scene, camera)
  }

  function dispose() {
    quad.geometry.dispose()
    material.dispose()
  }

  return { render, prewarm, dispose }
}
