// The app after the gym overview. First the AI workout: the app's own
// generating screen, which fades away over the finished draft. Then the
// coach's side: clients listed with the gym each trains at, and one client's
// exercise library narrowed to that gym's machines.
import { LOGO_MARK_PATH, LOGO_VIEWBOX, MARK_CENTER_X, MARK_CENTER_Y } from "../brand/logoEntry";
import { floorEquipment } from "./floorEquipment";
import { wrap, type FloorAppCopy } from "./floorAppScreen";
import { floorCoachCatalog, floorOtherGymMachines, floorPlanImages } from "./floorRoutines";
import {
  FLOOR_PLAN_LAYOUT,
  floorLibraryRows,
  type FloorAppBox,
  type FloorGenerationStatus,
} from "./floorTimeline";

const INK = "#eff2ed";
const MUTED = "#9aa49c";
const LIME = "#ccff00";
const BG = "#0e1210";
const CARD = "#1a201c";
/** A photo's well before it loads, and the track under the progress bar. */
const WELL = "#222924";
const BORDER = "#2b332d";
const PLACEHOLDER = "#5c665e";
const WARNING = "#f59e0b";
const PILL_TEXT = 26;
const MARGIN = 38;

type Ctx = CanvasRenderingContext2D;
/** A picture the screens paint, by its URL, once it has loaded. */
export type FloorImageLookup = (src: string) => HTMLImageElement | null;

