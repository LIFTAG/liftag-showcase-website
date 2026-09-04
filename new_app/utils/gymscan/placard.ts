// The QR sticker on the hero machine's front crossbeam.
//
// It used to be two procedurally drawn canvases - a brushed metal sign blank
// with a fake QR block on the left and an etched text panel on the right - lit
// by nothing, because the plate had to be able to read as a light source once
// LIFTAG locked onto it. Both are gone. The tag is now the real printed
// artwork, and the text panel went with it: the sticker already carries the
// wordmark and the machine name, and a second copy of the same information in
// a different typeface beside it was a sign pretending to be a sticker.
//
// The important consequence is that it is now **lit by the room** rather than
// drawn at a brightness of its own. A vinyl sticker in a near-black gym is a
// dim, matte, slightly sheeny rectangle, and that is what a real one looks
// like on a machine nobody has pointed a light at. So the base is an ordinary
// `MeshStandardMaterial` carrying the artwork, and the analysis is added on top
// of the lit result through `onBeforeCompile` - the same arrangement the
// machine's own surfaces use, for the same reason.
//
// The exception is Act 0C, where the card is held up to the lens as a product
// shot. A tag lit only by a gym ceiling six metres behind it is a grey
// rectangle at that distance, so `uShow` adds a soft key of its own, keyed to
// the surface normal so the bend and the curl still shade. `stage.ts` also
// puts a real spot on the card for that beat; this is the fill that makes the
// print legible, not a replacement for it.
//
// What the analysis adds is *emission from the print itself*: as LIFTAG
// resolves the code, the light areas of the tag light up, module by module,
// keyed to a grid matching the artwork's own 12-pixel module pitch. The dark
// modules stay dark, which is what makes it read as a code being decoded
// rather than a panel being switched on.
import * as THREE from 'three'
import { patchPeelVertex, type PeelUniforms } from './peel.ts'

/** Source artwork: 827 x 874 with a 12 px QR module, so 69 x 73 modules across. */
const MODULES_X = 68.9
const MODULES_Y = 72.8

export interface PlacardUniforms {
  uReveal: { value: number }
  uResolve: { value: number }
  uLock: { value: number }
  /** 0–1 showcase key, on only while the card is held up to the lens in 0C. */
  uShow: { value: number }
  /** 0–1 squeegee line riding the 0D bend front as the vinyl is pushed flat. */
  uSqueegee: { value: number }
}

export function createPlacardUniforms(): PlacardUniforms {
  return {
    uReveal: { value: 0 },
    uResolve: { value: 0 },
    uLock: { value: 0 },
    uShow: { value: 0 },
    uSqueegee: { value: 0 },
  }
}

/**
 * Build the sticker material.
 *
 * `map` is the printed artwork and does the ordinary PBR job. Roughness is set
 * for laminated vinyl rather than paper - a gym tag is wiped down, so it holds
 * a broad soft sheen, and that sheen is most of what tells the eye it is a
 * sticker on a surface rather than a texture painted onto one.
 *
 * `peel` is shared with the card's other two layers, so the print, the inlay
 * behind it and the film in front of it all roll on the same fold line.
 */
