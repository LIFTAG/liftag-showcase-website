// The release liner on the back of the card, and the thing that gets pulled
// off it.
//
// It is on the back because that is where a sticker's protective film is: over
// the adhesive, not over the print. Taking it off is the last thing you do
// before the tag goes on the machine, and that is the gesture this layer
// exists for - not decoration, but the beat that says the sticker is new and
// is being applied right now.
//
// Being on the back is also why it is worth having at all. The antenna is on
// that same face, so the liner is the thing lying over the inlay while the
// card is turned over, and pulling it off is the reveal: one action that
// uncovers the hardware and arms the adhesive at the same time. A liner is
// translucent, so the coil reads through it before the pull as well as after -
// it just goes from seen-through-plastic to seen.
//
// Deliberately not `transmission`. A physically transmissive film needs its
// own render target and a second pass over the scene, for a layer that is on
// screen for a second and a half and whose entire read is *specular*: a clear
// film is invisible except where it catches a light, and doubly so once it
// curls, because the curl is what turns a flat highlight into a moving one.
// So this is a thin, mostly-transparent dielectric, and the shader below adds
// the two things a clear film does that a flat quad will not:
//
//   - the fold catches the key as a hard bright line, because at the fold the
//     surface sweeps through every angle at once;
//   - the rolled material goes milkier than the flat material, because a
//     curled film is being seen through twice and at a grazing angle.
//
// Iridescence stays, but only on that fold. Across the unpeeled back it is a
// Newton's-ring cone on the antenna; on the roll, one rainbow per winding.
//
// Without those the peel reads as a rectangle fading out. With them it reads
// as plastic.
import * as THREE from 'three'
import { patchPeelVertex, type PeelUniforms } from './peel.ts'

export interface FoilUniforms {
  /** Global fade. 0 once the roll has left frame. */
  uFoilOpacity: { value: number }
  uFoilTime: { value: number }
  /** Card half-extents in plane metres, for normalising the sweep. */
  uFoilHalf: { value: THREE.Vector2 }
  /** Die-cut corner radius, metres. Must match the print's. */
  uFoilRound: { value: number }
}

export function createFoilUniforms(halfW: number, halfH: number, round: number): FoilUniforms {
  return {
    uFoilOpacity: { value: 0 },
    uFoilTime: { value: 0 },
    uFoilHalf: { value: new THREE.Vector2(halfW, halfH) },
    uFoilRound: { value: round },
  }
}

