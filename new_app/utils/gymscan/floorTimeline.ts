// 06 · Your floor. A demonstration gym floor contracts into a screen-up phone:
// the tile seams become the list rules, "Your gym" on the tiles becomes the app
// title, and each machine flies into its own row as a 3/4 thumbnail. Every
// pose here is a pure function of the pinned section's scroll progress.
import {
  PHONE_H,
  PHONE_R,
  PHONE_SCR_H,
  PHONE_SCR_W,
  PHONE_SCREEN_Z,
  PHONE_W,
} from "../phoneModel.ts";
import { floorEquipment } from "./floorEquipment.ts";
import type { PhoneBox } from "./handoff.ts";
import { MEMBER_COMPACT_MAX, memberPhoneSlot } from "./memberPhone.ts";
import { storyBeatAt, storyBeatFill, storyBeatTarget } from "./storyBeats.ts";
import { clamp01, lerp, smoothstep } from "./timeline.ts";

/** Rubber-tile field, in metres. */
export const FLOOR_TILE = 1.5;
export const FLOOR_COLS = 5;
export const FLOOR_ROWS = 4;
export const FLOOR_W = FLOOR_COLS * FLOOR_TILE;
export const FLOOR_D = FLOOR_ROWS * FLOOR_TILE;
export const FLOOR_CAM_FOV = 38;
/**
 * World scale of the shared phone mesh, so its long side matches the floor
 * depth: the landscape tile field only has to change aspect to become the body.
 */
export const FLOOR_PHONE_SCALE = FLOOR_D / PHONE_H;
/** Screen-up device: local +Z faces the overhead camera, +Y points to -Z. */
export const FLOOR_PHONE_ROT_X = -Math.PI / 2;
/** Pixel size of the in-app gym overview texture. */
export const FLOOR_APP_CANVAS = { w: 720, h: 1520 };
/** In-app equipment list, as fractions of the phone screen or canvas. */
export const FLOOR_APP_LAYOUT = {
  header: 0.275,
  footer: 0.05,
  insetX: 0.055,
  thumb: 0.56,
  rows: 4,
  dividerInsetX: 38 / 720,
  dividerThickness: 1.5 / 1520,
  textGap: 25 / 720,
  areaSize: 18 / 1520,
  areaLift: 49 / 1520,
  numberSize: 22 / 1520,
  numberAdvance: 40 / 720,
  nameSize: 32 / 1520,
  nameLeading: 36 / 1520,
  /** First baseline below the row's centre: one line, or the first of two. */
  nameDrop: 5 / 1520,
  nameDropWrapped: -9 / 1520,
  nameInsetRight: 64 / 720,
};
/**
 * In-app "Your gym" title, canvas pixels. The caption on the tiles uses the
 * same box, so it can land on these pixels and hand off without a jump.
 */
export const FLOOR_APP_TITLE = {
  x: 38,
  baseline: 216,
  size: 57,
  weight: 650,
  boxX: 36,
  boxY: 168,
  boxW: 270,
  boxH: 64,
} as const;
/** The same caption painted on the far-left tiles, world metres. */
export const FLOOR_TITLE_TILES = {
  x: -2.72,
  y: 0.018,
  z: -2.72,
  w: 1.48,
  d: 1.48 * (FLOOR_APP_TITLE.boxH / FLOOR_APP_TITLE.boxW),
};
/** Tilt from standing on the floor toward a 3/4 product thumbnail. */
export const FLOOR_THUMB_ROT_X = -1.18;
export const FLOOR_THUMB_ROT_Y = 0.58;

// ---- beats -----------------------------------------------------------------

export const FLOOR_BEATS = 3;
/** Tag (the floor) → list (overhead, the morph starts) → browse (the app). */
export const FLOOR_BEAT_EDGES = [0, 0.3, 0.6, 1] as const;
export type FloorBeat = 0 | 1 | 2;

export function floorBeatAt(progress: number): FloorBeat {
  return storyBeatAt(FLOOR_BEAT_EDGES, progress) as FloorBeat;
}
export function floorBeatFill(progress: number, beat: number): number {
  return storyBeatFill(FLOOR_BEAT_EDGES, progress, beat);
}
export function floorBeatTarget(beat: number): number {
  return beat === 2 ? 0.92 : storyBeatTarget(FLOOR_BEAT_EDGES, beat);
}

