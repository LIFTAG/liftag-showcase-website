// The machine's hologram exoskeleton, and the floor shockwave it becomes.
//
// A second, slightly larger copy of the hero machine drawn as its own
// triangulation - thin outlines, one per triangle, nothing filled - that a
// bright horizontal line sweeps top-to-bottom through at a fixed cadence. It
// is the system's *read* of the machine made visible: the line kicks down,
// the mesh resolves behind it, and both leave together.
//
// When the line reaches the ground it does not stop. The same energy peels
// off the machine's feet as a circular shockwave of triangle outlines, the
// floor's own wire read, expanding with the same kick the line arrived on.
// The two share a clock and a colour so the splash reads as the sweep
// continuing, not as a second effect.
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
// It is deliberately colourless - the room's own cool white, not lime. Lime
// was tried and it turned the whole shot green: at this scale the shell is not
// an accent, it is a second machine, and a second machine's worth of brand
// colour is far past what this palette will carry.
import * as THREE from 'three'
import {
  hologramPassAt,
  PEEL,
  PERIOD,
  TRAIL,
  timeAtHeight,
  Y_CONTACT,
  type HologramPassOpts,
} from './hologramPass'

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
}

export interface HologramShell {
  object: THREE.Object3D
  /**
   * @param elapsed  seconds since the stage started
   * @param envelope 0..1 scroll gate; at 0 the shell is not drawn at all
   * @param steady   when true the sweep is replaced by a constant faint shell
   */
  update(elapsed: number, envelope: number, steady: boolean): void
  /**
   * Lift the cage with the machine during the entry drop. The floor wave
   * stays on the mat - it is a read of the ground, not of the falling mesh.
   * The sweep band rides with the cage so the line stays on the falling
   * mesh rather than painting rest-pose coordinates in empty air.
   */
  setAltitude(y: number): void
  /** Seconds into a pass at which the floor ring starts travelling. */
  readonly peelTime: number
}

