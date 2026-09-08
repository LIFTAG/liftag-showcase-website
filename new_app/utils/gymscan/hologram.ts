// The machine's hologram exoskeleton, and the floor shockwave it becomes.
//
// A second, slightly larger copy of the hero machine drawn as its own
// triangulation - thin outlines, one per triangle, nothing filled. Two
// idle fields light that one cage: a bright horizontal line that sweeps
// top-to-bottom at a fixed cadence, and the cursor probe that already
// grazes the machine's surface. It is the system's *read* of the machine
// made visible: the line kicks down, the mesh resolves behind it, and the
// pointer can hold a patch of that mesh between passes.
//
// The same cage plays a third pass when the QR sticker lands: the tag
// flashes, then a green skeleton grows out of that point. No travelling
// lime front and no floor shockwave — those belong to the idle sweep.
//
// When the line reaches the ground it does not stop. The same energy peels
// off the machine's feet as a circular shockwave of triangle outlines, the
// floor's own wire read, expanding with the same kick the line arrived on.
// The two share a clock so the splash reads as the sweep continuing, not as
// a second effect. The travelling front is scanner-bracket chrome - the same
// untonemapped (0.80, 1, 0) as the four L-corners. The reconstructed mesh
// behind the line, and the cursor's local patch, stay the room's cool white.
// The cursor does not spawn a floor ring - the splash is sweep-only. The
// cursor blob is screen-space around the pointer, so a mouse in the corner
// of the frame does not light the machine.
//
// Why a separate shell rather than another term in the machine's own shader:
// the analysis effects that used to live there were all removed for one
// reason, recorded in machineMaterial.ts - an effect drawn across the body of
// the machine is a light on the machine whatever colour it is, and this room's
// entire premise is that the machine is barely lit. That objection is about
// *the surface*. A wire cage floating a few centimetres off it is not on the
// surface: it never touches the powder coat, it fills nothing, and it reads as
// something projected around the machine rather than something shining on it.
// That is the whole reason the geometry is offset rather than coincident.
//
// The floor wave is the same argument, applied to the mat. It is not a term
// in the floor's PBR shader (that plane already decides the frame rate); it
// is its own additive mesh of a few thousand triangles, hidden between
// passes, discarded wherever it is not a wire.
//
// Lime is allowed only as the travelling core and the floor-ring front.
// Area of lime is the constraint: at this scale a lime *body* is a second
// machine, which is what greened the whole shot when it was tried. Sweep
// trail, the cursor patch, and the reduced-motion shell stay the room's
// cool white.
import * as THREE from 'three'
import {
  ACTIVATE_HOT_RGB,
  ACTIVATE_RGB,
  CAGE_BODY_GAIN,
  CAGE_CORE_GAIN,
  CAGE_FILL_GAIN,
  CAGE_LOCK_GAIN,
  CAGE_PROBE_GAIN,
  CAGE_PROBE_SCREEN_INNER,
  CAGE_PROBE_SCREEN_RADIUS,
  CORE_RGB,
  HOT_RGB,
  WIRE_RGB,
  cageShouldDraw,
} from './hologramColor'
import {
  hologramPassAt,
  PEEL,
  PERIOD,
  TRAIL,
  timeAtHeight,
  Y_CONTACT,
  type HologramPassOpts,
} from './hologramPass'
import {
  ACTIVATE_FLOOR_MAX_R,
  hologramActivateAt,
} from './hologramActivate'
import { PLACARD_REST } from './stick'
export interface HologramOptions {
  /**
   * How much larger than the machine, about its own centre. The bottom of the
   * shell therefore sits slightly below the floor, where the floor plane
   * occludes it - which is what keeps the machine looking planted rather than
   * hovering inside a bubble.
   */
  scale?: number
  /**
   * Extra outward offset along the vertex normal, in metres, on top of the
   * scale. Scaling about the centre gives no separation *at* the centre, so
   * without this the shell intersects the machine around the middle of the
   * frame. Kept small: normal offset splits the shell open at hard edges, and
   * the gap it leaves is exactly this wide.
   */
  offset?: number
  /** Phone 0A: 12×24 shockwave rings instead of 22×40. */
  cheap?: boolean
}

export interface HologramProbe {
  /** CSS NDC, y down. Same space as `useSharedMouse` / `setPointer`. */
  ndc: { x: number, y: number }
  /** Drawing-buffer size of the gym render target, for `gl_FragCoord`. */
  viewport: { x: number, y: number }
  amp: number
  live: number
  /** Same clock the surface probe uses for its noise drift. */
  time: number
}