/** Crane to overhead, then floor → phone. Both are scrubbed by scroll. */
export function floorAt(progress: number) {
  const p = clamp01(progress);
  return {
    overhead: smoothstep((p - 0.08) / 0.26),
    morph: smoothstep((p - 0.44) / 0.28),
  };
}

/** Open a machine only after every thumbnail has landed; hold it until release. */
export function floorExercisesAt(progress: number) {
  return smoothstep((clamp01(progress) - 0.8) / 0.08);
}

export type FloorMorphBeats = {
  /** Tile field → phone outline. */
  shape: number;
  /** Rubber darkens into the app's own background while it contracts. */
  ink: number;
  /** Metal body, buttons and camera fade in around it. */
  device: number;
  /** The app texture takes the glass. */
  screen: number;
  /** Machines travel into their rows. */
  layout: number;
};

export function floorMorphBeats(morph: number): FloorMorphBeats {
  const m = clamp01(morph);
  return {
    shape: smoothstep(m / 0.62),
    ink: smoothstep(m / 0.5),
    device: smoothstep((m - 0.52) / 0.32),
    screen: smoothstep((m - 0.54) / 0.34),
    layout: smoothstep((m - 0.12) / 0.88),
  };
}

/** A restrained entrance for the island once the glass has appeared. */
export function floorIslandAt(morph: number) {
  const m = clamp01(morph);
  const reveal = clamp01((m - 0.62) / 0.28);
  const settle = 1 - Math.pow(1 - reveal, 4);
  return {
    opacity: smoothstep((m - 0.62) / 0.18),
    scale: lerp(0.88, 1, settle),
  };
}

/** 0 on the floor, 1 in its app row. Machines leave in list order. */
export function floorOrderAt(progress: number, index: number) {
  const layout = floorMorphBeats(floorAt(progress).morph).layout;
  return smoothstep((layout - index * 0.08) / 0.76);
}

// ---- machines scanning in --------------------------------------------------

/** Seconds each machine takes to scan in from the floor. */
export const FLOOR_SPAWN_DURATION = 1.05;
/** Delay between machines, far row then near row. */
export const FLOOR_SPAWN_STAGGER = 0.28;
const FLOOR_SPAWN_HEIGHT = 3.5;

/**
 * Time-based, not scroll-based: a scan line climbs each machine from its feet
 * once the floor is in view, so a chapter jump still plays the pass.
 */
export function floorSpawnAt(seconds: number, index: number) {
  const local = (seconds - index * FLOOR_SPAWN_STAGGER) / FLOOR_SPAWN_DURATION;
  const amount = smoothstep(local);
  return { amount, height: amount * FLOOR_SPAWN_HEIGHT, done: local >= 1 };
}

export function floorSpawnDone(seconds: number) {
  return floorSpawnAt(seconds, floorEquipment.length - 1).done;
}

// ---- tags and title --------------------------------------------------------

export type FloorLabel = {
  /** 0 beside its machine, 1 on its in-app row. */
  travel: number;
  /** The leader line down to the machine, only while the tag is on the floor. */
  leader: number;
  /** The name's floor pill, dissolving as the name flies into its row. */
  pill: number;
  alpha: number;
};

/** A tag hands its row to the painted app from this share of the landing on. */
const FLOOR_LABEL_HANDOFF = 0.94;

function floorLabelSettle(progress: number, index: number) {
  const travel = smoothstep((floorOrderAt(progress, index) - 0.08) / 0.84);
  const screen = floorMorphBeats(floorAt(progress).morph).screen;
  return { travel, settle: travel * screen };
}

/**
 * Floor tag of one machine: its number and its name. It appears once the
 * scan has finished climbing the machine, then the number flies into the
 * in-app index and the name into the row title. Travel completes before the
 * glass is up, so alpha only drops once both cover their painted pixels.
 */
export function floorLabelAt(progress: number, index: number, spawn: number): FloorLabel {
  const { travel, settle } = floorLabelSettle(progress, index);
  const handoff = smoothstep((settle - FLOOR_LABEL_HANDOFF) / (1 - FLOOR_LABEL_HANDOFF));
  return {
    travel,
    leader: 1 - smoothstep(travel / 0.3),
    pill: 1 - smoothstep((travel - 0.1) / 0.5),
    alpha: smoothstep((spawn - 0.7) / 0.3) * (1 - handoff),
  };
}

