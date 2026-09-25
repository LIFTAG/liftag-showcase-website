// 06 · Your floor. A demonstration gym floor contracts into a screen-up phone:
// the tile seams become the list rules, "Your gym" on the tiles becomes the app
// title, and each machine flies into its own row as a 3/4 thumbnail. The app
// then plans a workout on those machines, and a coach builds one for the gym.
// Every pose here is a pure function of film time, `floorFilm(progress)`.
import {
  PHONE_H,
  PHONE_R,
  PHONE_SCR_H,
  PHONE_SCR_R,
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

/**
 * Film time the pinned section plays. 0 → 1 turns the floor into the gym's
 * app and opens a machine; after that the app plans a workout and a coach
 * builds a routine. Every pose below takes film time, not section progress.
 */
export const FLOOR_FILM = 1.8;
export function floorFilm(progress: number) {
  return clamp01(progress) * FLOOR_FILM;
}

export const FLOOR_BEATS = 5;
/** Tag (the floor) → list (the morph starts) → browse → plan (AI) → coach, in film time. */
const FLOOR_BEAT_FILM = [0, 0.3, 0.6, 1, 1.4, FLOOR_FILM] as const;
/** The same bands as section progress, for the rail. */
export const FLOOR_BEAT_EDGES: readonly number[] = FLOOR_BEAT_FILM.map((t) => t / FLOOR_FILM);
export type FloorBeat = 0 | 1 | 2 | 3 | 4;
/** App beats land their link on the finished screen, film time. */
const FLOOR_BEAT_HOLD: Partial<Record<number, number>> = { 2: 0.92, 3: 1.38, 4: 1.74 };

export function floorBeatAt(progress: number): FloorBeat {
  return storyBeatAt(FLOOR_BEAT_EDGES, progress) as FloorBeat;
}
export function floorBeatFill(progress: number, beat: number): number {
  return storyBeatFill(FLOOR_BEAT_EDGES, progress, beat);
}
export function floorBeatTarget(beat: number): number {
  const hold = FLOOR_BEAT_HOLD[beat];
  return hold === undefined ? storyBeatTarget(FLOOR_BEAT_EDGES, beat) : hold / FLOOR_FILM;
}

/** Crane to overhead, then floor → phone. Both are scrubbed by scroll. */
export function floorAt(progress: number) {
  const p = clamp01(progress);
  return {
    overhead: smoothstep((p - 0.08) / 0.26),
    morph: smoothstep((p - 0.44) / 0.28),
  };
}

// ---- opening a machine -----------------------------------------------------

/**
 * System chrome of both app screens, canvas pixels: the status bar above and
 * the home indicator below. Both screens paint it identically, so it stays
 * put while the machine screen opens over the list.
 */
export const FLOOR_APP_CHROME = { top: 90, bottom: 40 } as const;
/** The glass corner radius in canvas pixels (the same on both axes). */
export const FLOOR_APP_RADIUS = (PHONE_SCR_R / PHONE_SCR_W) * FLOOR_APP_CANVAS.w;

/** A canvas-pixel box: left, top, width, height. */
export type FloorAppBox = { x: number; y: number; w: number; h: number };

/**
 * Once every thumbnail has landed, the first row's "View exercises" is
 * tapped, then that button opens into the machine's screen. On the way to
 * the plan the screen closes back into its button.
 */
export function floorOpenAt(t: number) {
  return {
    press: smoothstep((t - 0.75) / 0.03) * (1 - smoothstep((t - 1.08) / 0.02)),
    expand: smoothstep((t - 0.78) / 0.12) * (1 - smoothstep((t - 1.01) / 0.07)),
  };
}

export type FloorOpenFrame = {
  /** The card: centre, half size and corner radius, canvas pixels. */
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  radius: number;
  /** The card's canvas box that the machine screen is fitted into, by width. */
  left: number;
  top: number;
  scale: number;
  /** Lime press highlight under the label, before the card turns solid. */
  tint: number;
  /** 0 the translucent button, 1 a solid raised card. */
  fill: number;
  /** How far the machine screen has faded in inside the card. */
  content: number;
  /** Dimming of the list around the card. */
  scrim: number;
  /** Soft shadow the moving card casts on the list. */
  shadow: number;
  /** Opacity of the button's own face, for a button that is not in the list. */
  face: number;
};

/**
 * A container transform from the tapped button to the full screen. Width
 * leads height, so the pill first swells into a card and then grows up and
 * down the screen. The screen inside is fitted to the card's width from its
 * top, so at 1 it sits on its own pixels.
 */
export function floorOpenFrame(button: FloorAppBox, press: number, expand: number): FloorOpenFrame {
  const { w: W, h: H } = FLOOR_APP_CANVAS;
  const e = clamp01(expand);
  const across = smoothstep(e / 0.72);
  const down = smoothstep((e - 0.1) / 0.9);
  // The button gives a little under the finger.
  const give = lerp(0.94, 1, clamp01(press));
  const hw = lerp((button.w / 2) * give, W / 2, across);
  const hh = lerp((button.h / 2) * give, H / 2, down);
  const cx = lerp(button.x + button.w / 2, W / 2, across);
  const cy = lerp(button.y + button.h / 2, H / 2, down);
  return {
    cx,
    cy,
    hw,
    hh,
    radius: lerp((button.h / 2) * give, FLOOR_APP_RADIUS, e),
    left: cx - hw,
    top: cy - hh,
    scale: (hw * 2) / W,
    tint: 0.22 * clamp01(press),
    // Solid while still pill-sized: a lime wash stretched over the list reads as mud.
    fill: smoothstep(e / 0.16),
    content: smoothstep((e - 0.24) / 0.52),
    scrim: 0.5 * smoothstep(e / 0.5),
    shadow: 0.5 * Math.sin(Math.PI * e),
    face: 1,
  };
}

// ---- planning a workout, then a coach's routine -----------------------------

/** The AI workout and the coach's routine share one layout, canvas pixels. */
export const FLOOR_PLAN_LAYOUT = {
  /** Top of the first exercise row, and the pitch between rows. */
  rowsTop: 390,
  pitch: 196,
  /** Left edge of each row's text, right of the machine's well. */
  textX: 216,
  /** The full-width action under the rows. */
  action: { y: 1262, h: 88 },
  /** The floating "AI workout" pill over the equipment list: top and height. */
  offer: { y: 1372, h: 84 },
} as const;
/** Machine index in each slot of the AI workout. */
export const FLOOR_PLAN_ORDER: readonly number[] = [1, 0, 2, 3];
/**
 * Machine index in each slot of the coach's routine: the bike moves up to
 * warm up, and everything else steps down one well.
 */
export const FLOOR_COACH_ORDER: readonly number[] = [3, 1, 0, 2];

/**
 * Back on the list, an "AI workout" pill rises, is tapped and opens into the
 * workout. Then a coach's builder takes over the same screen, and the coach
 * publishes the routine to the gym.
 */
export function floorPlanAt(t: number) {
  return {
    offer: smoothstep((t - 1.07) / 0.05),
    press: smoothstep((t - 1.13) / 0.025),
    expand: smoothstep((t - 1.155) / 0.12),
    swap: smoothstep((t - 1.45) / 0.04),
    /** Publish is held down, then the routine is live on the gym's page. */
    publishing: t >= 1.67,
    published: t >= 1.7,
  };
}

/**
 * The pill's card: it rises into place, then opens like the machine button.
 * Unlike that link, the pill paints its own face, and floats on a shadow.
 */
export function floorOfferFrame(pill: FloorAppBox, offer: number, press: number, expand: number): FloorOpenFrame {
  const o = clamp01(offer);
  const p = clamp01(press);
  // A visible button dips under the finger and springs back as it opens.
  const dip = 1 - 0.05 * Math.sin(Math.PI * p);
  const w = pill.w * dip;
  const h = pill.h * dip;
  const box = { x: pill.x + (pill.w - w) / 2, y: pill.y + (pill.h - h) / 2 + (1 - o) * 28, w, h };
  const frame = floorOpenFrame(box, 1, expand);
  return {
    ...frame,
    tint: 0.22 * p,
    face: o,
    shadow: Math.max(frame.shadow, 0.45 * o * (1 - clamp01(expand))),
  };
}

/**
 * How far a machine has moved into its AI slot, and on into the coach's.
 * Into the workout they leave in list order, so the two that trade places
 * cross mid-swing. For the coach, the bike lifts out first and swings over
 * the rest, which step down one well together to clear the top one.
 */
export function floorPlanTravel(t: number, index: number) {
  const leap = FLOOR_COACH_ORDER.indexOf(index) < FLOOR_PLAN_ORDER.indexOf(index);
  return {
    plan: smoothstep((t - 1.22 - index * 0.024) / 0.07),
    coach: leap ? smoothstep((t - 1.5) / 0.11) : smoothstep((t - 1.52) / 0.07),
  };
}

/** A row's text is painted once its machine has all but settled into the well. */
const FLOOR_PLAN_LANDING = 0.9;

/** Which slots of the AI workout and of the coach's routine show their exercise. */
export function floorPlanLanded(t: number) {
  return {
    plan: FLOOR_PLAN_ORDER.map((index) => floorPlanTravel(t, index).plan >= FLOOR_PLAN_LANDING),
    coach: FLOOR_COACH_ORDER.map((index) => floorPlanTravel(t, index).coach >= FLOOR_PLAN_LANDING),
  };
}

/** Phone-local centre of a slot's well. Wells line up under the list's. */
export function floorPlanSlot(slot: number) {
  const { rowsTop, pitch } = FLOOR_PLAN_LAYOUT;
  return {
    x: floorAppRow(0).x,
    y: (0.5 - (rowsTop + pitch * (slot + 0.5)) / FLOOR_APP_CANVAS.h) * PHONE_SCR_H,
  };
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
  // In the app, the thumbnail moves between wells: the list row, then its
  // AI slot, then its slot in the coach's routine.
  const travel = floorPlanTravel(progress, index);
  const planSlot = floorPlanSlot(FLOOR_PLAN_ORDER.indexOf(index)).y;
  const coachSlot = floorPlanSlot(FLOOR_COACH_ORDER.indexOf(index)).y;
  const localY = lerp(lerp(row.y, planSlot, travel.plan), coachSlot, travel.coach);
  const hop =
    floorPlanHop(row.y, planSlot, travel.plan, row.thumb) +
    floorPlanHop(planSlot, coachSlot, travel.coach, row.thumb);
  return {
    x: lerp(item.x * fx, dest.x, mix) + hop * FLOOR_PHONE_SCALE,
    y:
      lerp(0, floorScreenWorldY() + 0.03 + lift, mix) +
      row.thumb * FLOOR_PHONE_SCALE * 0.5 * (Math.sin(Math.PI * travel.plan) + Math.sin(Math.PI * travel.coach)),
    z: lerp(item.z * fz, dest.z, mix) - (localY - row.y) * FLOOR_PHONE_SCALE,
    scale: lerp(Math.min(fx, fz), floorMachineAppScale(index), mix),
    rotation: lerp(item.rotation, FLOOR_THUMB_ROT_Y, mix),
    rotX: lerp(0, FLOOR_THUMB_ROT_X, mix),
  };
}

/**
 * Sideways swing of a thumbnail changing wells, phone-local. A machine
 * going further than the next well swings wide into the text column, so it
 * passes the machines it overtakes instead of passing through them.
 */
function floorPlanHop(fromY: number, toY: number, travel: number, thumb: number) {
  const pitch = (FLOOR_PLAN_LAYOUT.pitch / FLOOR_APP_CANVAS.h) * PHONE_SCR_H;
  return Math.abs(toY - fromY) > pitch * 1.2 ? 1.3 * thumb * Math.sin(Math.PI * travel) : 0;
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