const WIRE_COLOR = new THREE.Color(0.62, 0.80, 1.0)
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
function createShockwaveGeometry(innerR: number, outerR: number): THREE.BufferGeometry {
  const rings = 22
  const segments = 40
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
    uWireWidth: { value: 0.9 },
    uBodyGain: { value: 0.14 },
    uCoreGain: { value: 0.95 },
  }

  return new THREE.ShaderMaterial({
    name: 'LiftagHologramShell',
    uniforms,
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
      uniform float uWireWidth;
      uniform float uBodyGain;
      uniform float uCoreGain;
      varying vec3 vBary;
      varying vec3 vWorldPos;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_fragment>

      void main() {
        vec3 bw = fwidth(vBary);
        vec3 edges = smoothstep(vec3(0.0), bw * uWireWidth, vBary);
        float wire = 1.0 - min(min(edges.x, edges.y), edges.z);

        float grain = max(bw.x, max(bw.y, bw.z));
        wire *= 1.0 - smoothstep(0.16, 0.42, grain);

        vec3 n = normalize(vViewNormal);
        vec3 v = normalize(-vViewPos);
        float facing = 0.60 + 0.40 * pow(1.0 - abs(dot(n, v)), 2.0);

        float d = vWorldPos.y - uBandY;
        float core  = exp(-abs(d) / uCoreWidth);
        float trail = d > 0.0 ? exp(-d / uTrail) : 0.0;
        float body  = max(trail, uSteady);

        vec3 col = uWireColor * wire * facing * (body * uBodyGain + core * uCoreGain);
        col *= uAmp;

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
    uWireWidth: { value: 0.95 },
    uMaxR: { value: WAVE_MAX_R },
    uWake: { value: 0.24 },
    // Held in the same neighbourhood as the cage. Double-sided additive on
    // a floor-sized disc was a white sheet; one face at cage gain is a read.
    uBodyGain: { value: 0.22 },
    uCoreGain: { value: 1.02 },
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
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -16,
    vertexShader: /* glsl */`
      uniform float uWaveR;
      uniform float uCoreWidth;
      uniform float uWake;
      uniform float uLift;
      uniform float uAmp;
      attribute vec3 aBary;
      attribute float aKind;
      varying vec3 vBary;
      varying float vRadius;
      varying float vKind;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_vertex>

      void main() {
        // Local XZ is wave space: the mesh is planted on the machine's
        // centre, so length(position.xz) is metres from the stem.
        vec3 pos = position;
        float r = length(pos.xz);
        float d = r - uWaveR;
        float core = exp(-abs(d) / uCoreWidth);
        // Raised only on the ring and its wake, so the dark interior
        // stays planted on the mat.
        float wake = d < 0.0 ? exp(d / max(uWake, 0.08)) : 0.0;
        pos.y += uLift * uAmp * (core + wake * 0.32);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vBary = aBary;
        vRadius = r;
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
      uniform float uWireWidth;
      uniform float uMaxR;
      uniform float uWake;
      uniform float uBodyGain;
      uniform float uCoreGain;
      varying vec3 vBary;
      varying float vRadius;
      varying float vKind;
      varying vec3 vViewNormal;
      varying vec3 vViewPos;
      #include <fog_pars_fragment>

      void main() {
        float r = vRadius;
        float d = r - uWaveR;
        float wakeLen = max(uWake, 0.08);
        // Roots only exist as growth off the current front. Lighting them
        // a metre ahead planted a second circle with a gap in between.
        float ahead = vKind > 0.5 ? 0.58 : uCoreWidth * 4.2;
        float behind = vKind > 0.5 ? wakeLen * 1.35 : wakeLen * 1.85;
        if (d > ahead) discard;
        if (d < -behind) discard;

        vec3 bw = fwidth(vBary);
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
          wire *= 1.0 - smoothstep(0.14, 0.36, grain);
        }

        float far = smoothstep(uMaxR * 0.64, uMaxR, r);
        wire *= 1.0 - 0.22 * far;

        vec3 n = normalize(vViewNormal);
        vec3 v = normalize(-vViewPos);
        float facing = 0.62 + 0.38 * pow(1.0 - abs(dot(n, v)), 1.35);

        float core = exp(-abs(d) / uCoreWidth);
        float halo = exp(-abs(d) / (uCoreWidth * 2.4));
        float inside = d < 0.0 ? 1.0 : 0.0;
        float trail = inside * exp(d / wakeLen);
        float rim = 1.0 - smoothstep(uMaxR * 0.86, uMaxR, r);
        float body = trail * uBodyGain + core * uCoreGain + halo * 0.16;
        // Filaments fade along their length in front of the ring.
        if (vKind > 0.5 && d > 0.0) {
          body = max(body, uCoreGain * 0.88 * exp(-d / 0.30));
        }

        vec3 col = uWireColor * wire * facing * rim * body;
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

  const cageMat = createCageMaterial(offset)
  const groundMat = createGroundMaterial()
  const cageUniforms = cageMat.uniforms
  const groundUniforms = groundMat.uniforms

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
    createShockwaveGeometry(stemR * 0.84, WAVE_MAX_R + 0.70),
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

  function update(elapsed: number, envelope: number, steady: boolean): void {
    if (envelope <= 0.001) {
      object.visible = false
      cage.visible = false
      return
    }

    if (steady) {
      // Far below what a sweep peaks at. This is a permanent cage rather
      // than a passing one, and at sweep strength it competes with the
      // machine it is wrapped around instead of hinting at it. The splash
      // is motion; under reduced-motion it does not run.
      cageUniforms.uSteady!.value = 0.20
      cageUniforms.uBandY!.value = yTop + altitude
      cageUniforms.uAmp!.value = envelope
      cage.visible = true
      ground.visible = false
      object.visible = true
      return
    }

    cageUniforms.uSteady!.value = 0
    const t = elapsed % PERIOD
    const pass = hologramPassAt(t, envelope, passOpts)

    cageUniforms.uBandY!.value = pass.bandY + altitude
    cageUniforms.uTrail!.value = pass.cageTrail
    cageUniforms.uAmp!.value = pass.cageAmp
    cage.visible = pass.cageAmp > 0.002

    groundUniforms.uWaveR!.value = pass.waveR
    groundUniforms.uWake!.value = pass.wakeR
    groundUniforms.uAmp!.value = pass.groundAmp
    ground.visible = pass.groundDraw

    object.visible = cage.visible || ground.visible
  }

  function setAltitude(y: number): void {
    altitude = y
    cage.position.y = cageRestY + y
  }

  return { object, update, setAltitude, peelTime }
}