/** The app paints a row's index and name from the moment its tag hands off. */
export function floorLabelLanded(progress: number, index: number) {
  return floorLabelSettle(progress, index).settle >= FLOOR_LABEL_HANDOFF;
}

/** "Your gym" is painted on the tiles once the camera is overhead. */
export function floorTitleAt(progress: number) {
  const p = clamp01(progress);
  const { morph } = floorAt(p);
  const screen = floorMorphBeats(morph).screen;
  const appear = smoothstep((p - 0.2) / 0.1);
  const travel = smoothstep((morph - 0.05) / 0.58);
  const handoff = smoothstep((travel * screen - 0.86) / 0.14);
  return { appear, travel, alpha: appear * (1 - handoff) };
}

export function floorTitleLanded(progress: number) {
  const title = floorTitleAt(progress);
  const screen = floorMorphBeats(floorAt(progress).morph).screen;
  return title.travel > 0.94 && screen > 0.9;
}

// ---- screen space ----------------------------------------------------------

/** Canvas pixel → phone-local XY on the screen-up device. */
export function floorCanvasToLocal(cx: number, cy: number) {
  return {
    x: (cx / FLOOR_APP_CANVAS.w - 0.5) * PHONE_SCR_W,
    y: (0.5 - cy / FLOOR_APP_CANVAS.h) * PHONE_SCR_H,
  };
}

/** World XZ of a screen-local point once the phone lies flat, screen up. */
export function floorScreenLocalToWorld(localX: number, localY: number) {
  return { x: localX * FLOOR_PHONE_SCALE, z: -localY * FLOOR_PHONE_SCALE };
}

export function floorScreenWorldY() {
  return PHONE_SCREEN_Z * FLOOR_PHONE_SCALE;
}

export function floorTitleScreenWorld() {
  const { boxX, boxY, boxW, boxH } = FLOOR_APP_TITLE;
  const tl = floorCanvasToLocal(boxX, boxY);
  const br = floorCanvasToLocal(boxX + boxW, boxY + boxH);
  const xz = floorScreenLocalToWorld((tl.x + br.x) / 2, (tl.y + br.y) / 2);
  return {
    x: xz.x,
    y: floorScreenWorldY() + 0.004,
    z: xz.z,
    w: Math.abs(br.x - tl.x) * FLOOR_PHONE_SCALE,
    d: Math.abs(br.y - tl.y) * FLOOR_PHONE_SCALE,
  };
}

export function floorTitlePoseAt(progress: number) {
  const title = floorTitleAt(progress);
  const from = FLOOR_TITLE_TILES;
  const to = floorTitleScreenWorld();
  const t = title.travel;
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    z: lerp(from.z, to.z, t),
    w: lerp(from.w, to.w, t),
    d: lerp(from.d, to.d, t),
    opacity: title.alpha,
  };
}

export type FloorRect = { x: number; z: number; w: number; d: number };

export function floorRect(): FloorRect {
  return { x: 0, z: 0, w: FLOOR_W, d: FLOOR_D };
}

export function floorPhoneBodyRect(): FloorRect {
  return { x: 0, z: 0, w: PHONE_W * FLOOR_PHONE_SCALE, d: PHONE_H * FLOOR_PHONE_SCALE };
}

/** Tile field → phone body, driven by the shape beat. */
export function floorMorphRect(morph: number): FloorRect {
  const t = floorMorphBeats(morph).shape;
  const from = floorRect();
  const to = floorPhoneBodyRect();
  return { x: 0, z: 0, w: lerp(from.w, to.w, t), d: lerp(from.d, to.d, t) };
}

/** World corner radius: square tiles, then the phone's own radius. */
export function floorCornerRadius(morph: number) {
  return lerp(0, PHONE_R * FLOOR_PHONE_SCALE, floorMorphBeats(morph).shape);
}

export type FloorAppRow = { x: number; y: number; rowH: number; thumb: number };

/** Phone-local row of the in-app list (x right, y toward the island). */
export function floorAppRow(index: number): FloorAppRow {
  const header = FLOOR_APP_LAYOUT.header * PHONE_SCR_H;
  const footer = FLOOR_APP_LAYOUT.footer * PHONE_SCR_H;
  const rowH = (PHONE_SCR_H - header - footer) / FLOOR_APP_LAYOUT.rows;
  const inset = FLOOR_APP_LAYOUT.insetX * PHONE_SCR_W;
  const thumb = rowH * FLOOR_APP_LAYOUT.thumb;
  return {
    x: -PHONE_SCR_W / 2 + inset + thumb / 2,
    y: PHONE_SCR_H / 2 - header - rowH * (index + 0.5),
    rowH,
    thumb,
  };
}