function text(ctx: Ctx, value: string, x: number, y: number, size: number, color = INK, weight = 500) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, sans-serif`;
  ctx.fillText(value, x, y);
}

function rounded(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, color: string | CanvasGradient) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Shorten `value` with an ellipsis until it fits `max` in the current font. */
function fit(ctx: Ctx, value: string, max: number) {
  let out = value;
  while (out.length > 1 && ctx.measureText(out).width > max) out = out.slice(0, -2) + "…";
  return out;
}

/**
 * A picture in a rounded well. Photos fill it, cropped about their centre;
 * a machine's cut-out render sits whole inside it, as in the equipment list.
 */
function picture(ctx: Ctx, image: HTMLImageElement | null, x: number, y: number, w: number, h: number, r: number) {
  const iw = image?.naturalWidth ?? 1;
  const ih = image?.naturalHeight ?? 1;
  const photo = iw / ih > 1.2;
  if (!image || photo) rounded(ctx, x, y, w, h, r, WELL);
  else {
    // The dark renders need the list's lit well to read.
    const well = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.72);
    well.addColorStop(0, "#56635a");
    well.addColorStop(1, "#262e28");
    rounded(ctx, x, y, w, h, r, well);
  }
  if (!image) return;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  if (photo) {
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  } else {
    const pad = Math.min(w, h) * 0.06;
    const scale = Math.min((w - pad * 2) / iw, (h - pad * 2) / ih);
    ctx.drawImage(image, x + (w - iw * scale) / 2, y + (h - ih * scale) / 2, iw * scale, ih * scale);
  }
  ctx.restore();
}

/** The four-point AI sparkle. */
function sparkle(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  const k = r * 0.28;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + k, cy - k, cx + r, cy);
  ctx.quadraticCurveTo(cx + k, cy + k, cx, cy + r);
  ctx.quadraticCurveTo(cx - k, cy + k, cx - r, cy);
  ctx.quadraticCurveTo(cx - k, cy - k, cx, cy - r);
  ctx.fill();
}

function pin(ctx: Ctx, cx: number, cy: number, color: string, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -4, 9, Math.PI, 0);
  ctx.quadraticCurveTo(9, 4, 0, 12);
  ctx.quadraticCurveTo(-9, 4, -9, -4);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(0, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function check(ctx: Ctx, cx: number, cy: number, r: number, color: string, mark: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = mark;
  ctx.lineWidth = r * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.12, cy + r * 0.32);
  ctx.lineTo(cx + r * 0.44, cy - r * 0.3);
  ctx.stroke();
}

const slotNumber = (slot: number) => String(slot + 1).padStart(2, "0");

/** The floating "AI workout for this gym" pill over the list, canvas pixels. */
export function floorOfferButton(ctx: Ctx, w: number, label: string): FloorAppBox {
  ctx.font = `600 ${PILL_TEXT}px Inter, sans-serif`;
  const width = 36 + 26 + 14 + ctx.measureText(label).width + 40;
  const { y, h } = FLOOR_PLAN_LAYOUT.offer;
  return { x: (w - width) / 2, y, w: width, h };
}

/** The pill's face, painted at its box size for the opening card to wear. */
export function drawFloorOffer(ctx: Ctx, box: FloorAppBox, label: string) {
  const { w, h } = box;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  rounded(ctx, 0, 0, w, h, h / 2, LIME);
  sparkle(ctx, 36 + 13, h / 2, 13, BG);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  text(ctx, label, 36 + 26 + 14, h / 2 + PILL_TEXT * 0.36, PILL_TEXT, BG, 600);
}

function background(ctx: Ctx, w: number, h: number, back: string) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  text(ctx, "‹", 38, 147, 48);
  text(ctx, back, 80, 137, 24, MUTED);
}

function action(ctx: Ctx, w: number, label: string) {
  const { y, h } = FLOOR_PLAN_LAYOUT.action;
  rounded(ctx, MARGIN, y, w - MARGIN * 2, h, h / 2, LIME);
  ctx.textAlign = "center";
  text(ctx, label, w / 2, y + h / 2 + 10, 28, BG, 600);
  ctx.textAlign = "left";
}

// ---- generating ------------------------------------------------------------

let markPath: Path2D | null = null;

/**
 * The loading mark in its idle loop, `seconds` into it: a slow breath of
 * glow behind it and a white glint sweeping round once every 1.8 seconds.
 */
function loadingMark(ctx: Ctx, cx: number, cy: number, size: number, seconds: number) {
  // The app's loading indicator is the LIFTAG mark itself.
  markPath ??= new Path2D(LOGO_MARK_PATH);
  const breathe = 0.5 - 0.5 * Math.cos((seconds / 0.9) * Math.PI);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.95);
  glow.addColorStop(0, `rgba(204,255,0,${0.1 + 0.08 * breathe})`);
  glow.addColorStop(1, "rgba(204,255,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
  const scale = size / LOGO_VIEWBOX;
  ctx.save();
  ctx.translate(cx - MARK_CENTER_X * scale, cy - MARK_CENTER_Y * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = LIME;
  ctx.fill(markPath);
  const turn = ((seconds / 1.8) % 1) * Math.PI * 2 - Math.PI / 2;
  const sweep = ctx.createConicGradient(turn, MARK_CENTER_X, MARK_CENTER_Y);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.1, "rgba(255,255,255,0.75)");
  sweep.addColorStop(0.2, "rgba(255,255,255,0)");
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  ctx.fill(markPath);
  ctx.restore();
}

/** The app's LoadingRing: an arc chasing round a faint track. */
function loadingRing(ctx: Ctx, cx: number, cy: number, seconds: number) {
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(204,255,0,0.2)";
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.stroke();
  const a = ((seconds / 0.9) % 1) * Math.PI * 2;
  ctx.strokeStyle = LIME;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 16, a, a + Math.PI * 0.6);
  ctx.stroke();
}

type StageState = "done" | "active" | "upcoming";

/** Stage rows from the run's lifecycle, as the app derives them. */
function stageStates(status: FloorGenerationStatus): StageState[] {
  if (status === "completed") return ["done", "done", "done"];
  if (status === "running") return ["done", "active", "active"];
  return ["active", "upcoming", "upcoming"];
}

const inOutQuad = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

export type FloorGeneration = {
  status: FloorGenerationStatus;
  /** Seconds since the request, as the app's clock counts them. */
  elapsed: number;
};

/**
 * The app's generating screen: the loading mark, the title and a running
 * clock, a bar sweeping while the run has no percentage to show, and the
 * stages checking off as the run moves on. `seconds` drives the idle loops.
 */
function generating(ctx: Ctx, w: number, h: number, copy: FloorAppCopy, run: FloorGeneration, seconds: number) {
  const G = FLOOR_PLAN_LAYOUT.generating;
  const complete = run.status === "completed";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  loadingMark(ctx, w / 2, G.mark, G.markSize, seconds);
  ctx.textAlign = "center";
  text(ctx, copy.plan.generating, w / 2, G.title, 44, INK, 700);
  const clock = `${Math.floor(run.elapsed / 60)}:${String(run.elapsed % 60).padStart(2, "0")}`;
  text(ctx, copy.plan.estimate.replace("{elapsed}", clock), w / 2, G.estimate, 26, MUTED);
  ctx.textAlign = "left";

  const x = 44;
  const width = w - x * 2;
  rounded(ctx, x, G.bar, width, 12, 6, WELL);
  if (complete) rounded(ctx, x, G.bar, width, 12, 6, LIME);
  else {
    // The app's sweep: a 36% segment crossing the track every 1.4 seconds.
    const position = -0.36 + 1.36 * inOutQuad((seconds / 1.4) % 1);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, G.bar, width, 12, 6);
    ctx.clip();
    rounded(ctx, x + position * width, G.bar, width * 0.36, 12, 6, LIME);
    ctx.restore();
  }

  const states = stageStates(run.status);
  const cardH = states.length * G.row + 24;
  rounded(ctx, x, G.card, width, cardH, 44, CARD);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 1, G.card + 1, width - 2, cardH - 2, 43);
  ctx.stroke();
  states.forEach((state, i) => {
    const top = G.card + 12 + i * G.row;
    const cy = top + G.row / 2;
    const iconX = x + 37 + 20;
    if (i > 0) {
      ctx.fillStyle = BORDER;
      ctx.fillRect(x + 37, top, width - 74, 2);
    }
    if (state === "done") check(ctx, iconX, cy, 19, LIME, BG);
    else if (state === "active") loadingRing(ctx, iconX, cy, seconds + i * 0.2);
    else {
      ctx.strokeStyle = PLACEHOLDER;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(iconX, cy, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    const active = state === "active";
    const weight = active ? 600 : 500;
    const max = width - 74 - 64;
    // A longer locale sets its stage a little smaller before it shortens it.
    let size = 29;
    ctx.font = `${weight} ${size}px Inter, sans-serif`;
    const natural = ctx.measureText(copy.plan.stages[i] ?? "").width;
    if (natural > max) size = Math.max(24, Math.floor((size * max) / natural));
    ctx.font = `${weight} ${size}px Inter, sans-serif`;
    const label = fit(ctx, copy.plan.stages[i] ?? "", max);
    const alpha = ctx.globalAlpha;
    if (state === "upcoming") ctx.globalAlpha = alpha * 0.6;
    text(ctx, label, iconX + 44, cy + 10, size, active ? INK : MUTED, weight);
    ctx.globalAlpha = alpha;
  });
}

/**
 * The finished draft, like the app's preview: name, length and level, why
 * the AI chose it, then each exercise with its photo and sets. The rows
 * settle in as the generating screen fades off them.
 */
function draft(ctx: Ctx, w: number, h: number, copy: FloorAppCopy, image: FloorImageLookup, reveal: readonly number[]) {
  const D = FLOOR_PLAN_LAYOUT.draft;
  background(ctx, w, h, copy.title);
  sparkle(ctx, 49, 204, 11, LIME);
  text(ctx, `AI  ·  ${copy.title.toUpperCase()}`, 68, 211, 20, LIME, 600);
  text(ctx, copy.plan.title, MARGIN, 274, 48, INK, 600);
  text(ctx, copy.plan.summary, MARGIN, 322, 24, MUTED);

  const width = w - MARGIN * 2;
  rounded(ctx, MARGIN, D.note, width, D.noteH, 32, CARD);
  text(ctx, copy.plan.why, MARGIN + 28, D.note + 50, 24, LIME, 600);
  ctx.font = "500 24px Inter, sans-serif";
  wrap(ctx, copy.plan.whyCopy, width - 56).forEach((line, i) => text(ctx, line, MARGIN + 28, D.note + 90 + i * 30, 24, INK));

  const thumbW = 200;
  const thumbH = D.h - 32;
  const textX = MARGIN + 16 + thumbW + 26;
  const max = MARGIN + width - 24 - textX;
  copy.plan.exercises.forEach((exercise, slot) => {
    const amount = reveal[slot] ?? 0;
    if (amount <= 0) return;
    const y = D.top + D.pitch * slot + (1 - amount) * 16;
    const cy = y + D.h / 2;
    ctx.globalAlpha = amount;
    rounded(ctx, MARGIN, y, width, D.h, 28, CARD);
    picture(ctx, image(floorPlanImages[slot] ?? ""), MARGIN + 16, y + 16, thumbW, thumbH, 20);
    ctx.font = "600 30px Inter, sans-serif";
    const lines = wrap(ctx, exercise.name, max);
    const first = cy + 2 - (lines.length - 1) * 17;
    ctx.fillStyle = LIME;
    ctx.font = `600 20px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(slotNumber(slot), textX, first - 38);
    lines.forEach((line, i) => text(ctx, line, textX, first + i * 34, 30, INK, 600));
    text(ctx, exercise.sets, textX, first + (lines.length - 1) * 34 + 40, 24, MUTED);
    ctx.globalAlpha = 1;
  });
  ctx.globalAlpha = reveal[reveal.length - 1] ?? 0;
  action(ctx, w, copy.plan.save);
  ctx.globalAlpha = 1;
}

