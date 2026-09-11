import {
  PHONE_H,
  PHONE_R,
  PHONE_SCR_H,
  PHONE_SCR_W,
  PHONE_SCREEN_Z,
  PHONE_W,
} from "../phoneModel.ts";
import { discoveryEquipment } from "./discoveryEquipment.ts";
import {
  heroScaleEase,
  heroTravelEase,
  type PhoneBox,
} from "./handoff.ts";
import { clamp01, lerp, smoothstep } from "./timeline.ts";

/** Rubber-tile field that the overhead beat establishes before the morph. */
export const DISCOVERY_TILE = 1.5;
export const DISCOVERY_FLOOR_COLS = 5;
export const DISCOVERY_FLOOR_ROWS = 4;
export const DISCOVERY_FLOOR_W = DISCOVERY_FLOOR_COLS * DISCOVERY_TILE;
export const DISCOVERY_FLOOR_D = DISCOVERY_FLOOR_ROWS * DISCOVERY_TILE;
export const DISCOVERY_CAM_FOV = 38;
/** Morph is its own beat: it does not start until overhead has reached 1. */
export const DISCOVERY_MORPH_START = 0.78;
export const DISCOVERY_MORPH_WINDOW = 0.18;
/**
 * World scale of the shared phone mesh so its long side matches the floor
 * depth — the landscape tile field then changes aspect into the portrait body.
 */
export const DISCOVERY_PHONE_SCALE = DISCOVERY_FLOOR_D / PHONE_H;
/** Pixel size of the in-app gym overview texture. */
export const DISCOVERY_APP_CANVAS = { w: 720, h: 1520 };
/** In-app equipment list: header / footer as fractions of the phone screen. */
export const DISCOVERY_APP_LAYOUT = {
  header: 0.275,
  footer: 0.07,
  insetX: 0.055,
  thumb: 0.56,
  rows: 4,
  dividerInsetX: 38 / 720,
  dividerThickness: 1 / 1520,
  textGap: 25 / 720,
  areaSize: 18 / 1520,
  areaLift: 49 / 1520,
  numberSize: 22 / 1520,
  numberAdvance: 40 / 720,
};
/**
 * In-app "Your gym" title. The floor caption uses the same box so the 3D label
 * can land on these pixels and hand off without a jump.
 */
export const DISCOVERY_APP_TITLE = {
  text: "Your gym",
  x: 38,
  baseline: 216,
  size: 57,
  weight: 650,
  boxX: 36,
  boxY: 168,
  boxW: 270,
  boxH: 64,
} as const;
/**
 * Floor caption, world metres, same aspect as the in-app title box. Top-left
 * of the 5×4 floor, axis-aligned with the tiles.
 */
export const DISCOVERY_TITLE_FLOOR = {
  x: -2.72,
  y: 0.018,
  z: -2.72,
  w: 1.48,
  d: 1.48 * (DISCOVERY_APP_TITLE.boxH / DISCOVERY_APP_TITLE.boxW),
};
/** Floor badge sits up-left of the machine; CSS font-size of that badge. */
export const DISCOVERY_LABEL_FLOOR_OFFSET = { x: -32, y: -22 };
export const DISCOVERY_LABEL_FONT = 9;
/** Tilt from overhead (0) toward a 3/4 product thumbnail on the screen. */
export const DISCOVERY_THUMB_ROT_X = -1.18;
export const DISCOVERY_THUMB_ROT_Y = 0.58;
export type DiscoveryRect = {
  x: number;
  z: number;
  w: number;
  d: number;
};

export type DiscoveryCameraPose = {
  x: number;
  y: number;
  z: number;
  lookX: number;
  lookY: number;
  lookZ: number;
};

export type DiscoveryMachinePose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  rotX: number;
};

export type DiscoveryMorphBeats = {
  shape: number;
  device: number;
  screen: number;
  layout: number;
};

export type { ListingMorphBeats, DiscoveryListingStyle } from "./listingMorph.ts";
export { listingMorphBeats, listingFromStyle } from "./listingMorph.ts";

export type DiscoveryAppRow = {
  x: number;
  y: number;
  rowH: number;
  thumb: number;
};