/** Lime 01–04 index on a row's area line; the canvas paints the same box. */
export function floorAppNumber(index: number) {
  const row = floorAppRow(index);
  const gap = FLOOR_APP_LAYOUT.textGap * PHONE_SCR_W;
  const advance = FLOOR_APP_LAYOUT.numberAdvance * PHONE_SCR_W;
  const size = FLOOR_APP_LAYOUT.numberSize * PHONE_SCR_H;
  const textLeft = row.x + row.thumb / 2 + gap;
  const baselineY = row.y + FLOOR_APP_LAYOUT.areaLift * PHONE_SCR_H;
  return {
    x: textLeft + advance * 0.36,
    y: baselineY + size * 0.35,
    h: size,
    size,
    textLeft,
    areaX: textLeft + advance,
    baselineY,
  };
}

/**
 * A machine's name in its row: left edge and first baseline, phone-local, with
 * its font size and line pitch. Long names wrap to two lines.
 */
export function floorAppName(index: number, lines: number) {
  const row = floorAppRow(index);
  const drop = lines > 1 ? FLOOR_APP_LAYOUT.nameDropWrapped : FLOOR_APP_LAYOUT.nameDrop;
  return {
    x: floorAppNumber(index).areaX,
    y: row.y - drop * PHONE_SCR_H,
    size: FLOOR_APP_LAYOUT.nameSize * PHONE_SCR_H,
    leading: FLOOR_APP_LAYOUT.nameLeading * PHONE_SCR_H,
  };
}

/** World point of a row's name on the glass (before pointer tilt). */
export function floorAppNameWorld(index: number, lines: number) {
  const name = floorAppName(index, lines);
  const xz = floorScreenLocalToWorld(name.x, name.y);
  return { x: xz.x, y: floorScreenWorldY() + 0.002, z: xz.z, size: name.size * FLOOR_PHONE_SCALE };
}

/** World point of an in-app index on the glass (before pointer tilt). */
export function floorAppNumberWorld(index: number) {
  const number = floorAppNumber(index);
  const xz = floorScreenLocalToWorld(number.x, number.y);
  return { x: xz.x, y: floorScreenWorldY() + 0.002, z: xz.z, h: number.h * FLOOR_PHONE_SCALE };
}

/** One definition for the canvas list rules and the floor seams that become them. */
export function floorAppDivider(index: number) {
  const row = floorAppRow(index);
  return {
    y: row.y - row.rowH / 2,
    halfWidth: PHONE_SCR_W * (0.5 - FLOOR_APP_LAYOUT.dividerInsetX),
    thickness: PHONE_SCR_H * FLOOR_APP_LAYOUT.dividerThickness,
  };
}

/** Phone-local tile joint → list rule. Settles before the app appears. */
export function floorSeamAt(morph: number, index: number) {
  const mix = smoothstep(clamp01(morph) / 0.52);
  const divider = floorAppDivider(index);
  if (mix >= 1) return divider;
  const floorY = (FLOOR_D / 2 - (index + 1) * FLOOR_TILE) / FLOOR_PHONE_SCALE;
  return {
    y: lerp(floorY, divider.y, mix),
    halfWidth: lerp(FLOOR_W / (2 * FLOOR_PHONE_SCALE), divider.halfWidth, mix),
    thickness: lerp(0.018 / FLOOR_PHONE_SCALE, divider.thickness, mix),
  };
}

export function floorMachineAppScale(index: number) {
  const item = floorEquipment[index]!;
  return (floorAppRow(index).thumb * FLOOR_PHONE_SCALE * 0.8) / item.span;
}

/** Half-diagonal of a machine's footprint, per unit of scale. */
export const FLOOR_FOOTPRINT = Math.SQRT1_2;

export type FloorMachinePose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  rotX: number;
};

/**
 * World pose of one machine. The contracting floor carries its machines with
 * it (positions scale with the rect, footprints with its tighter axis), and
 * each machine then blends into its app row. Both ends sit inside the current
 * outline, so no machine ever overhangs the shrinking floor.
 */