export type FloorPlanState = {
  run: FloorGeneration;
  /** Opacity of the generating screen over the draft. */
  screen: number;
  /** How far each of the draft's rows has settled in. */
  reveal: readonly number[];
  /** Clock for the generating screen's idle loops, seconds. */
  seconds: number;
};

/** The AI workout: the generating screen at `screen` opacity over the draft. */
export function drawFloorPlanScreen(
  ctx: Ctx,
  w: number,
  h: number,
  copy: FloorAppCopy,
  image: FloorImageLookup,
  state: FloorPlanState,
) {
  if (state.screen < 1) draft(ctx, w, h, copy, image, state.reveal);
  if (state.screen <= 0) return;
  ctx.globalAlpha = state.screen;
  generating(ctx, w, h, copy, state.run, state.seconds);
  ctx.globalAlpha = 1;
}

// ---- the coach -------------------------------------------------------------

/** The coach's clients, in order: whether each one trains at this gym. */
const CLIENTS_HERE = [true, false, true] as const;
const HERE_MACHINES = floorEquipment.map((item) => item.poster);

/** A row of machine thumbnails: a gym's floor at a glance. Returns its right edge. */
function floorStrip(ctx: Ctx, image: FloorImageLookup, sources: readonly string[], x: number, y: number, size: number) {
  sources.forEach((src, i) => picture(ctx, image(src), x + i * (size + 10), y, size, size, 16));
  return x + sources.length * (size + 10) - 10;
}