export type DiscoveryAppNumber = {
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  textLeft: number;
  areaX: number;
  baselineY: number;
};

export type DiscoveryLabel = {
  appear: number;
  travel: number;
  mix: number;
  alpha: number;
};

export type DiscoveryTitle = {
  appear: number;
  travel: number;
  alpha: number;
};

export type DiscoveryTitlePose = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  opacity: number;
};

export const GLOBE_SETTLE_AT = 2.8;
export const GLOBE_WAVE_PERIOD = 3.7;
/** Keep the parked 3D phone after the custom-video beat. */
export const GLOBE_PHONE_HOLD = 0.05;
/** Then fade that phone before Earth is allowed on screen. */
export const GLOBE_PHONE_FADE = 0.05;
export const GLOBE_REVEAL_START = GLOBE_PHONE_HOLD + GLOBE_PHONE_FADE;
/** Scroll progress that finishes the gym-to-Earth zoom-out. */
export const GLOBE_REVEAL_PROGRESS = 0.22;
/** Scroll progress that finishes the north-up approach to Slovakia. */
export const GLOBE_FOCUS_PROGRESS = 0.27;
/** Camera height above the globe surface at the start of the zoom-out. */
export const GLOBE_SURFACE_ALTITUDE = 0.055;
export const GLOBE_SURFACE_ALTITUDE_MOBILE = 0.09;
/** How small the prior gym scene is once Earth fills the frame. */
export const GLOBE_PRIOR_SCALE = 0.012;

/**
 * Zoom-out and the Slovakia approach are both scrubbed by scroll.
 * Construction passes still take elapsed time; the camera does not.
 */
export function globeJourneyAt(_seconds: number, progress = 0) {
  const phoneOut = smoothstep(
    (progress - GLOBE_PHONE_HOLD) / GLOBE_PHONE_FADE,
  );
  const reveal = smoothstep(
    (progress - GLOBE_REVEAL_START) /
      (GLOBE_REVEAL_PROGRESS - GLOBE_REVEAL_START),
  );
  const focus = smoothstep(
    (progress - GLOBE_REVEAL_PROGRESS) /
      (GLOBE_FOCUS_PROGRESS - GLOBE_REVEAL_PROGRESS),
  );
  const labels =
    smoothstep((focus - 0.68) / 0.28) *
    (1 - smoothstep((progress - GLOBE_FOCUS_PROGRESS) / 0.04));
  return { reveal, focus, labels, phoneOut };
}

/** Logarithmic altitude so equal time covers equal changes of scale. */
export function globePullbackAltitude(
  reveal: number,
  worldAltitude: number,
  surfaceAltitude = GLOBE_SURFACE_ALTITUDE,
) {
  const start = Math.max(0.02, surfaceAltitude);
  const end = Math.max(start * 1.02, worldAltitude);
  return Math.exp(lerp(Math.log(start), Math.log(end), clamp01(reveal)));
}

export function globePriorScale(reveal: number) {
  return Math.exp(lerp(0, Math.log(GLOBE_PRIOR_SCALE), clamp01(reveal)));
}

/**
 * Indoor bike (04): the floor badge the globe lands on as the camera
 * unzooms from Earth onto the overhead gym. Same index as `item.number`.
 */
export const DISCOVERY_GLOBE_BADGE = 3;
/** CSS size of `.gd-machine-labels span` — the globe must hit this pixel size. */
export const DISCOVERY_BADGE_PX = 24;

export type GlobeBadgeMorph = {
  travel: number;
  detail: number;
  handoff: number;
};

/**
 * Cheap globe → 04 badge morph, driven by the floor beat.
 * Travel moves and log-scales the sphere onto the badge. Detail kills land
 * dots, arcs, and atmosphere so the remaining mesh is a black circle.
 * Handoff is when the HTML 04 badge covers that circle.
 */
export function globeBadgeAt(floor: number): GlobeBadgeMorph {
  const t = clamp01(floor);
  return {
    travel: smoothstep(t / 0.55),
    detail: 1 - smoothstep(t / 0.32),
    handoff: smoothstep((t - 0.62) / 0.28),
  };
}