export function floorMachinePoseAt(progress: number, index: number): FloorMachinePose {
  const item = floorEquipment[index]!;
  const { morph } = floorAt(progress);
  const mix = floorOrderAt(progress, index);
  const rect = floorMorphRect(morph);
  const fx = rect.w / FLOOR_W;
  const fz = rect.d / FLOOR_D;
  const row = floorAppRow(index);
  const dest = floorScreenLocalToWorld(row.x, row.y);
  const lift = row.thumb * FLOOR_PHONE_SCALE * 0.1;
  return {
    x: lerp(item.x * fx, dest.x, mix),
    y: lerp(0, floorScreenWorldY() + 0.03 + lift, mix),
    z: lerp(item.z * fz, dest.z, mix),
    scale: lerp(Math.min(fx, fz), floorMachineAppScale(index), mix),
    rotation: lerp(item.rotation, FLOOR_THUMB_ROT_Y, mix),
    rotX: lerp(0, FLOOR_THUMB_ROT_X, mix),
  };
}

// ---- camera ----------------------------------------------------------------

/** Where the floor and the finished phone sit in the pane, CSS pixels. */
export function floorFrames(width: number, height: number) {
  const compact = width <= MEMBER_COMPACT_MAX;
  // The finished phone lands on the member chapter's slot: one device size
  // and position for every pinned phone on the page.
  const phone = memberPhoneSlot(width, height);
  const floor: PhoneBox = compact
    ? { x: width * 0.05, y: phone.y, w: width * 0.9, h: phone.h }
    : { x: width * 0.42, y: height * 0.15, w: width * 0.54, h: height * 0.72 };
  return { compact, floor, phone };
}

/** Camera distance at which a W×D rectangle fills `box` of the view. */
export function floorFitDistance(
  worldW: number,
  worldD: number,
  box: PhoneBox,
  height: number,
) {
  const t = Math.tan((FLOOR_CAM_FOV * Math.PI) / 360);
  return (height / (2 * t)) * Math.max(worldW / Math.max(1, box.w), worldD / Math.max(1, box.h));
}

export type FloorCamera = {
  x: number;
  y: number;
  z: number;
  targetY: number;
  /** 0 keeps world-up, 1 turns screen-up to world -Z for the plumb shot. */
  overhead: number;
  /** `setViewOffset` shift that centres the subject on its frame. */
  offsetX: number;
  offsetY: number;
};

const DEG = Math.PI / 180;

/**
 * One continuous crane: a low 3/4 view of the floor, up to a steep but still
 * dimensional view for the list beat, then straight down onto the phone as
 * the floor contracts. `entry` is how far the pane has risen into view
 * (0 → 1): the shot starts pulled back and low, and settles as it pins.
 */
export function floorCameraAt(
  progress: number,
  entry: number,
  width: number,
  height: number,
): FloorCamera {
  const { overhead, morph } = floorAt(progress);
  const { compact, floor, phone } = floorFrames(width, height);
  const body = floorPhoneBodyRect();
  const onFloor = floorFitDistance(FLOOR_W, FLOOR_D, floor, height);
  const onPhone = floorFitDistance(body.w, body.d, phone, height) + floorScreenWorldY();
  const approach = 1 - clamp01(entry);
  // Straight down only once the floor starts turning into the device.
  const plumb = smoothstep(morph / 0.55);
  const elevation =
    lerp(lerp((compact ? 40 : 30) - 10 * approach, compact ? 66 : 62, overhead), 90, plumb) * DEG;
  // From the front-left, so tall machines lean away from the painted title.
  const azimuth = -lerp(lerp(compact ? 16 : 30, compact ? 4 : 9, overhead), 0, plumb) * DEG;
  const radius =
    lerp(lerp(onFloor * (compact ? 1.34 : 1.26), onFloor * 1.12, overhead), onPhone, morph) *
    (1 + 0.32 * approach * approach);
  const targetY = lerp(lerp(0.4, 0.2, overhead), 0, plumb);
  const cx = lerp(floor.x + floor.w / 2, phone.x + phone.w / 2, morph);
  const cy = lerp(floor.y + floor.h / 2, phone.y + phone.h / 2, morph);
  return {
    x: radius * Math.cos(elevation) * Math.sin(azimuth),
    y: targetY + radius * Math.sin(elevation),
    z: radius * Math.cos(elevation) * Math.cos(azimuth),
    targetY,
    overhead: plumb,
    offsetX: width / 2 - cx,
    offsetY: height / 2 - cy,
  };
}