/**
 * The coach's clients, each with the gym they train at and that gym's
 * machines. `tap` presses the first client, who trains here.
 */
export function drawFloorClientsScreen(ctx: Ctx, w: number, h: number, copy: FloorAppCopy, image: FloorImageLookup, tap: number) {
  const { coach } = copy;
  const C = FLOOR_PLAN_LAYOUT.clients;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  // The coach: avatar, name and role.
  ctx.fillStyle = "#2c3a2f";
  ctx.beginPath();
  ctx.arc(56, 158, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = LIME;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.textAlign = "center";
  text(ctx, coach.name.charAt(0), 56, 166, 21, INK, 600);
  ctx.textAlign = "left";
  text(ctx, coach.name, 90, 166, 23, INK, 600);
  const badgeX = 90 + ctx.measureText(coach.name).width + 14;
  const role = coach.role.toUpperCase();
  ctx.font = "700 15px Inter, sans-serif";
  const badgeW = ctx.measureText(role).width + 22;
  rounded(ctx, badgeX, 143, badgeW, 28, 14, LIME);
  text(ctx, role, badgeX + 11, 163, 15, BG, 700);
  text(ctx, coach.clients, MARGIN, 262, 48, INK, 600);
  text(ctx, coach.clientsHint, MARGIN, 306, 24, MUTED);

  const width = w - MARGIN * 2;
  CLIENTS_HERE.forEach((here, i) => {
    const y = C.top + C.pitch * i;
    const pressed = i === 0 ? tap : 0;
    rounded(ctx, MARGIN, y, width, C.h, 32, pressed > 0 ? "#222a24" : CARD);
    if (pressed > 0) {
      ctx.strokeStyle = `rgba(204,255,0,${pressed})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(MARGIN + 1.5, y + 1.5, width - 3, C.h - 3, 31);
      ctx.stroke();
    }
    const name = coach.people[i] ?? "";
    ctx.fillStyle = here ? "#2c3a2f" : "#2a2f33";
    ctx.beginPath();
    ctx.arc(MARGIN + 64, y + 66, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "center";
    text(ctx, name.charAt(0), MARGIN + 64, y + 77, 30, INK, 600);
    ctx.textAlign = "left";
    const textX = MARGIN + 124;
    text(ctx, name, textX, y + 60, 32, INK, 600);
    // Where they train, and what that gym has.
    pin(ctx, textX + 9, y + 100, here ? LIME : MUTED);
    text(ctx, here ? copy.title : coach.otherGym, textX + 28, y + 108, 24, here ? LIME : INK, 600);
    const sources = here ? HERE_MACHINES : floorOtherGymMachines;
    const end = floorStrip(ctx, image, sources, textX, y + 136, 72);
    text(ctx, `${sources.length} ${copy.machines}`, end + 18, y + 181, 22, MUTED);
    text(ctx, "›", MARGIN + width - 44, y + 132, 44, MUTED);
  });
}

export type FloorLibraryState = {
  /** The gym filter's switch, 0 off → 1 on. */
  filter: number;
  /** Exercises this gym cannot host are marked… */
  flag: number;
  /** …then leave the list. */
  remove: number;
  /** The add button, once the list is down to this floor. */
  add: number;
};

function toggle(ctx: Ctx, x: number, y: number, on: number) {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * on);
  rounded(ctx, x, y, 88, 48, 24, `rgb(${mix(0x2f, 0xcc)},${mix(0x37, 0xff)},${mix(0x31, 0x00)})`);
  ctx.fillStyle = on > 0.5 ? BG : "#c9d0ca";
  ctx.beginPath();
  ctx.arc(x + 24 + 40 * on, y + 24, 19, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * One client's exercise library. Their gym heads it, with its machines and
 * a switch; switched on, exercises that need equipment the gym lacks are
 * marked "Not at this gym" and drop out, and what is left can be added.
 */
export function drawFloorLibraryScreen(
  ctx: Ctx,
  w: number,
  h: number,
  copy: FloorAppCopy,
  image: FloorImageLookup,
  state: FloorLibraryState,
) {
  const { coach } = copy;
  const L = FLOOR_PLAN_LAYOUT.library;
  const width = w - MARGIN * 2;
  background(ctx, w, h, coach.people[0] ?? "");
  text(ctx, coach.library, MARGIN, 222, 48, INK, 600);

  // The client's gym, its floor and the filter.
  rounded(ctx, MARGIN, L.gym, width, L.gymH, 32, CARD);
  pin(ctx, MARGIN + 37, L.gym + 50, LIME, 1.2);
  text(ctx, copy.title, MARGIN + 60, L.gym + 58, 28, LIME, 600);
  text(ctx, coach.trainsHere, MARGIN + 28, L.gym + 96, 22, MUTED);
  const strip = 4 * 60 + 3 * 10;
  floorStrip(ctx, image, HERE_MACHINES, MARGIN + width - 26 - strip, L.gym + 24, 60);
  ctx.fillStyle = BORDER;
  ctx.fillRect(MARGIN + 28, L.gym + 122, width - 56, 2);
  ctx.font = "600 25px Inter, sans-serif";
  text(ctx, fit(ctx, coach.filter, width - 56 - 88 - 20), MARGIN + 28, L.gym + 174, 25, INK, 600);
  toggle(ctx, MARGIN + width - 28 - 88, L.gym + 141, state.filter);

  const rows = floorLibraryRows(state.remove);
  const kept = floorCoachCatalog.filter((item) => item.onFloor).length;
  ctx.fillStyle = MUTED;
  ctx.font = `600 18px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText(copy.exerciseList.toUpperCase(), MARGIN, L.head);
  ctx.textAlign = "right";
  ctx.fillText(String(state.remove > 0.5 ? kept : floorCoachCatalog.length), MARGIN + width, L.head);
  ctx.textAlign = "left";

  floorCoachCatalog.forEach((item, i) => {
    const row = rows[i]!;
    const exercise = coach.exercises[i];
    if (!exercise || row.alpha <= 0 || row.h < 1) return;
    ctx.save();
    // A dropped row folds away from the bottom as the rows below close up.
    ctx.beginPath();
    ctx.rect(0, row.y, w, row.h);
    ctx.clip();
    ctx.globalAlpha = row.alpha;
    const y = row.y;
    rounded(ctx, MARGIN, y, width, L.h, 24, CARD);
    picture(ctx, image(item.image), MARGIN + 10, y + 10, 150, L.h - 20, 16);
    const textX = MARGIN + 184;
    ctx.font = "600 28px Inter, sans-serif";
    text(ctx, fit(ctx, exercise.name, width - 184 - 64), textX, y + 48, 28, INK, 600);
    const flag = item.onFloor ? 0 : state.flag;
    ctx.globalAlpha = row.alpha * (1 - flag);
    text(ctx, exercise.equipment, textX, y + 86, 22, MUTED);
    if (flag > 0) {
      ctx.globalAlpha = row.alpha * flag;
      ctx.fillStyle = WARNING;
      ctx.beginPath();
      ctx.arc(textX + 8, y + 79, 8, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, coach.notHere, textX + 26, y + 86, 22, WARNING, 600);
    }
    // What this floor has is pinned to it.
    if (item.onFloor && state.flag > 0) {
      ctx.globalAlpha = state.flag;
      pin(ctx, MARGIN + width - 36, y + L.h / 2, LIME, 1.2);
    }
    ctx.restore();
  });

  if (state.add > 0) {
    ctx.globalAlpha = state.add;
    action(ctx, w, coach.add);
    ctx.globalAlpha = 1;
  }
}