/** Resting world point of the 04 floor badge, up-left of the indoor bike. */
export function globeBadgeWorld() {
  const item = discoveryEquipment[DISCOVERY_GLOBE_BADGE]!;
  return {
    x: item.x - 0.4,
    y: 0,
    z: item.z - 0.28,
  };
}

/** Logarithmic scale so shrinking Earth covers equal changes of size. */
export function globeBadgeScale(travel: number, from: number, to: number) {
  const start = Math.max(1e-4, from);
  const end = Math.max(1e-4, to);
  return Math.exp(lerp(Math.log(start), Math.log(end), clamp01(travel)));
}

/**
 * World scale at which a sphere of `radius` projects to `pixels` tall.
 * Keeps the landing size locked to the CSS badge instead of a guessed metre.
 */
export function globeBadgeWorldScale(
  distance: number,
  viewHeight: number,
  fovDeg: number,
  radius: number,
  pixels = DISCOVERY_BADGE_PX,
) {
  const worldH =
    2 * Math.max(0.02, distance) * Math.tan((fovDeg * Math.PI) / 360);
  return (
    ((pixels / Math.max(1, viewHeight)) * worldH) / (2 * Math.max(1e-4, radius))
  );
}

/** Brief construction passes; no repeating sweep or idle hologram. */
export function globeAssemblyAt(seconds: number) {
  const assembly = smoothstep(seconds / GLOBE_SETTLE_AT);
  const pass =
    seconds < 1.25 ? (seconds - 0.2) / 0.95 : (seconds - 1.45) / 1.05;
  const active =
    (seconds >= 0.2 && seconds < 1.15) || (seconds >= 1.45 && seconds < 2.5);
  return {
    assembly,
    sweepY: 2.3 - clamp01(pass) * 4.6,
    hologram: active ? Math.sin(Math.PI * clamp01(pass)) : 0,
    settled: seconds >= GLOBE_SETTLE_AT,
  };
}

/**
 * After the globe settles, Bratislava blinks and a shockwave ring of land
 * dots lights up. Arcs from the hub finish drawing on the first pulse.
 */
export function globeNetworkAt(seconds: number) {
  const settled = seconds >= GLOBE_SETTLE_AT;
  const t = Math.max(0, seconds - GLOBE_SETTLE_AT);
  const cycle = t % GLOBE_WAVE_PERIOD;
  const blink = !settled
    ? 0
    : cycle < 0.5
      ? Math.sin((cycle / 0.5) * Math.PI)
      : 0.2 + 0.12 * Math.sin(t * 5);
  const wave =
    settled && cycle > 0.08 ? clamp01((cycle - 0.08) / 2.4) * Math.PI : 0;
  const arcs = settled ? smoothstep((t - 0.18) / 1.05) : 0;
  return { blink, wave, arcs };
}

export function discoveryAt(progress: number) {
  const morph = smoothstep(
    (progress - DISCOVERY_MORPH_START) / DISCOVERY_MORPH_WINDOW,
  );
  return {
    listing: smoothstep((progress - GLOBE_FOCUS_PROGRESS) / 0.1),
    /** Parked 3D phone recedes before Earth. Same window as globeJourneyAt.phoneOut. */
    lift: smoothstep((progress - GLOBE_PHONE_HOLD) / GLOBE_PHONE_FADE),
    floor: smoothstep((progress - 0.43) / 0.16),
    overhead: smoothstep((progress - 0.61) / 0.16),
    morph,
    /** Alias of morph: reduced-motion inventory still reveals on this window. */
    order: morph,
    phase: progress < GLOBE_FOCUS_PROGRESS ? 0 : progress < 0.47 ? 1 : progress < 0.79 ? 2 : 3,
  };
}

export type DiscoveryListingBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DiscoveryListingMorph = DiscoveryListingBox & {
  radius: number;
  photoH: number;
};

/** Resting card corner once the listing has left the pin. */
export const DISCOVERY_LISTING_RADIUS = 12;
/** Seed size of the review card while it is still the Bratislava pin. */
export const DISCOVERY_LISTING_PIN_SIZE = 18;
/** Photo header aspect on the settled card (matches `.gd-profile-photo`). */
export const DISCOVERY_LISTING_PHOTO_ASPECT = 1.95;