export function createPlacardMaterial(
  map: THREE.Texture,
  uniforms: PlacardUniforms,
  peel: PeelUniforms,
): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.48,
    metalness: 0.0,
    // Laminated vinyl: a broad sheen, not a travelling spec. Sheen 0.48 at
    // roughness 0.38 plus the default env intensity flashed the print every
    // time a ceiling strip crossed the lobe — bright for a frame, then the
    // close-up (square-on, no Fresnel) went grey. Keep the sticker-not-paint
    // read; kill the lamp.
    sheen: 0.20,
    sheenColor: new THREE.Color(0xe6dfd0),
    sheenRoughness: 0.70,
    specularIntensity: 0.42,
    envMapIntensity: 0.28,
    // The artwork's rounded corners live in its alpha. alphaTest drops the
    // fully clear region early; `transparent` is what keeps the arc itself
    // smooth, since an alpha-tested edge gets no coverage from MSAA.
    transparent: true,
    alphaTest: 0.02,
    depthWrite: true,
  })

  material.onBeforeCompile = (shader) => {
    patchPeelVertex(shader, peel)
    Object.assign(shader.uniforms, uniforms)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform float uReveal;
        uniform float uResolve;
        uniform float uLock;
        uniform float uShow;
        uniform float uSqueegee;

        float lgTagHash(vec2 p) {
          p = fract(p * vec2(127.1, 311.7));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }
      `)
      // After the emissive map so this rides the normal lighting path - it is
      // added to outgoingLight with everything else, and picks up fog on the
      // way out rather than sitting on top of the frame. It is also after
      // <normal_fragment_begin>, so `normal` is the view-space shading normal
      // the peel wrote - which is what lets uShow shade the curl.
      .replace('#include <emissivemap_fragment>', /* glsl */`
        #include <emissivemap_fragment>

        // The texture unit has already taken the artwork out of sRGB, so this
        // is linear: white print is 1.0, the dark modules are ~0.
        vec4 lgTag = texture2D(map, vMapUv);
        float lgLumi = dot(lgTag.rgb, vec3(0.2126, 0.7152, 0.0722));
        // Only the near-white print emits, and the threshold has to be this
        // high: the artwork carries a soft glow printed *around* the code
        // panel and behind the wordmark, and at a lower threshold that glow
        // emits too - which is a halo the size of the tag hanging in the air
        // around it, not a code being read.
        float lgLight = smoothstep(0.50, 0.82, lgLumi);

        // Per-module dissolve: each module crosses its own threshold as the
        // resolve ramps, so the code appears to snap into legibility the way a
        // camera locking focus does, rather than the whole block cross-fading.
        float lgSeed = lgTagHash(floor(vMapUv * vec2(${MODULES_X.toFixed(1)}, ${MODULES_Y.toFixed(1)})));
        float lgAppear = smoothstep(lgSeed - 0.30, lgSeed + 0.06, uResolve);

        // Emitted in the print's *own* colour rather than a flat white. The
        // panel is overwhelmingly white so the shot's colour temperature is
        // unaffected; what it buys is that the wordmark and the centre logo
        // come up lime, which is the one place in this scene where lime means
        // "LIFTAG" rather than "something is happening".
        // Peaks around a quarter of white. It reads as a tag being read, not
        // as a lamp: the first pass at this ran the panel to ~1.0, which put
        // the single brightest object in the whole sequence on a sticker in a
        // room whose entire premise is that nothing in it is lit.
        totalEmissiveRadiance += lgTag.rgb * lgLight * lgAppear
          * (0.02 + 0.22 * uResolve) * (0.60 + 0.40 * uLock);

        // A small frontal lift as the camera closes, standing in for the phone
        // the sequence is claiming is pointed at this thing. Kept well below
        // the resolve emission so the lock still reads as the code coming up,
        // not as the plate turning into a lamp.
        totalEmissiveRadiance += lgTag.rgb * uReveal * 0.028;

        // 0C fill. The real spot does the form; this is only enough wrap that
        // a face-on print is not a grey page. A 0.50 Lambert + ungated rim
        // stacked with the spot put the white print over bloom threshold —
        // a lamp in close-up, and a white blade the frame the card went
        // edge-on. Rim is gated to the curl so a flat turn does not glow.
        if (uShow > 0.001) {
          vec3 lgKey = normalize(vec3(-0.28, 0.48, 0.82));
          float lgLam = max(dot(normal, lgKey), 0.0);
          float lgRim = pow(1.0 - abs(normal.z), 3.0) * smoothstep(0.02, 0.18, vLgTurn);
          totalEmissiveRadiance += lgTag.rgb * uShow * (0.05 + 0.14 * lgLam);
          totalEmissiveRadiance += vec3(0.58, 0.66, 0.82) * uShow * lgRim * 0.06;
        }

        // 0D squeegee: the bright line of trapped air being pushed out ahead
        // of the fold as the vinyl is rolled flat from the corner. It rides
        // uPeelFront, so it is the same line the geometry is bending on
        // rather than a second effect that has to be kept in sync with it.
        if (uSqueegee > 0.001) {
          float lgS = dot(vLgPlane, uPeelAxis);
          float lgSeam = exp(-abs(lgS - uPeelFront) / 0.0055);
          totalEmissiveRadiance += vec3(0.30, 0.34, 0.40) * lgSeam * uSqueegee * 0.10;
        }
      `)
      .replace('#include <lights_physical_fragment>', /* glsl */`
        #include <lights_physical_fragment>
        // A 0.15 mm card seen edge-on is a line of grazing fragments. Fresnel
        // at that angle plus the close key is what bloomed into a white blade
        // for the two frames of the revolution.
        float lgGraze = pow(1.0 - abs(normal.z), 4.0);
        material.specularColor *= mix(1.0, 0.10, lgGraze);
        material.specularF90 *= mix(1.0, 0.10, lgGraze);
      `)
  }
  // The injected block changes with nothing at runtime, so one cache key for
  // the whole material is correct - but it must not collide with an
  // un-injected MeshStandardMaterial sharing the same defines.
  material.customProgramCacheKey = () => 'liftag-qr-sticker-v5'

  return material
}
