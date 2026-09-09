import { CORE_RGB } from "./hologramColor.ts";
import { clamp01, smoothstep } from "./timeline.ts";

/** Hold the library, travel, then hold the gym. The line does not smear. */
export function coachingWipeTravel(replace: number) {
  return smoothstep((clamp01(replace) - 0.08) / 0.84);
}

/** Swap the on-glass badge once the front has reached the title. */
export function coachingOverlayIsGym(replace: number) {
  return coachingWipeTravel(replace) >= 0.72;
}

export const COACHING_WIPE_EDGE = CORE_RGB;

export const COACHING_WIPE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const COACHING_WIPE_FRAG = /* glsl */ `
varying vec2 vUv;
uniform sampler2D tLibrary;
uniform sampler2D tGym;
uniform mat3 uLibraryUv;
uniform mat3 uGymUv;
uniform float uWipe;
uniform float uOpacity;
uniform vec3 uEdge;

void main() {
  vec2 uvA = (uLibraryUv * vec3(vUv, 1.0)).xy;
  vec2 uvB = (uGymUv * vec3(vUv, 1.0)).xy;
  vec3 library = texture2D(tLibrary, uvA).rgb;
  vec3 gym = texture2D(tGym, uvB).rgb;
  float p = 1.0 - vUv.y;
  float mixGym = 1.0 - smoothstep(uWipe - 0.035, uWipe + 0.025, p);
  mixGym *= step(0.001, uWipe);
  mixGym = max(mixGym, step(0.999, uWipe));
  vec3 col = mix(library, gym, mixGym);
  float band = uWipe * (1.0 - uWipe) * 3.1;
  float edge = (1.0 - smoothstep(0.0, 0.016, abs(p - uWipe))) * band;
  col += uEdge * edge;
  gl_FragColor = vec4(col, uOpacity);
}
`;