export interface HologramShell {
  object: THREE.Object3D
  /**
   * @param elapsed  seconds since the stage started
   * @param envelope 0..1 scroll gate; at 0 the shell is not drawn at all
   * @param steady   when true the sweep is replaced by a constant faint shell
   * @param probe    damped cursor field already written on the machine;
   *                 omitted is a dark probe
   */
  update(elapsed: number, envelope: number, steady: boolean, probe?: HologramProbe): void
  /**
   * One-shot power-on from the sticker. Green fill growing out of
   * `origin`, local bloom on the beam, no floor ring. Returns true while
   * the pass is still drawing so the idle clock can wait.
   */
  updateActivation(
    t: number,
    envelope: number,
    origin: THREE.Vector3,
    time?: number,
  ): boolean
  /**
   * Lift the cage with the machine during the entry drop. The floor wave
   * stays on the mat - it is a read of the ground, not of the falling mesh.
   * The sweep band rides with the cage so the line stays on the falling
   * mesh rather than painting rest-pose coordinates in empty air.
   */
  setAltitude(y: number): void
  /** Seconds into a pass at which the floor ring starts travelling. */
  readonly peelTime: number
  readonly stemR: number
  readonly maxR: number
}

const WIRE_COLOR = new THREE.Color(WIRE_RGB[0], WIRE_RGB[1], WIRE_RGB[2])
const CORE_COLOR = new THREE.Color(CORE_RGB[0], CORE_RGB[1], CORE_RGB[2])
const HOT_COLOR = new THREE.Color(HOT_RGB[0], HOT_RGB[1], HOT_RGB[2])
const ACTIVATE_COLOR = new THREE.Color(ACTIVATE_RGB[0], ACTIVATE_RGB[1], ACTIVATE_RGB[2])
const ACTIVATE_HOT_COLOR = new THREE.Color(
  ACTIVATE_HOT_RGB[0],
  ACTIVATE_HOT_RGB[1],
  ACTIVATE_HOT_RGB[2],
)
/** How far the splash runs across the mat, metres. */
const WAVE_MAX_R = 6.20
/** Peak vertex lift at the shockwave front, metres. */
const WAVE_LIFT = 0.070
/** Ring thickness on the floor. Wider than the cage: a 2 cm line vanishes
 *  from the establishing station, and a plane of triangles needs the extra
 *  width or the front reads as speckle rather than a line. */
const WAVE_CORE = 0.050
/**
 * Pull the floor mesh toward the camera in clip space. Seven millimetres of
 * world Y is smaller than the depth buffer's step at the establishing
 * station, so without this the opaque mat wins every fragment and the
 * splash is submitted but never seen. Kept small enough that the machine's
 * tubes - centimetres above the mat - still occlude it.
 */
const WAVE_DEPTH_BIAS = 0.0045

/**
 * Triangle outlines need to know where inside its own triangle a fragment
 * sits, and nothing in a normal vertex stream carries that. The standard fix
 * is a barycentric attribute - (1,0,0), (0,1,0), (0,0,1) around each triangle -
 * which forces the geometry non-indexed, since a shared vertex would need a
 * different value per triangle it belongs to.
 *
 * That triples the vertex count, which is why this is the one thing the shell
 * does not share with the machine. Position and normal are all it keeps, and
 * the barycentric itself is three normalised bytes rather than three floats,
 * so the whole shell is a little under 2 MB on the GPU.
 */
function wireGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = src.index ? src.toNonIndexed() : src.clone()
  for (const name of Object.keys(geo.attributes)) {
    if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name)
  }
  const count = geo.attributes.position!.count
  const bary = new Uint8Array(count * 3)
  for (let i = 0; i < count; i++) bary[i * 3 + (i % 3)] = 255
  geo.setAttribute('aBary', new THREE.BufferAttribute(bary, 3, true))
  return geo
}

