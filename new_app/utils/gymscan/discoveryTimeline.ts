import {
  PHONE_H,
  PHONE_R,
  PHONE_SCR_H,
  PHONE_SCR_W,
  PHONE_SCREEN_Z,
  PHONE_W,
} from "../phoneModel.ts";
import { discoveryEquipment } from "./discoveryEquipment.ts";
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
/** In-app equipment list: header / footer as fractions of the phone screen. */
export const DISCOVERY_APP_LAYOUT = {
  header: 0.275,
  footer: 0.07,
  insetX: 0.055,
  thumb: 0.56,
  rows: 4,
  dividerInsetX: 38 / 720,
  dividerThickness: 1 / 1520,
};
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

export type DiscoveryAppRow = {
  x: number;
  y: number;
  rowH: number;
  thumb: number;
};

export const GLOBE_SETTLE_AT = 1.25;
export const GLOBE_WAVE_PERIOD = 3.2;

/** Brief construction passes; no repeating sweep or idle hologram. */
export function globeAssemblyAt(seconds: number) {
  const assembly = smoothstep(seconds / GLOBE_SETTLE_AT);
  const pass = (seconds - 0.08) / 0.72;
  const active = seconds >= 0.08 && seconds < 0.8;
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
    listing: smoothstep((progress - 0.22) / 0.1),
    floor: smoothstep((progress - 0.43) / 0.16),
    overhead: smoothstep((progress - 0.61) / 0.16),
    morph,
    /** Alias of morph: reduced-motion inventory still reveals on this window. */
    order: morph,
    phase: progress < 0.27 ? 0 : progress < 0.47 ? 1 : progress < 0.79 ? 2 : 3,
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
