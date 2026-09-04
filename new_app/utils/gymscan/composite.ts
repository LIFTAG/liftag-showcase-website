// Final composite for the hero - and the output pass.
//
// It ends with AgX and an sRGB OETF instead of handing an HDR buffer to a
// separate OutputPass. That pass did nothing but tone map and encode, and
// paying a whole full-screen round trip for it is expensive here: the
// composer's buffers carry 4x MSAA, so a pass that writes one costs four
// samples per pixel of a half-float target and a resolve, for a full-screen
// quad that has no edges to antialias. Measured, folding it in here was worth
// about 3 ms at 2160x1350.
//
// AgX is called explicitly rather than via <tonemapping_fragment>. three only
// defines TONE_MAPPING when the current target is the drawing buffer, and this
// pass also writes to the overlay's RT.
//
// The consequence is that **this must stay the last pass in the chain**.
// Anything added after it would receive tone-mapped, display-encoded pixels
// where it expects linear ones.
//
// Besides the usual dark-room grade (vignette, dither, a touch of radial
// aberration) this pass owns the scroll transition's key trick: instead of
// cutting from a 3D section to a DOM hero, the whole rendered frame is folded
// into a rounded rectangle that lands exactly where the DOM phone bezel sits.
// The scene never stops rendering - it simply becomes the phone's screen, which
// is what makes the hand-off read as one continuous shot.
//
// The fold is a *cover* remap, not a squash: as the target rect narrows, the
// pass samples a correspondingly narrower slice of the scene, so the machine
// keeps its proportions all the way into the phone.
export const CompositeShader = {
  name: 'LiftagCompositeShader',
  // Tap count of the 0C bokeh disc. A constant, because a GLSL loop bound has
  // to be one; `stage.ts` halves it on coarse pointers before the first
  // compile, which is the only place it is allowed to change.
  defines: {
    LG_BOKEH_TAPS: 16,
  },
  uniforms: {
    tDiffuse: { value: null as unknown },
    uRect: { value: [0.5, 0.5, 0.5, 0.5] },
    uRadius: { value: 0.0 },
    uFold: { value: 0.0 },
    uAspect: { value: 1.7778 },
    uVignette: { value: 1.0 },
    uDither: { value: 0.003 },
    uAberration: { value: 1.0 },
    uSceneFade: { value: 1.0 },
    uEdge: { value: [0.82, 0.89, 1.0] },
    /** 0C close-up bokeh amount. 0 outside the fly. */
    uDof: { value: 0.0 },
    /** UV centre + half-extents of the sharp card. */
    uFocusRect: { value: [0.5, 0.5, 0.16, 0.22] },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec4  uRect;
    uniform float uRadius;
    uniform float uFold;
    uniform float uAspect;
    uniform float uVignette;
    uniform float uDither;
    uniform float uAberration;
    uniform float uSceneFade;
    uniform vec3  uEdge;
    uniform float uDof;
    uniform vec4  uFocusRect;
    varying vec2 vUv;

    // Must live at global scope: the pars declare uniforms and helper
    // functions. Inside main() that is a compile error (uniform in a block).
    // toneMapped is forced off on this pass so the prefix does not also
    // inject these, which would redefine AgX. See the note at the end of main.
    #include <tonemapping_pars_fragment>

    float hash21(vec2 p) {
      p = fract(p * vec2(233.34, 851.73));
      p += dot(p, p + 23.45);
      return fract(p.x * p.y);
    }

    void main() {
      // Position inside the target rect, 0..1.
      vec2 local = (vUv - uRect.xy) / uRect.zw * 0.5 + 0.5;

      // Cover-fit: sample a slice of the scene whose aspect matches the rect.
      float rectAspect = (uRect.z * uAspect) / max(uRect.w, 1e-5);
      vec2 fit = vec2(min(rectAspect / uAspect, 1.0), min(uAspect / max(rectAspect, 1e-5), 1.0));
      vec2 sceneUv = 0.5 + (local - 0.5) * fit;

      vec2 dir = local - 0.5;
      // Halved once the surfaces carried their own texture. Aberration this
      // strong is only invisible on smooth gradients; over the floor's grain
      // it separated into coloured sparkle at the frame edges.
      float amt = uAberration * (0.0004 + 0.0028 * dot(dir, dir));
      vec3 col;
      col.r = texture2D(tDiffuse, sceneUv + dir * amt).r;
      col.g = texture2D(tDiffuse, sceneUv).g;
      col.b = texture2D(tDiffuse, sceneUv - dir * amt).b;

      // 0C close-up: a real lens, not a mip fade.
      //
      // A mip lookup is a *smear*: it averages a square of texels, so a bright
      // point in the background comes back as a soft square that grows dimmer
      // as it grows. A fast lens does the opposite - it spreads that point
      // over a disc of near-constant brightness, and it is those discs, not
      // the softness, that read as expensive glass.
      //
      // So the background is gathered from a golden-angle disc instead. Two
      // details do the work:
      //
      //   - the taps are weighted by their own luminance, so a highlight
      //     dominates its disc and comes back as a bokeh ball rather than
      //     being averaged into grey;
      //   - the x offset is divided by the aspect ratio, so the disc is round
      //     on screen. An unscaled UV disc is an ellipse, which is the tell
      //     that a blur was done in texture space.
      //
      // The mip level still rises with the circle of confusion, but only to
      // keep the disc from undersampling at its widest - the taps, not the
      // mip, are the blur. Cost returns to zero as soon as uDof closes.
      if (uDof > 0.001) {
        // Measured in units of screen *height*, both axes. In raw UV a step of
        // 0.13 across is nearly twice the distance it is up, so an isotropic
        // falloff written in UV comes out as an ellipse - the background above
        // the card would go soft while the background beside it stayed sharp.
        vec2 fp = (vUv - uFocusRect.xy) * vec2(uAspect, 1.0);
        vec2 fq = abs(fp) - uFocusRect.zw * vec2(uAspect, 1.0);
        float fsd = length(max(fq, 0.0)) + min(max(fq.x, fq.y), 0.0);
        // Wide open: the falloff out of focus is fast and short, so the card
        // is the only thing in the frame that is sharp.
        float coc = smoothstep(0.0, 0.13, fsd) * uDof;
        if (coc > 0.002) {
          float lod = coc * 3.0;
          vec2 rad = vec2(0.055 * coc) * vec2(1.0 / uAspect, 1.0);
          vec3 acc = vec3(0.0);
          float wsum = 0.0;
          for (int i = 0; i < LG_BOKEH_TAPS; i++) {
            float fi = float(i) + 0.5;
            float ang = fi * 2.39996323;
            float r = sqrt(fi / float(LG_BOKEH_TAPS));
            vec2 off = vec2(cos(ang), sin(ang)) * r * rad;
            vec3 tap = texture2DLodEXT(tDiffuse, clamp(sceneUv + off, vec2(0.002), vec2(0.998)), lod).rgb;
            float w = 1.0 + 9.0 * dot(tap, vec3(0.2126, 0.7152, 0.0722));
            acc += tap * w;
            wsum += w;
          }
          col = mix(col, acc / max(wsum, 1e-4), coc);
        }
      }

      // Rounded-rect SDF in aspect-corrected space.
      vec2 p = vec2((vUv.x - uRect.x) * uAspect, vUv.y - uRect.y);
      vec2 b = vec2(uRect.z * uAspect, uRect.w) - uRadius;
      vec2 q = abs(p) - b;
      float sd = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - uRadius;

      float fw = max(fwidth(sd), 1e-4);
      float inside = 1.0 - smoothstep(-fw, fw, sd);

      // Vignette measured inside the rect so it survives the fold.
      float vig = 1.0 - uVignette * smoothstep(0.34, 1.02, length(dir) * 1.42);
      col *= vig;
      col *= uSceneFade;

      // Dither. This pass runs *before* OutputPass, so col is still linear
      // scene radiance - the tone map and the sRGB encode are both still to
      // come, and that curve is at its steepest exactly where this frame lives.
      // A fixed amount added here is therefore not a fixed amount on screen: it
      // is multiplied by the local slope of the transfer curve, which near black
      // is very large. That is why this has to stay small enough to be a dither
      // and nothing more.
      //
      // Its whole job is the floor. Ninety square metres of near-black gradient
      // quantises to 8 bits in runs up to fifty pixels long, and undithered
      // those runs are visible as contour bands sweeping across the mat.
      //
      // Keyed to gl_FragCoord, so it is one value per device pixel at any
      // resolution, and - deliberately - it does not move. It used to be reseeded
      // every frame from uTime, which is right for film grain and wrong for
      // this: a static frame is the one case where the eye integrates nothing
      // and reads the noise directly, so the whole floor crawled while the scene
      // stood still. Anchored to the pixel grid it reads as sensor noise instead,
      // which is a property of the camera and has no business animating.
      col += (hash21(gl_FragCoord.xy) - 0.5) * uDither;
      col *= inside;

      // Faint bloom hugging the phone edge once the fold has happened - the
      // screen's own light spilling past the bezel, so it is the same cool
      // white the scene inside it is lit by rather than a brand-coloured seam.
      col += uEdge * exp(-abs(sd) * 190.0) * uFold * 0.040;

      gl_FragColor = vec4(max(col, 0.0), 1.0);

      // AgX + sRGB are applied here, not via <tonemapping_fragment> /
      // <colorspace_fragment>. Those chunks are gated on program defines that
      // three only sets when the current target is the drawing buffer:
      // ShaderPass.toneMapped writes to an RT with TONE_MAPPING undefined and
      // linearToOutputTexel as identity. The gym-scan overlay samples that RT,
      // so using the stock chunks meant the frame the phone appeared dropped
      // AgX and the sRGB encode at once — the room went a stop darker before
      // any bezel was on screen.
      gl_FragColor.rgb = AgXToneMapping(gl_FragColor.rgb);
      gl_FragColor = sRGBTransferOETF(gl_FragColor);
    }
  `,
}