function hash2(i: number, j: number): number {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/**
 * Polar mesh centred on the machine. Closed triangle outlines near the
 * feet, then the field stops closing and throws tapering filaments
 * outward - roots, not a coarser grid.
 *
 * `aKind` is 0 on the closed wire triangles and 1 on the root strokes.
 * Cost is fragments, not verts: hidden between passes, discarded off the
 * ring.
 */
function createShockwaveGeometry(
  innerR: number,
  outerR: number,
  rings = 22,
  segments = 40,
): THREE.BufferGeometry {
  const rx = new Float32Array(rings * segments)
  const rz = new Float32Array(rings * segments)
  const ringR = new Float32Array(rings)

  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1)
    ringR[i] = innerR + (outerR - innerR) * Math.pow(t, 1.62)
  }

  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1)
    const rBase = ringR[i]!
    const prev = ringR[Math.max(0, i - 1)]!
    const next = ringR[Math.min(rings - 1, i + 1)]!
    const span = Math.max(next - prev, 0.02)
    const jitter = t * t
    for (let j = 0; j < segments; j++) {
      const h1 = hash2(i + 1, j + 3)
      const h2 = hash2(j + 7, i + 11)
      const r = rBase + (h1 - 0.5) * span * (0.22 + 0.95 * jitter)
      const a = (j / segments) * Math.PI * 2
        + (h2 - 0.5) * (Math.PI * 2 / segments) * (0.18 + 0.72 * jitter)
      const idx = i * segments + j
      rx[idx] = Math.cos(a) * r
      rz[idx] = Math.sin(a) * r
    }
  }

  const pos: number[] = []
  const bary: number[] = []
  const kind: number[] = []

  const emitTri = (
    ax: number, az: number,
    bx: number, bz: number,
    cx: number, cz: number,
    k: number,
  ) => {
    const xs = [ax, bx, cx]
    const zs = [az, bz, cz]
    for (let i = 0; i < 3; i++) {
      pos.push(xs[i]!, 0, zs[i]!)
      bary.push(i === 0 ? 255 : 0, i === 1 ? 255 : 0, i === 2 ? 255 : 0)
      kind.push(k)
    }
  }

  // Closed outlines only near the stem. Further out they open into roots.
  for (let i = 0; i < rings - 1; i++) {
    const t = (i + 1) / (rings - 1)
    const drop = Math.min(0.86, Math.pow(Math.max(0, t - 0.28) / 0.70, 1.15))
    for (let j = 0; j < segments; j++) {
      const jn = (j + 1) % segments
      const a = i * segments + j
      const b = i * segments + jn
      const c = (i + 1) * segments + j
      const d = (i + 1) * segments + jn
      if (hash2(i + 19, j + 5) > drop * 0.85) {
        emitTri(rx[a]!, rz[a]!, rx[b]!, rz[b]!, rx[d]!, rz[d]!, 0)
      }
      if (hash2(j + 23, i + 41) > drop) {
        emitTri(rx[a]!, rz[a]!, rx[d]!, rz[d]!, rx[c]!, rz[c]!, 0)
      }
    }
  }

  const emitRibbon = (
    px: number, pz: number, qx: number, qz: number,
    w0: number, w1: number,
  ) => {
    const dx = qx - px
    const dz = qz - pz
    const len = Math.hypot(dx, dz) || 1
    const nx = -dz / len
    const nz = dx / len
    const hx0 = nx * w0 * 0.5
    const hz0 = nz * w0 * 0.5
    const hx1 = nx * w1 * 0.5
    const hz1 = nz * w1 * 0.5
    emitTri(px + hx0, pz + hz0, px - hx0, pz - hz0, qx + hx1, qz + hz1, 1)
    emitTri(px - hx0, pz - hz0, qx - hx1, qz - hz1, qx + hx1, qz + hz1, 1)
  }

  let branches = 0
  const grow = (
    px: number, pz: number,
    angle: number, length: number, width: number,
    depth: number, seed: number,
  ) => {
    if (depth <= 0 || length < 0.06 || branches > 4000) return
    const qx = px + Math.cos(angle) * length
    const qz = pz + Math.sin(angle) * length
    emitRibbon(px, pz, qx, qz, width, Math.max(0.0024, width * 0.38))
    branches++
    const h = hash2(seed, depth * 13)
    const next = angle + (h - 0.5) * (0.18 + 0.62 * (1 - depth / 5))
    grow(qx, qz, next, length * (0.50 + h * 0.22), width * 0.52, depth - 1, seed + 11)
    const fork = hash2(seed + 3, depth)
    if (fork > 0.34 && depth >= 2) {
      const side = fork > 0.67 ? 1 : -1
      grow(
        qx, qz,
        angle + side * (0.38 + fork * 0.55),
        length * (0.36 + fork * 0.16),
        width * 0.38,
        depth - 1,
        seed + 29,
      )
    }
  }

  // Filaments start once the closed mesh is already opening, and reach
  // past the last ring. Fewer starts further out, longer forks - roots,
  // not a second triangulation.
  for (let i = Math.floor(rings * 0.14); i < rings; i++) {
    const t = i / (rings - 1)
    const jStep = t < 0.32 ? 3 : t > 0.78 ? 3 : 2
    const gen = t > 0.74 ? 4 : t > 0.55 ? 3 : 2
    const len = 0.40 + t * 1.45
    const width = 0.016 * (1 - t * 0.28)
    for (let j = 0; j < segments; j += jStep) {
      const idx = i * segments + j
      const px = rx[idx]!
      const pz = rz[idx]!
      const ang = Math.atan2(pz, px) + (hash2(i, j) - 0.5) * 0.34
      grow(px, pz, ang, len * (0.75 + hash2(j, i) * 0.45), width, gen, i * 47 + j)
    }
  }

  const n = kind.length
  const posA = new Float32Array(pos)
  const nrmA = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    nrmA[i * 3 + 1] = 1
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(posA, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(nrmA, 3))
  geo.setAttribute('aBary', new THREE.BufferAttribute(new Uint8Array(bary), 3, true))
  geo.setAttribute('aKind', new THREE.BufferAttribute(new Float32Array(kind), 1))
  geo.computeBoundingSphere()
  return geo
}

