// The app after the gym overview: an AI workout built from this gym's
// machines, and a coach's routine for the same gym. Both share one layout,
// and their wells stay empty: the floor's own models land in them.
import { PHONE_SCR_W } from "../phoneModel";
import { floorEquipment } from "./floorEquipment";
import { wrap, type FloorAppCopy, type FloorPlanExercise } from "./floorAppScreen";
import {
  FLOOR_COACH_ORDER,
  FLOOR_PLAN_LAYOUT,
  FLOOR_PLAN_ORDER,
  floorAppRow,
  type FloorAppBox,
} from "./floorTimeline";

const INK = "#eff2ed";
const MUTED = "#9aa49c";
const LIME = "#ccff00";
const BG = "#0e1210";
const CARD = "#1a201c";
const PILL_TEXT = 26;

type Ctx = CanvasRenderingContext2D;

function text(ctx: Ctx, value: string, x: number, y: number, size: number, color = INK, weight = 500) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, sans-serif`;
  ctx.fillText(value, x, y);
}

function rounded(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
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

function pin(ctx: Ctx, cx: number, cy: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 9, Math.PI, 0);
  ctx.quadraticCurveTo(cx + 9, cy + 4, cx, cy + 12);
  ctx.quadraticCurveTo(cx - 9, cy + 4, cx - 9, cy - 4);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

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

function background(ctx: Ctx, w: number, h: number, copy: FloorAppCopy) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  // Back to the gym, as on the machine screen. The stage keeps the list's chrome.
  text(ctx, "‹", 38, 147, 48);
  text(ctx, copy.title, 80, 137, 24, MUTED);
}

/** Exercise rows: a skeleton until the row's machine has landed in its well. */
function rows(ctx: Ctx, w: number, order: readonly number[], exercises: FloorPlanExercise[], landed: readonly boolean[]) {
  const { rowsTop, pitch, textX } = FLOOR_PLAN_LAYOUT;
  const row = floorAppRow(0);
  const thumb = (row.thumb / PHONE_SCR_W) * w;
  const cx = (row.x / PHONE_SCR_W + 0.5) * w;
  const max = w - textX - 38;
  order.forEach((index, slot) => {
    const cy = rowsTop + pitch * (slot + 0.5);
    const left = cx - thumb / 2;
    const top = cy - thumb / 2;
    const exercise = exercises[slot];
    const well = ctx.createRadialGradient(cx, cy - thumb * 0.1, 0, cx, cy, thumb * 0.72);
    well.addColorStop(0, "#39443b");
    well.addColorStop(1, "#1d241f");
    ctx.fillStyle = well;
    ctx.beginPath();
    ctx.roundRect(left, top, thumb, thumb, 22);
    ctx.fill();
    if (!landed[slot] || !exercise) {
      rounded(ctx, textX, cy - 52, 44, 16, 8, CARD);
      rounded(ctx, textX, cy - 18, 290, 26, 13, CARD);
      rounded(ctx, textX, cy + 22, 110, 20, 10, CARD);
      return;
    }
    ctx.font = `600 30px Inter, sans-serif`;
    const lines = wrap(ctx, exercise.name, max);
    const first = cy + 2 - (lines.length - 1) * 17;
    ctx.fillStyle = LIME;
    ctx.font = `600 20px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(floorEquipment[index]!.number, textX, first - 38);
    lines.forEach((line, i) => text(ctx, line, textX, first + i * 34, 30, INK, 600));
    text(ctx, exercise.sets, textX, first + (lines.length - 1) * 34 + 40, 24, MUTED);
  });
}

function action(ctx: Ctx, w: number, label: string, state: "off" | "on" | "pressed" | "done") {
  const { y, h } = FLOOR_PLAN_LAYOUT.action;
  const inset = state === "pressed" ? 6 : 0;
  const x = 38 + inset;
  const width = w - 76 - inset * 2;
  const top = y + inset;
  const height = h - inset * 2;
  const fill = { off: CARD, on: LIME, pressed: "#a9d400", done: CARD }[state];
  rounded(ctx, x, top, width, height, height / 2, fill);
  const color = state === "off" ? MUTED : state === "done" ? LIME : BG;
  ctx.font = `600 28px Inter, sans-serif`;
  const labelW = ctx.measureText(label).width;
  const tick = state === "done" ? 38 : 0;
  const start = w / 2 - (labelW + tick) / 2;
  const baseline = y + h / 2 + 10;
  if (state === "done") {
    ctx.strokeStyle = LIME;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 1, top + 1, width - 2, height - 2, height / 2);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(start + 2, baseline - 10);
    ctx.lineTo(start + 10, baseline - 2);
    ctx.lineTo(start + 24, baseline - 20);
    ctx.stroke();
  }
  text(ctx, label, start + tick, baseline, 28, color, 600);
}

/** The AI workout: built from this gym's machines while they move in. */
export function drawFloorPlanScreen(ctx: Ctx, w: number, h: number, copy: FloorAppCopy, landed: readonly boolean[]) {
  background(ctx, w, h, copy);
  const built = landed.every(Boolean);
  sparkle(ctx, 49, 204, 11, LIME);
  text(ctx, `AI  ·  ${copy.title.toUpperCase()}`, 68, 211, 20, LIME, 600);
  text(ctx, copy.plan.title, 38, 274, 48, INK, 600);
  text(ctx, built ? copy.plan.summary : copy.plan.building, 38, 322, 24, MUTED);
  rows(ctx, w, FLOOR_PLAN_ORDER, copy.plan.exercises, landed);
  action(ctx, w, copy.plan.start, built ? "on" : "off");
}

export type FloorPublishState = "idle" | "pressed" | "live";

/** A coach's routine for the gym, built on the same machines. */
export function drawFloorCoachScreen(
  ctx: Ctx,
  w: number,
  h: number,
  copy: FloorAppCopy,
  landed: readonly boolean[],
  publish: FloorPublishState,
) {
  background(ctx, w, h, copy);
  const { coach } = copy;
  // The coach: avatar, name and role.
  ctx.fillStyle = "#2c3a2f";
  ctx.beginPath();
  ctx.arc(56, 203, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = LIME;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.textAlign = "center";
  text(ctx, coach.name.charAt(0), 56, 211, 21, INK, 600);
  ctx.textAlign = "left";
  text(ctx, coach.name, 90, 211, 23, INK, 600);
  const badgeX = 90 + ctx.measureText(coach.name).width + 14;
  const role = coach.role.toUpperCase();
  ctx.font = "700 15px Inter, sans-serif";
  const badgeW = ctx.measureText(role).width + 22;
  rounded(ctx, badgeX, 188, badgeW, 28, 14, LIME);
  text(ctx, role, badgeX + 11, 208, 15, BG, 700);
  text(ctx, coach.title, 38, 274, 48, INK, 600);
  // For this gym.
  pin(ctx, 48, 314, LIME);
  text(ctx, copy.title, 68, 322, 24, LIME, 600);
  rows(ctx, w, FLOOR_COACH_ORDER, coach.exercises, landed);
  const ready = landed.every(Boolean);
  if (publish === "live") action(ctx, w, coach.live, "done");
  else action(ctx, w, coach.publish, publish === "pressed" ? "pressed" : ready ? "on" : "off");
}