export function discoveryListingPinBox(
  cx: number,
  cy: number,
  size = DISCOVERY_LISTING_PIN_SIZE,
): PhoneBox {
  return { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
}

/**
 * Scroll-driven box of the gym listing. `listing` 0 is a circle on the
 * Bratislava pin; 1 is the rest card. Position uses the snappy travel ease,
 * size lags so the pin blooms into the review card.
 */
export function discoveryListingBox(
  origin: PhoneBox,
  rest: DiscoveryListingBox,
  listing: number,
): DiscoveryListingMorph {
  const t = clamp01(listing);
  const posT = heroTravelEase(t);
  const sizeT = heroScaleEase(t);
  const w = lerp(origin.w, rest.width, sizeT);
  const h = lerp(origin.h, rest.height, sizeT);
  const cx = lerp(origin.x + origin.w / 2, rest.left + rest.width / 2, posT);
  const cy = lerp(origin.y + origin.h / 2, rest.top + rest.height / 2, posT);
  return {
    left: cx - w / 2,
    top: cy - h / 2,
    width: w,
    height: h,
    radius: lerp(Math.min(origin.w, origin.h) / 2, DISCOVERY_LISTING_RADIUS, sizeT),
    photoH: lerp(origin.h, rest.width / DISCOVERY_LISTING_PHOTO_ASPECT, sizeT),
  };
}

/** The floor contracts directly into a screen-up phone while machines find their rows. */
export function discoveryMorphBeats(morph: number): DiscoveryMorphBeats {
  const m = clamp01(morph);
  return {
    shape: smoothstep(m / 0.62),
    device: smoothstep((m - 0.52) / 0.32),
    screen: smoothstep((m - 0.54) / 0.34),
    layout: smoothstep((m - 0.12) / 0.88),
  };
}

/** Local +Z always faces the overhead camera. The back never enters the shot. */
export const DISCOVERY_PHONE_ROT_X = -Math.PI / 2;

/** A restrained entrance after the app surface begins to appear. */
export function discoveryIslandAt(morph: number) {
  const m = clamp01(morph);
  const reveal = clamp01((m - 0.62) / 0.28);
  const settle = 1 - Math.pow(1 - reveal, 4);
  return {
    opacity: smoothstep((m - 0.62) / 0.18),
    scale: lerp(0.88, 1, settle),
  };
}

export function equipmentOrderAt(progress: number, index: number) {
  const layout = discoveryMorphBeats(discoveryAt(progress).morph).layout;
  return smoothstep((layout - index * 0.08) / 0.76);
}

/** Seconds each machine takes to hologram-scan in from the floor. */
export const DISCOVERY_SPAWN_DURATION = 1.05;
/** Delay between machines, top row then bottom row. */
export const DISCOVERY_SPAWN_STAGGER = 0.28;
const DISCOVERY_SPAWN_HEIGHT = 3.5;

/**
 * Time-based spawn of the four floor machines. Index 0–1 (far row) then
 * 2–3 (near row), each scanning from the feet up. `seconds` is time spent
 * with the floor actually in view, not scroll progress, so clicking the
 * gym-floor step still plays the pass.
 */
export function discoveryMachineSpawnAt(seconds: number, index: number) {
  const local = (seconds - index * DISCOVERY_SPAWN_STAGGER) / DISCOVERY_SPAWN_DURATION;
  const amount = smoothstep(local);
  return {
    amount,
    height: amount * DISCOVERY_SPAWN_HEIGHT,
    done: local >= 1,
  };
}

export function discoverySpawnDone(seconds: number) {
  return discoveryMachineSpawnAt(seconds, discoveryEquipment.length - 1).done;
}

/**
 * Floor 01–04 badges travel with the machines, then peel into the in-app
 * index slots. Alpha only drops once they already cover those slots so the
 * canvas numbers can take over without the badges fading off the machines.
 * 04 is the globe landing; 01–03 fade in on that same handoff so the four
 * floor numbers appear together.
 */
export function discoveryLabelAt(progress: number, index: number): DiscoveryLabel {
  const frame = discoveryAt(progress);
  const appear = smoothstep((progress - 0.59 - index * 0.014) / 0.065);
  const travel = smoothstep((equipmentOrderAt(progress, index) - 0.08) / 0.92);
  const screen = discoveryMorphBeats(frame.morph).screen;
  const handoff = smoothstep((travel * screen - 0.9) / 0.1);
  const shown = Math.max(appear, globeBadgeAt(frame.floor).handoff);
  return {
    appear: shown,
    travel,
    mix: smoothstep((travel - 0.35) / 0.65),
    alpha: shown * (1 - handoff),
  };
}

export function discoveryLabelsLanded(progress: number) {
  const screen = discoveryMorphBeats(discoveryAt(progress).morph).screen;
  if (screen < 0.88) return false;
  for (let i = 0; i < discoveryEquipment.length; i++)
    if (discoveryLabelAt(progress, i).travel < 0.92) return false;
  return true;
}

/**
 * Clean "Your gym" sits on the overhead tiles, then moves into the in-app
 * title. Alpha drops only once the canvas title is already covering the
 * same pixels.
 */
export function discoveryTitleAt(progress: number): DiscoveryTitle {
  const frame = discoveryAt(progress);
  const screen = discoveryMorphBeats(frame.morph).screen;
  const appear = smoothstep((progress - 0.6) / 0.08);
  const travel = smoothstep((frame.morph - 0.05) / 0.58);
  const handoff = smoothstep((travel * screen - 0.86) / 0.14);
  return {
    appear,
    travel,
    alpha: appear * (1 - handoff) * frame.floor,
  };
}

export function discoveryTitleLanded(progress: number) {
  const title = discoveryTitleAt(progress);
  const screen = discoveryMorphBeats(discoveryAt(progress).morph).screen;
  return title.travel > 0.94 && screen > 0.9;
}

/** Canvas pixel → phone-local XY on the screen-up device. */
export function discoveryCanvasToLocal(cx: number, cy: number) {
  return {
    x: (cx / DISCOVERY_APP_CANVAS.w - 0.5) * PHONE_SCR_W,
    y: (0.5 - cy / DISCOVERY_APP_CANVAS.h) * PHONE_SCR_H,
  };
}

/** Phone-local box of the in-app title, center + size. */
export function discoveryTitleScreenRect() {
  const { boxX, boxY, boxW, boxH } = DISCOVERY_APP_TITLE;
  const tl = discoveryCanvasToLocal(boxX, boxY);
  const br = discoveryCanvasToLocal(boxX + boxW, boxY + boxH);
  return {
    x: (tl.x + br.x) / 2,
    y: (tl.y + br.y) / 2,
    w: Math.abs(br.x - tl.x),
    h: Math.abs(br.y - tl.y),
  };
}

export function discoveryTitleScreenWorld() {
  const rect = discoveryTitleScreenRect();
  const xz = discoveryScreenLocalToWorld(rect.x, rect.y);
  return {
    x: xz.x,
    y: discoveryScreenWorldY() + 0.004,
    z: xz.z,
    w: rect.w * DISCOVERY_PHONE_SCALE,
    d: rect.h * DISCOVERY_PHONE_SCALE,
  };
}

export function discoveryTitlePoseAt(progress: number): DiscoveryTitlePose {
  const title = discoveryTitleAt(progress);
  const floor = DISCOVERY_TITLE_FLOOR;
  const screen = discoveryTitleScreenWorld();
  const t = title.travel;
  return {
    x: lerp(floor.x, screen.x, t),
    y: lerp(floor.y, screen.y, t),
    z: lerp(floor.z, screen.z, t),
    w: lerp(floor.w, screen.w, t),
    d: lerp(floor.d, screen.d, t),
    opacity: title.alpha,
  };
}

export function discoveryFloorRect(): DiscoveryRect {
  return { x: 0, z: 0, w: DISCOVERY_FLOOR_W, d: DISCOVERY_FLOOR_D };
}

export function discoveryPhoneBodyRect(): DiscoveryRect {
  return {
    x: 0,
    z: 0,
    w: PHONE_W * DISCOVERY_PHONE_SCALE,
    d: PHONE_H * DISCOVERY_PHONE_SCALE,
  };
}

export function discoveryPhoneScreenRect(): DiscoveryRect {
  return {
    x: 0,
    z: 0,
    w: PHONE_SCR_W * DISCOVERY_PHONE_SCALE,
    d: PHONE_SCR_H * DISCOVERY_PHONE_SCALE,
  };
}

/** Floor rectangle → phone body. Driven by the shape beat, not the full morph. */
export function discoveryMorphRect(morph: number): DiscoveryRect {
  const t = discoveryMorphBeats(morph).shape;
  if (t <= 0) return discoveryFloorRect();
  if (t >= 1) return discoveryPhoneBodyRect();
  const floor = discoveryFloorRect();
  const phone = discoveryPhoneBodyRect();
  return {
    x: lerp(floor.x, phone.x, t),
    z: lerp(floor.z, phone.z, t),
    w: lerp(floor.w, phone.w, t),
    d: lerp(floor.d, phone.d, t),
  };
}

/** World-space corner radius. 0 on the tile field, phone R once shape is done. */
export function discoveryCornerRadius(morph: number) {
  return lerp(0, PHONE_R * DISCOVERY_PHONE_SCALE, discoveryMorphBeats(morph).shape);
}

/** Phone-local row on the in-app equipment list (x right, y toward the island). */
export function discoveryAppRow(index: number): DiscoveryAppRow {
  const header = DISCOVERY_APP_LAYOUT.header * PHONE_SCR_H;
  const footer = DISCOVERY_APP_LAYOUT.footer * PHONE_SCR_H;
  const rowH = (PHONE_SCR_H - header - footer) / DISCOVERY_APP_LAYOUT.rows;
  const inset = DISCOVERY_APP_LAYOUT.insetX * PHONE_SCR_W;
  const thumb = rowH * DISCOVERY_APP_LAYOUT.thumb;
  const y = PHONE_SCR_H / 2 - header - rowH * (index + 0.5);
  const x = -PHONE_SCR_W / 2 + inset + thumb / 2;
  return { x, y, rowH, thumb };
}

/** Lime 01–04 index on the area line, sharing one layout with the canvas list. */
export function discoveryAppNumber(index: number): DiscoveryAppNumber {
  const row = discoveryAppRow(index);
  const gap = DISCOVERY_APP_LAYOUT.textGap * PHONE_SCR_W;
  const advance = DISCOVERY_APP_LAYOUT.numberAdvance * PHONE_SCR_W;
  const size = DISCOVERY_APP_LAYOUT.numberSize * PHONE_SCR_H;
  const textLeft = row.x + row.thumb / 2 + gap;
  const baselineY = row.y + DISCOVERY_APP_LAYOUT.areaLift * PHONE_SCR_H;
  return {
    x: textLeft + advance * 0.36,
    y: baselineY + size * 0.35,
    w: advance * 0.7,
    h: size,
    size,
    textLeft,
    areaX: textLeft + advance,
    baselineY,
  };
}

/** Tilt-local world point of an in-app index, on the screen plane. */
export function discoveryAppNumberWorld(index: number) {
  const number = discoveryAppNumber(index);
  const xz = discoveryScreenLocalToWorld(number.x, number.y);
  return {
    x: xz.x,
    y: discoveryScreenWorldY() + 0.002,
    z: xz.z,
    h: number.h * DISCOVERY_PHONE_SCALE,
  };
}

/** One definition for both the canvas list rules and their moving floor seams. */
export function discoveryAppDivider(index: number) {
  const row = discoveryAppRow(index);
  return {
    y: row.y - row.rowH / 2,
    halfWidth: PHONE_SCR_W * (0.5 - DISCOVERY_APP_LAYOUT.dividerInsetX),
    thickness: PHONE_SCR_H * DISCOVERY_APP_LAYOUT.dividerThickness,
  };
}

/** Phone-local seam endpoints settle before the app starts to appear. */
export function discoveryFloorSeamAt(morph: number, index: number) {
  const mix = smoothstep(clamp01(morph) / 0.52);
  const divider = discoveryAppDivider(index);
  if (mix >= 1) return divider;
  const floorY = (DISCOVERY_FLOOR_D / 2 - (index + 1) * DISCOVERY_TILE) / DISCOVERY_PHONE_SCALE;
  return {
    y: lerp(floorY, divider.y, mix),
    halfWidth: lerp(DISCOVERY_FLOOR_W / (2 * DISCOVERY_PHONE_SCALE), divider.halfWidth, mix),
    thickness: lerp(0.018 / DISCOVERY_PHONE_SCALE, divider.thickness, mix),
  };
}

/** World XZ of a screen-local point after the phone lies flat, screen up. */
export function discoveryScreenLocalToWorld(localX: number, localY: number) {
  return {
    x: localX * DISCOVERY_PHONE_SCALE,
    z: -localY * DISCOVERY_PHONE_SCALE,
  };
}

export function discoveryScreenWorldY() {
  return PHONE_SCREEN_Z * DISCOVERY_PHONE_SCALE;
}

export function discoveryMachineAppScale(index: number) {
  const item = discoveryEquipment[index]!;
  const row = discoveryAppRow(index);
  return (row.thumb * DISCOVERY_PHONE_SCALE * 0.68) / item.span;
}

/**
 * World pose of a discovery machine. Mix 0 is the overhead floor; mix 1 is a
 * 3/4 thumbnail in an in-app equipment row as the floor becomes the screen.
 */
export function discoveryMachinePoseAt(
  progress: number,
  index: number,
): DiscoveryMachinePose {
  const item = discoveryEquipment[index]!;
  const mix = equipmentOrderAt(progress, index);
  const row = discoveryAppRow(index);
  const dest = discoveryScreenLocalToWorld(row.x, row.y);
  const thumbLift = row.thumb * DISCOVERY_PHONE_SCALE * 0.1;
  return {
    x: lerp(item.x, dest.x, mix),
    y: lerp(0, discoveryScreenWorldY() + 0.03 + thumbLift, mix),
    z: lerp(item.z, dest.z, mix),
    scale: lerp(1, discoveryMachineAppScale(index), mix),
    rotation: lerp(item.rotation, DISCOVERY_THUMB_ROT_Y, mix),
    rotX: lerp(0, DISCOVERY_THUMB_ROT_X, mix),
  };
}

/**
 * Camera target for a given discovery progress. Once overhead, the pose stays
 * top-down (looking at the floor / phone) for the whole morph — never a 3/4
 * hero rest pose.
 */
export function discoveryCameraPose(
  progress: number,
  compact: boolean,
  width: number,
  height: number,
): DiscoveryCameraPose {
  const frame = discoveryAt(progress);
  const orbit = frame.overhead;
  const mobileScale = compact ? 2.3 : Math.max(1, 1100 / width);
  const fovHalf = ((DISCOVERY_CAM_FOV * Math.PI) / 180) / 2;
  const floorHeight = Math.max(
    14,
    (DISCOVERY_FLOOR_W * height) /
      (2 * Math.tan(fovHalf) * width * (compact ? 0.88 : 0.5)),
  );
  const phoneFill = compact ? Math.min(0.48, Math.max(180, height - 440) / height) : 0.68;
  const phoneHeight = Math.max(
    DISCOVERY_FLOOR_D / (2 * Math.tan(fovHalf) * phoneFill),
    PHONE_W * DISCOVERY_PHONE_SCALE * height / (2 * Math.tan(fovHalf) * width * 0.72),
  );
  const overheadHeight = lerp(floorHeight, phoneHeight, frame.morph);
  return {
    x: lerp(0, 5.7 * mobileScale, frame.floor) * (1 - orbit),
    y: lerp(0.2, lerp(6.5 * mobileScale, overheadHeight, orbit), frame.floor),
    z: lerp(
      compact ? 13.8 : 7.8,
      lerp(9.5 * mobileScale, 0.02, orbit),
      frame.floor,
    ),
    lookX: 0,
    lookY: lerp(0, 0.45, frame.floor) * (1 - orbit),
    lookZ: 0,
  };
}