function createCageMaterial(offset: number): THREE.ShaderMaterial {
  const uniforms = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uOffset: { value: offset },
    uAmp: { value: 0 },
    uBandY: { value: 0 },
    uCoreWidth: { value: 0.022 },
    uTrail: { value: TRAIL },
    uSteady: { value: 0 },
    uWireColor: { value: WIRE_COLOR },
    uCoreColor: { value: CORE_COLOR },
    uWireWidth: { value: 0.9 },
    uBodyGain: { value: CAGE_BODY_GAIN },
    uCoreGain: { value: CAGE_CORE_GAIN },
    uProbeGain: { value: CAGE_PROBE_GAIN },
    uPointer: { value: new THREE.Vector2() },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uProbeRadius: { value: CAGE_PROBE_SCREEN_RADIUS },
    uProbeAmp: { value: 0 },
    uProbeLive: { value: 0 },
    uTime: { value: 0 },
    uMode: { value: 0 },
    uOrigin: { value: new THREE.Vector3() },
    uFrontR: { value: 0 },
    uLock: { value: 0 },
    uIgnite: { value: 0 },
    uSpark: { value: 0 },
    uFill: { value: 0 },
    uHot: { value: 0 },
    uHotColor: { value: HOT_COLOR },
  }

  return new THREE.ShaderMaterial({
    name: 'LiftagHologramShell',
    uniforms,
    // Same as the L-corner overlay: untonemapped so (0.80, 1, 0) is the
    // chrome you see, not AgX's reading of it.
    toneMapped: false,
    // Additive, depth-tested but not depth-writing: the shell has to be
    // occluded by the machine and the floor but must not occlude itself.
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    vertexShader: /* glsl */`
      uniform float uOffset;
      attribute vec3 aBary;
      varying vec3 vBary;
      varying vec3 vWorldPos;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_vertex>

      void main() {
        vec3 shell = position + normal * uOffset;
        vec4 worldPos = modelMatrix * vec4(shell, 1.0);
        vBary = aBary;
        vWorldPos = worldPos.xyz;
        vec4 mvPosition = viewMatrix * worldPos;
        vViewPos = mvPosition.xyz;
        vViewNormal = normalMatrix * normal;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uAmp;
      uniform float uBandY;
      uniform float uCoreWidth;
      uniform float uTrail;
      uniform float uSteady;
      uniform vec3  uWireColor;
      uniform vec3  uCoreColor;
      uniform float uWireWidth;
      uniform float uBodyGain;
      uniform float uCoreGain;
      uniform float uProbeGain;
      uniform vec2  uPointer;
      uniform vec2  uViewport;
      uniform float uProbeRadius;
      uniform float uProbeAmp;
      uniform float uProbeLive;
      uniform float uTime;
      uniform float uMode;
      uniform vec3  uOrigin;
      uniform float uFrontR;
      uniform float uLock;
      uniform float uIgnite;
      uniform float uSpark;
      uniform float uFill;
      uniform float uHot;
      uniform vec3  uHotColor;
      varying vec3 vBary;
      varying vec3 vWorldPos;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_fragment>

      // Same hash/noise as machineMaterial.ts so the cage blob and the
      // surface graze share a boundary.
      float lgHash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float lgNoise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(lgHash(i + vec3(0,0,0)), lgHash(i + vec3(1,0,0)), f.x),
              mix(lgHash(i + vec3(0,1,0)), lgHash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(lgHash(i + vec3(0,0,1)), lgHash(i + vec3(1,0,1)), f.x),
              mix(lgHash(i + vec3(0,1,1)), lgHash(i + vec3(1,1,1)), f.x), f.y),
          f.z);
      }

      void main() {
        // Pixel coverage, never a fraction of the triangle's world size.
        vec3 bw = max(fwidth(vBary), vec3(0.00001));
        vec3 edges = smoothstep(vec3(0.0), bw * uWireWidth, vBary);
        float wire = 1.0 - min(min(edges.x, edges.y), edges.z);

        float grain = max(bw.x, max(bw.y, bw.z));
        float detail = 1.0 - smoothstep(0.24, 0.65, grain);
        wire *= detail;
        vec3 softEdges = smoothstep(vec3(0.0), bw * (uWireWidth + 1.8), vBary);
        float wireGlow = (1.0 - min(min(softEdges.x, softEdges.y), softEdges.z)) * detail;

        vec3 n = normalize(vViewNormal);
        vec3 v = normalize(-vViewPos);
        float facing = 0.60 + 0.40 * pow(1.0 - abs(dot(n, v)), 2.0);

        float heightD = vWorldPos.y - uBandY;
        float radialD = length(vWorldPos - uOrigin) - uFrontR;
        float d = mix(heightD, radialD, uMode);
        // Parked at yTop under reduced-motion; evaluating the exponential
        // there would paint a lime cap on the machine.
        float coreWidth = max(uCoreWidth, fwidth(d) * 0.7);
        float core  = uSteady > 0.0 ? 0.0 : exp(-abs(d) / coreWidth) * uCoreWidth / coreWidth;
        // Height sweep trails above the descending line. Radial activation
        // trails inside the sphere — the mesh the front has already passed.
        float heightTrail = d > 0.0 ? exp(-d / uTrail) : 0.0;
        float radialTrail = d < 0.0 ? exp(d / uTrail) : 0.0;
        float trail = mix(heightTrail, radialTrail, uMode);
        if (uSpark > 0.001) {
          float spark = lgNoise(vWorldPos * 7.4 + vec3(uTime * 1.6, 0.0, uTime * 1.1));
          core *= 1.0 + uSpark * (spark * 0.85 - 0.12);
        }
        float ignite = uIgnite * exp(-length(vWorldPos - uOrigin) / 0.14);

        float probe = 0.0;
        // Screen-space, not a world point mapped onto the machine. The old
        // world probe parked on the frame from any pointer, so a cursor in
        // the corner still lit the cage. CSS NDC, y down, aspect-corrected
        // so the blob is circular and dies off the machine.
        if (uProbeAmp * uProbeLive > 0.001) {
          vec2 fragCss = vec2(
            gl_FragCoord.x / max(uViewport.x, 1.0) * 2.0 - 1.0,
            (0.5 - gl_FragCoord.y / max(uViewport.y, 1.0)) * 2.0
          );
          vec2 delta = fragCss - uPointer;
          delta.x *= uViewport.x / max(uViewport.y, 1.0);
          float lgDist = length(delta);
          float lgWob = lgNoise(vWorldPos * 2.1 + vec3(0.0, uTime * 0.22, uTime * 0.13));
          float lgR = uProbeRadius * (0.90 + 0.14 * lgWob);
          probe = (1.0 - smoothstep(lgR * ${CAGE_PROBE_SCREEN_INNER.toFixed(2)}, lgR, lgDist))
            * uProbeAmp * uProbeLive;
        }

        // Sweep amp scales the travelling fields only. The probe is already
        // its own amp, so a live cursor can hold a local patch between cycles.
        // Cursor blob is the gray reconstructed mesh. Idle lime is the
        // travelling core. Activation paints fill/lock/ignite with the
        // plant-green uniforms — no second scan line.
        float interior = uMode * step(0.0, -d);
        float grayWeight = max(
          trail * uBodyGain * uAmp + probe * uProbeGain + uLock + interior * uFill,
          uSteady * uBodyGain * uAmp
        );
        float limeWeight = (mix(core, 0.0, uMode) + ignite) * uCoreGain * uAmp;
        vec3 coreCol = mix(uCoreColor, uHotColor, uHot);
        // A faint optical skirt around each filament, in this same draw.
        // Grazing edges catch more light without filling the shell's faces.
        float filament = wire + wireGlow * 0.12;
        vec3 col = filament * facing * (uWireColor * grayWeight + coreCol * limeWeight);

        if (max(col.r, max(col.g, col.b)) < 0.0015) discard;

        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  })
}

function createGroundMaterial(): THREE.ShaderMaterial {
  const uniforms = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uAmp: { value: 0 },
    uWaveR: { value: 0 },
    uCoreWidth: { value: WAVE_CORE },
    uLift: { value: WAVE_LIFT },
    uWireColor: { value: WIRE_COLOR },
    uCoreColor: { value: CORE_COLOR },
    uWireWidth: { value: 0.95 },
    uMaxR: { value: WAVE_MAX_R },
    uWake: { value: 0.24 },
    // Held in the same neighbourhood as the cage. Double-sided additive on
    // a floor-sized disc was a white sheet; one face at cage gain is a read.
    uBodyGain: { value: 0.22 },
    uCoreGain: { value: 1.02 },
    uStem: { value: new THREE.Vector2() },
  }

  return new THREE.ShaderMaterial({
    name: 'LiftagHologramGround',
    uniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    fog: true,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -16,
    vertexShader: /* glsl */`
      uniform float uWaveR;
      uniform float uCoreWidth;
      uniform float uWake;
      uniform float uLift;
      uniform float uAmp;
      uniform vec2  uStem;
      attribute vec3 aBary;
      attribute float aKind;
      varying vec3 vBary;
      varying vec2 vWavePos;
      varying float vKind;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_vertex>

      void main() {
        // Local XZ is wave space: the mesh is planted on the machine's
        // centre, so length(position.xz - uStem) is metres from the ring
        // origin. Idle keeps uStem at zero; activation offsets it under
        // the sticker.
        vec3 pos = position;
        float r = length(pos.xz - uStem);
        float d = r - uWaveR;
        float core = exp(-abs(d) / uCoreWidth);
        // Raised only on the ring and its wake, so the dark interior
        // stays planted on the mat.
        float wake = d < 0.0 ? exp(d / max(uWake, 0.08)) : 0.0;
        pos.y += uLift * uAmp * (core + wake * 0.32);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vBary = aBary;
        vWavePos = pos.xz - uStem;
        vKind = aKind;
        vec4 mvPosition = viewMatrix * worldPos;
        vViewPos = mvPosition.xyz;
        vViewNormal = normalMatrix * vec3(0.0, 1.0, 0.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_Position.z -= ${WAVE_DEPTH_BIAS.toFixed(4)} * gl_Position.w;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uAmp;
      uniform float uWaveR;
      uniform float uCoreWidth;
      uniform vec3  uWireColor;
      uniform vec3  uCoreColor;
      uniform float uWireWidth;
      uniform float uMaxR;
      uniform float uWake;
      uniform float uBodyGain;
      uniform float uCoreGain;
      varying vec3 vBary;
      varying vec2 vWavePos;
      varying float vKind;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_fragment>

      void main() {
        // Interpolating vertex radii makes the front polygonal. Interpolate
        // position instead so even the cheap mesh has a circular scan front.
        float r = length(vWavePos);
        float d = r - uWaveR;
        float coreWidth = max(uCoreWidth, fwidth(r) * 0.7);
        // Derivatives must be evaluated before neighbouring fragments discard.
        vec3 bw = max(fwidth(vBary), vec3(0.00001));
        float wakeLen = max(uWake, 0.08);
        // Roots only exist as growth off the current front. Lighting them
        // a metre ahead planted a second circle with a gap in between.
        float ahead = vKind > 0.5 ? 0.58 : uCoreWidth * 4.2;
        float behind = vKind > 0.5 ? wakeLen * 1.35 : wakeLen * 1.85;
        if (d > ahead) discard;
        if (d < -behind) discard;

        float wire;
        if (vKind > 0.5) {
          // Filled tapering stroke. The ribbon is already a line; outlining
          // it would close it back into a triangle.
          vec3 e = smoothstep(vec3(0.0), bw * 1.15, vBary);
          wire = min(min(e.x, e.y), e.z);
        } else {
          float born = exp(-abs(d) / (uCoreWidth * 1.6));
          float widthMul = 1.0 + 0.22 * born;
          vec3 edges = smoothstep(vec3(0.0), bw * uWireWidth * widthMul, vBary);
          wire = 1.0 - min(min(edges.x, edges.y), edges.z);
          float grain = max(bw.x, max(bw.y, bw.z));
          wire *= 1.0 - smoothstep(0.24, 0.65, grain);
        }

        float far = smoothstep(uMaxR * 0.64, uMaxR, r);
        wire *= 1.0 - 0.22 * far;

        vec3 n = normalize(vViewNormal);
        vec3 v = normalize(-vViewPos);
        float facing = 0.62 + 0.38 * pow(1.0 - abs(dot(n, v)), 1.35);

        float core = exp(-abs(d) / coreWidth) * uCoreWidth / coreWidth;
        float halo = exp(-abs(d) / (uCoreWidth * 2.4));
        float inside = d < 0.0 ? 1.0 : 0.0;
        float trail = inside * exp(d / wakeLen);
        float rim = 1.0 - smoothstep(uMaxR * 0.86, uMaxR, r);
        // Lime is the travelling front (core + a thin halo). Wake, and the
        // roots growing off it, stay the room's cool white - those are a
        // reconstructed mesh, and lime on a metre of filaments would be
        // the second-machine flood again, just on the floor.
        float grayWeight = trail * uBodyGain;
        float limeWeight = core * uCoreGain + halo * 0.16;
        if (vKind > 0.5 && d > 0.0) {
          grayWeight = max(grayWeight, uCoreGain * 0.88 * exp(-d / 0.30));
        }

        vec3 col = wire * facing * rim * (uWireColor * grayWeight + uCoreColor * limeWeight);
        col *= uAmp * (1.0 - 0.24 * far);

        if (max(col.r, max(col.g, col.b)) < 0.0015) discard;

        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  })
}

export function createHologramShell(
  source: THREE.Object3D,
  opts: HologramOptions = {},
): HologramShell {
  const scale = opts.scale ?? 1.05
  const offset = opts.offset ?? 0.012
  const cheap = opts.cheap ?? false

  source.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(source)
  const centre = box.getCenter(new THREE.Vector3())

  const hx = (box.max.x - box.min.x) * 0.5
  const hz = (box.max.z - box.min.z) * 0.5
  // Kiss the longer sides of the footprint. min(hx, hz) started the ring
  // inside the base; the first metres of expansion were occluded, so the
  // floor's first readable frame was already a large circle - a hitch,
  // then a second motion. The hypot bounding circle sat out in empty
  // floor and opened a gap. The long half-extent is the silhouette the
  // descending line actually lands on.
  const stemR = Math.max(0.32, Math.max(hx, hz) * 0.98)

  const tag = new THREE.Vector3(PLACARD_REST.x, PLACARD_REST.y, PLACARD_REST.z)
  const corner = new THREE.Vector3()
  let activateMaxR = 0.9
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        activateMaxR = Math.max(activateMaxR, tag.distanceTo(corner.set(x, y, z)))
      }
    }
  }
  activateMaxR += 0.18

  const cageMat = createCageMaterial(offset)
  const groundMat = createGroundMaterial()
  const cageUniforms = cageMat.uniforms
  const groundUniforms = groundMat.uniforms
  const pointerUniform = cageUniforms.uPointer!.value as unknown as THREE.Vector2
  const viewportUniform = cageUniforms.uViewport!.value as unknown as THREE.Vector2
  const originUniform = cageUniforms.uOrigin!.value as unknown as THREE.Vector3
  const stemUniform = groundUniforms.uStem!.value as unknown as THREE.Vector2
  const wireColorUniform = cageUniforms.uWireColor!.value as THREE.Color
  const coreColorUniform = cageUniforms.uCoreColor!.value as THREE.Color
  const hotColorUniform = cageUniforms.uHotColor!.value as THREE.Color

  const object = new THREE.Group()
  object.name = 'LiftagHologram'

  const cage = new THREE.Group()
  cage.name = 'LiftagHologramCage'
  const inner = source.clone(true)
  inner.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry = wireGeometry(mesh.geometry)
    mesh.material = cageMat
    mesh.castShadow = false
    mesh.receiveShadow = false
  })
  cage.add(inner)
  // Scale about the machine's own centre: worldP = s*p + centre*(1 - s).
  cage.scale.setScalar(scale)
  cage.position.copy(centre).multiplyScalar(1 - scale)
  const cageRestY = cage.position.y
  object.add(cage)

  const ground = new THREE.Mesh(
    createShockwaveGeometry(
      stemR * 0.84,
      WAVE_MAX_R + 0.70,
      cheap ? 12 : 22,
      cheap ? 24 : 40,
    ),
    groundMat,
  )
  ground.name = 'LiftagHologramGround'
  ground.position.set(centre.x, 0.016, centre.z)
  ground.castShadow = false
  ground.receiveShadow = false
  ground.renderOrder = 2
  ground.frustumCulled = true
  object.add(ground)
  object.visible = false

  const yTop = box.max.y + 0.10
  const yBottom = box.min.y - 0.12
  const passOpts: HologramPassOpts = { yTop, yBottom, stemR, maxR: WAVE_MAX_R }
  const peelTime = Math.max(0, timeAtHeight(Y_CONTACT, yTop, yBottom) - PEEL)
  let altitude = 0

  function clearActivation(): void {
    cageUniforms.uMode!.value = 0
    cageUniforms.uFrontR!.value = 0
    cageUniforms.uLock!.value = 0
    cageUniforms.uIgnite!.value = 0
    cageUniforms.uSpark!.value = 0
    cageUniforms.uFill!.value = 0
    cageUniforms.uHot!.value = 0
    cageUniforms.uCoreWidth!.value = 0.022
    cageUniforms.uCoreGain!.value = CAGE_CORE_GAIN
    cageUniforms.uBodyGain!.value = CAGE_BODY_GAIN
    cageUniforms.uWireWidth!.value = 0.9
    wireColorUniform.copy(WIRE_COLOR)
    coreColorUniform.copy(CORE_COLOR)
    hotColorUniform.copy(HOT_COLOR)
    stemUniform.set(0, 0)
    groundUniforms.uMaxR!.value = WAVE_MAX_R
    groundUniforms.uLift!.value = WAVE_LIFT
    groundUniforms.uCoreWidth!.value = WAVE_CORE
    groundUniforms.uCoreGain!.value = 1.02
  }

  function writeProbe(probe: HologramProbe | undefined, envelope: number): number {
    const amp = probe?.amp ?? 0
    if (probe) {
      pointerUniform.set(probe.ndc.x, probe.ndc.y)
      viewportUniform.set(probe.viewport.x, probe.viewport.y)
      cageUniforms.uProbeRadius!.value = CAGE_PROBE_SCREEN_RADIUS
      // Envelope fades the blob with the scroll gate; amp itself is the
      // already-damped surface field, not a second pointer lerp.
      cageUniforms.uProbeAmp!.value = amp * envelope
      cageUniforms.uProbeLive!.value = probe.live
      cageUniforms.uTime!.value = probe.time
    } else {
      cageUniforms.uProbeAmp!.value = 0
      cageUniforms.uProbeLive!.value = 0
    }
    return amp
  }

  function update(
    elapsed: number,
    envelope: number,
    steady: boolean,
    probe?: HologramProbe,
  ): void {
    if (envelope <= 0.001) {
      object.visible = false
      cage.visible = false
      ground.visible = false
      return
    }

    clearActivation()
    const probeAmp = writeProbe(probe, envelope)
    // Draw uses live-gated amp so the idle 0.16 surface graze cannot keep
    // the cage submitted for the whole hologram window.
    const probeDraw = probeAmp * (probe?.live ?? 0)

    if (steady) {
      // Far below what a sweep peaks at. This is a permanent cage rather
      // than a passing one, and at sweep strength it competes with the
      // machine it is wrapped around instead of hinting at it. The splash
      // is motion; under reduced-motion it does not run. Core is zeroed
      // in the shader whenever uSteady > 0, so the parked band cannot
      // paint a lime cap.
      cageUniforms.uSteady!.value = 0.20
      cageUniforms.uBandY!.value = yTop + altitude
      cageUniforms.uAmp!.value = envelope
      cage.visible = cageShouldDraw({ envelope, cageAmp: 0, probeAmp: probeDraw, steady: true })
      ground.visible = false
      object.visible = cage.visible
      return
    }

    cageUniforms.uSteady!.value = 0
    const t = elapsed % PERIOD
    const pass = hologramPassAt(t, envelope, passOpts)

    cageUniforms.uBandY!.value = pass.bandY + altitude
    cageUniforms.uTrail!.value = pass.cageTrail
    cageUniforms.uAmp!.value = pass.cageAmp
    cage.visible = cageShouldDraw({
      envelope,
      cageAmp: pass.cageAmp,
      probeAmp: probeDraw,
      steady: false,
    })

    groundUniforms.uWaveR!.value = pass.waveR
    groundUniforms.uWake!.value = pass.wakeR
    groundUniforms.uAmp!.value = pass.groundAmp
    groundUniforms.uCoreGain!.value = 1.02
    ground.visible = pass.groundDraw

    object.visible = cage.visible || ground.visible
  }

  function updateActivation(
    t: number,
    envelope: number,
    origin: THREE.Vector3,
    time = 0,
  ): boolean {
    writeProbe(undefined, 0)
    const pass = hologramActivateAt(t, envelope, {
      maxR: activateMaxR,
      originY: origin.y,
      stemR,
      floorMaxR: ACTIVATE_FLOOR_MAX_R,
    })
    const live = pass.cageAmp > 0.002 || pass.groundAmp > 0.002
      || pass.lock > 0.002 || pass.ignite > 0.002 || pass.fill > 0.002
      || pass.tag > 0.002
    if (!live) {
      object.visible = false
      cage.visible = false
      ground.visible = false
      clearActivation()
      return false
    }

    cageUniforms.uSteady!.value = 0
    cageUniforms.uMode!.value = 1
    originUniform.copy(origin)
    cageUniforms.uFrontR!.value = pass.frontR
    cageUniforms.uTrail!.value = pass.cageTrail
    cageUniforms.uAmp!.value = pass.cageAmp
    cageUniforms.uCoreWidth!.value = pass.coreWidth
    cageUniforms.uLock!.value = pass.lock * CAGE_LOCK_GAIN * 1.15
    cageUniforms.uIgnite!.value = pass.ignite
    cageUniforms.uSpark!.value = pass.spark
    cageUniforms.uFill!.value = pass.fill * CAGE_FILL_GAIN * 1.45
    cageUniforms.uHot!.value = pass.hot
    cageUniforms.uCoreGain!.value = 1.02
    cageUniforms.uBodyGain!.value = CAGE_BODY_GAIN * 1.55
    cageUniforms.uWireWidth!.value = 1.08
    wireColorUniform.copy(ACTIVATE_COLOR)
    coreColorUniform.copy(ACTIVATE_COLOR)
    hotColorUniform.copy(ACTIVATE_HOT_COLOR)
    cageUniforms.uTime!.value = time
    cageUniforms.uBandY!.value = yTop + altitude
    cage.visible = cageShouldDraw({
      envelope,
      cageAmp: pass.cageAmp + pass.lock + pass.ignite + pass.fill,
      probeAmp: 0,
      steady: false,
    })

    stemUniform.set(origin.x - centre.x, origin.z - centre.z)
    groundUniforms.uAmp!.value = 0
    ground.visible = false

    object.visible = cage.visible || ground.visible
    return object.visible
  }

  function setAltitude(y: number): void {
    altitude = y
    cage.position.y = cageRestY + y
  }

  return {
    object,
    update,
    updateActivation,
    setAltitude,
    peelTime,
    stemR,
    maxR: WAVE_MAX_R,
  }
}