export function createFoilMaterial(
  uniforms: FoilUniforms,
  peel: PeelUniforms,
): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    // Nearly black albedo, which is what a clear laminate has: everything you
    // see of one is specular. A white base under the 0C key turned the roll
    // into a sheet of paper brighter than the print it had just come off.
    color: 0x141820,
    // Silicone-coated liner, not a polish. At 0.07 the 0C key and the room
    // strips both stamped a hard cone onto the antenna; 0.20 still did, once
    // iridescence and clearcoat stacked a second lobe on the same highlight.
    // Hazy enough that the flat back is a sheen, not a lamp.
    roughness: 0.34,
    metalness: 0.0,
    // Dielectric response is pulled down so the key cannot paint a specular
    // disc on the unpeeled back. The fold still reads because it is emissive.
    specularIntensity: 0.32,
    // Thin-film colour is gated to the fold in the shader. Left on across the
    // plane, a close spot turns this into Newton's rings - a cone of light
    // sitting on the coil the beat is supposed to show.
    iridescence: 1.0,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [200, 680],
    envMapIntensity: 0.20,
    transparent: true,
    opacity: 1,
    // Outside the die the fragment is exactly clear, and a depth-writing
    // transparent material would still stamp those pixels into the buffer.
    // Low enough that it only ever catches that region: the flat body of the
    // liner sits an order of magnitude above it.
    alphaTest: 0.002,
    // Depth-written so the free end of the curl, which does pass over liner
    // still flat on the card, occludes instead of blending into a milky slab.
    // Inner windings of the spiral are made opaque enough below that this
    // write actually hides them.
    depthWrite: true,
    side: THREE.DoubleSide,
  })

  material.onBeforeCompile = (shader) => {
    patchPeelVertex(shader, peel)
    Object.assign(shader.uniforms, uniforms)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform float uFoilOpacity;
        uniform float uFoilTime;
        uniform vec2 uFoilHalf;
        uniform float uFoilRound;
      `)
      .replace('#include <color_fragment>', /* glsl */`
        #include <color_fragment>

        // The liner is cut to the same die as the print. Without this the
        // laminate is a rectangle over a rounded card, and its square corners
        // stand outside the sticker's silhouette - which is exactly where the
        // eye looks to decide whether two layers are the same object.
        vec2 lgQ = abs(vLgPlane) - (uFoilHalf - vec2(uFoilRound));
        float lgCut = length(max(lgQ, 0.0)) + min(max(lgQ.x, lgQ.y), 0.0) - uFoilRound;
        float lgDie = 1.0 - smoothstep(-0.0004, 0.0004, lgCut);

        // One sheet, not a glass tube. After the film has actually left the
        // plane, the geometric back is the inner wall of the curl - the extra
        // highlight sitting inside the roll. The unpeeled back is that same
        // geometric back at turn 0, so it has to stay; only the wound inner
        // wall goes.
        if (!gl_FrontFacing && vLgTurn > 0.35) discard;
        // And not a spiral of four more sheets. The liner is 22 cm; wound that
        // is several turns, and end-on every turn's cut edge stacks as a
        // frayed brush of shine. Keep the outer winding (the fold and the
        // film just onto the roll) and let the core vanish - the radius is
        // still sized for all of it, so the curl stays fat, it just stops
        // drawing the windings you would see through.
        if (vLgTurn > 8.6) discard;

        // How far this fragment is round the roll. Flat liner is nearly clear;
        // the curl is looked through twice, so it thickens up - but only just.
        // A laminate liner is not paper: everything the peel reads by is its
        // edges and its highlights, not the body of the sheet. 0.55 of body
        // on the curl painted the free end as a sheet of dark vinyl, opaque
        // against the gym and over the antenna it had just come off.
        float lgCurl = smoothstep(0.0, 0.42, vLgTurn);
        // The fold itself: a hard line, one or two millimetres wide, where the
        // surface is turning through the whole highlight at once.
        float lgFold = exp(-vLgTurn * 7.0) * step(1e-4, vLgTurn);
        // The cut edge of the sheet. This is the single most important line in
        // the beat: a clear film lying flat on a print is invisible except for
        // the bright rim around its outline, and without that rim there is
        // nothing on screen to say a liner is there at all until it lifts - so
        // the peel starts from something the eye never knew existed.
        float lgEdge = exp(-abs(lgCut) / 0.0019);
        // Inside the roll. Past about a third of a turn the fragment is no
        // longer the sheet you are pulling: it is the core. A real liner is
        // bright at the fold and dull in the windings; leaving those windings
        // as a second, third, fourth copy of the same specular / rim / band
        // is what made the peel read as stacked shine.
        float lgInner = smoothstep(0.45, 1.85, vLgTurn);
        float lgDeep = exp(-max(vLgTurn - 0.28, 0.0) * 2.8);
        diffuseColor.a *= uFoilOpacity * lgDie
          * (0.045 + 0.10 * lgCurl * (1.0 - 0.45 * lgInner) + 0.45 * lgFold
             + 0.50 * lgEdge * lgDeep)
          * (1.0 - smoothstep(5.4, 8.6, vLgTurn));
        // A hint of density in the core, not a grey plug. The camera sits
        // close to axial on this roll, so inner-winding alpha is the whole
        // unpeeled read - 0.58 of frost there was a tube of tape.
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.10, 0.11, 0.13), lgInner * 0.35);
        diffuseColor.a = min(diffuseColor.a + lgInner * 0.10 * uFoilOpacity * lgDie, 0.32);
      `)
      .replace('#include <roughnessmap_fragment>', /* glsl */`
        #include <roughnessmap_fragment>
        // Curl too: a sharp spec on film that has left the focus rect
        // becomes stacked bokeh ghosts, which is the other half of
        // "many layers of shine".
        roughnessFactor = mix(roughnessFactor, 0.56, max(lgInner * 0.55, lgCurl * 0.28));
      `)
      .replace('#include <lights_physical_fragment>', /* glsl */`
        #include <lights_physical_fragment>
        #ifdef USE_IRIDESCENCE
          // Fold only. On the flat back this is a cone; on inner windings it
          // is one rainbow per turn.
          material.iridescence *= lgFold;
        #endif
        float lgDull = max(lgInner, lgCurl * 0.75);
        material.specularColor *= mix(1.0, 0.06, lgDull);
        material.specularF90 *= mix(1.0, 0.06, lgDull);
      `)
      .replace('#include <emissivemap_fragment>', /* glsl */`
        #include <emissivemap_fragment>

        // Grazing angles. A transparent tube has no shading of its own; what
        // gives it a form is that it goes opaque where you are looking along
        // its surface, and this is the term that does it. Held down on the
        // flat sheet so a facing card does not milk over the antenna.
        float lgFres = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0);
        diffuseColor.a = min(
          diffuseColor.a + lgDie * lgFres * mix(0.16, 0.28, lgCurl) * (1.0 - lgInner) * uFoilOpacity,
          0.72
        );

        vec2 lgPerp = vec2(-uPeelAxis.y, uPeelAxis.x);
        float lgAcross = dot(vLgPlane / max(uFoilHalf.x, 1e-4), lgPerp) * 0.5 + 0.5;
        float lgSweep = fract(uFoilTime * 0.21);
        // Three Gaussians, not three highlights: the +/-1 copies are the wrap,
        // so the band leaving one edge is the same band arriving at the other.
        float lgBand = exp(-pow(lgAcross - lgSweep, 2.0) * 90.0)
                     + exp(-pow(lgAcross - lgSweep + 1.0, 2.0) * 90.0)
                     + exp(-pow(lgAcross - lgSweep - 1.0, 2.0) * 90.0);
        // Travelling shine lives on the lifting film only. On the flat back it
        // was a moving streak across the coil; on the roll, one copy per
        // winding. Outer third of a turn, then gone.
        float lgLive = smoothstep(0.02, 0.16, vLgTurn) * lgDeep;
        totalEmissiveRadiance += vec3(0.62, 0.68, 0.82) * lgBand * lgLive * 0.016 * uFoilOpacity * lgDie;
        // The fold line reads as light, not as geometry, so it is stated here
        // rather than left to the lighting - at this radius there is not a
        // pixel of it wide enough for a specular lobe to land on. Kept dim:
        // past the card it sits in the 0C bokeh, and a bright fold there is
        // a fan of ghosts.
        totalEmissiveRadiance += vec3(0.80, 0.86, 1.00) * lgFold * 0.09 * uFoilOpacity * lgDie;
        // The cut edge, outermost only. Inner rims stacking end-on were the
        // other half of the "many layers of shine".
        totalEmissiveRadiance += vec3(0.72, 0.80, 0.95) * lgEdge * lgDeep * 0.035 * uFoilOpacity * lgDie;
      `)
  }
  material.customProgramCacheKey = () => 'liftag-qr-foil-v14'

  return material
}
