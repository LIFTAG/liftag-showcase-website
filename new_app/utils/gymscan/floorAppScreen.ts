import { PHONE_SCR_H, PHONE_SCR_W } from "../phoneModel";
import { floorEquipment, type FloorMachine } from "./floorEquipment";
import {
  FLOOR_APP_CHROME,
  FLOOR_APP_LAYOUT,
  FLOOR_APP_TITLE,
  floorAppName,
  floorAppNumber,
  floorAppRow,
  type FloorAppBox,
} from "./floorTimeline";

export type FloorAppCopy = {
  overview: string;
  title: string;
  city: string;
  find: string;
  equipment: string;
  machines: string;
  view: string;
  exerciseList: string;
  exerciseHint: string;
  exerciseNames: string[];
  exerciseMuscles: string;
  exerciseGuide: string;
  names: Record<FloorMachine["id"], string>;
  areas: Record<FloorMachine["area"], string>;
  /** The AI workout for this gym; exercises in slot order. */
  plan: {
    offer: string;
    title: string;
    building: string;
    summary: string;
    start: string;
    exercises: FloorPlanExercise[];
  };
  /** A coach's routine for the gym; exercises in slot order. */
  coach: {
    name: string;
    role: string;
    title: string;
    publish: string;
    live: string;
    exercises: FloorPlanExercise[];
  };
};

export type FloorPlanExercise = { name: string; sets: string };

const canvasX = (localX: number, w: number) => (localX / PHONE_SCR_W + 0.5) * w;
const canvasY = (localY: number, h: number) => (0.5 - localY / PHONE_SCR_H) * h;
/** A row's lime "View exercises" link: size and baseline below the row centre. */
const VIEW_SIZE = 21;
const VIEW_DROP = 65;

/** Split a name into at most two lines that fit `max` pixels. */
export function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return [text];
  const words = text.split(" ");
  let best: [string, string] = [text, ""];
  let bestWidth = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const width = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (width < bestWidth) {
      best = [a, b];
      bestWidth = width;
    }
  }
  return best[1] ? best : [text];
}

export type FloorAppNameLayout = {
  lines: string[];
  /** Advance of the first line, in em, where a wrapped second line starts. */
  wrap: number;
  /** Baseline pitch between the two lines, in em. */
  leading: number;
};

/**
 * How the app sets a machine's name in its row. The painter and the flying
 * floor tag both follow this, so the tag lands on the painted lines.
 */
export function floorAppNameLayout(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  index: number,
  name: string,
): FloorAppNameLayout {
  const size = FLOOR_APP_LAYOUT.nameSize * h;
  ctx.font = `600 ${size}px Inter, sans-serif`;
  const left = canvasX(floorAppName(index, 1).x, w);
  const lines = wrap(ctx, name, w - left - FLOOR_APP_LAYOUT.nameInsetRight * w);
  return {
    lines,
    wrap: lines.length > 1 ? ctx.measureText(lines[0]!).width / size : 0,
    leading: FLOOR_APP_LAYOUT.nameLeading / FLOOR_APP_LAYOUT.nameSize,
  };
}

/**
 * The tap target around a row's "View exercises" link, canvas pixels. The
 * machine screen opens out of this box.
 */
export function floorViewButton(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  index: number,
  label: string,
): FloorAppBox {
  ctx.font = `500 ${VIEW_SIZE}px Inter, sans-serif`;
  const x = canvasX(floorAppNumber(index).areaX, w);
  const baseline = canvasY(floorAppRow(index).y, h) + VIEW_DROP;
  const padX = 14;
  const height = 38;
  // Centred on the lowercase letters, which carry most of the label.
  const middle = baseline - VIEW_SIZE * 0.36;
  return { x: x - padX, y: middle - height / 2, w: ctx.measureText(label).width + padX * 2, h: height };
}

/**
 * The gym overview the floor turns into. Thumbnail wells stay empty: the real
 * floor models land in them, and the list rules are the floor seams
 * themselves. The title, and each row's index and name, are painted only
 * once their floor counterparts have landed on these exact pixels.
 */
export function drawFloorAppScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: { landed: readonly boolean[]; title: boolean; copy: FloorAppCopy },
) {
  const { copy } = options;
  const ink = "#eff2ed";
  const muted = "#9aa49c";
  const lime = "#ccff00";
  const font = (size: number, weight = 500) => `${weight} ${size}px Inter, sans-serif`;
  const text = (value: string, x: number, y: number, size: number, color = ink, weight = 500) => {
    ctx.fillStyle = color;
    ctx.font = font(size, weight);
    ctx.fillText(value, x, y);
  };
  const rounded = (x: number, y: number, width: number, height: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();
  };
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0e1210";
  ctx.fillRect(0, 0, w, h);
  // Status bar.
  text("9:41", 42, 66, 25, ink, 600);
  for (let i = 0; i < 4; i++) rounded(w - 130 + i * 9, 64 - i * 5, 6, 8 + i * 5, 2, ink);
  ctx.strokeStyle = muted;
  ctx.lineWidth = 2;
  ctx.strokeRect(w - 78, 43, 39, 21);
  rounded(w - 74, 47, 31, 13, 2, ink);
  rounded(w - 37, 49, 3, 9, 1, muted);
  // Header.
  text("‹", 38, 147, 48);
  text(copy.overview, 76, 137, 20, muted, 600);
  if (options.title)
    text(copy.title, FLOOR_APP_TITLE.x, FLOOR_APP_TITLE.baseline, FLOOR_APP_TITLE.size, ink, FLOOR_APP_TITLE.weight);
  text(copy.city, 40, 256, 26, muted);
  rounded(38, 288, w - 76, 64, 18, "#1a201c");
  ctx.strokeStyle = muted;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(68, 317, 10, 0, Math.PI * 2);
  ctx.moveTo(76, 325);
  ctx.lineTo(84, 333);
  ctx.stroke();
  text(copy.find, 104, 330, 25, muted);
  text(copy.equipment, 38, 398, 32, ink, 600);
  ctx.textAlign = "right";
  text(`${floorEquipment.length} ${copy.machines}`, w - 38, 397, 23, muted);
  ctx.textAlign = "left";

  for (let i = 0; i < floorEquipment.length; i++) {
    const item = floorEquipment[i]!;
    const row = floorAppRow(i);
    const number = floorAppNumber(i);
    const thumb = (row.thumb / PHONE_SCR_W) * w;
    const cx = canvasX(row.x, w);
    const cy = canvasY(row.y, h);
    const areaX = canvasX(number.areaX, w);
    const areaY = canvasY(number.baselineY, h);
    // A lit well: the machine that lands here is dark metal.
    const well = ctx.createRadialGradient(cx, cy - thumb * 0.1, 0, cx, cy, thumb * 0.72);
    well.addColorStop(0, "#39443b");
    well.addColorStop(1, "#1d241f");
    ctx.fillStyle = well;
    ctx.beginPath();
    ctx.roundRect(cx - thumb / 2, cy - thumb / 2, thumb, thumb, 22);
    ctx.fill();
    text(copy.areas[item.area].toUpperCase(), areaX, areaY, 18, muted, 600);
    if (options.landed[i]) {
      ctx.fillStyle = lime;
      ctx.font = `600 ${(number.size / PHONE_SCR_H) * h}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(item.number, canvasX(number.x, w), areaY);
      ctx.textAlign = "left";
      const { lines } = floorAppNameLayout(ctx, w, h, i, copy.names[item.id]);
      const name = floorAppName(i, lines.length);
      const size = (name.size / PHONE_SCR_H) * h;
      lines.forEach((line, n) => {
        text(line, canvasX(name.x, w), canvasY(name.y, h) + n * (name.leading / PHONE_SCR_H) * h, size, ink, 600);
      });
    }
    text(copy.view, areaX, cy + VIEW_DROP, VIEW_SIZE, lime, 500);
    ctx.textAlign = "right";
    text("›", w - 32, cy + 11, 36, muted);
    ctx.textAlign = "left";
  }
  // Home indicator.
  rounded(w / 2 - 74, h - 24, 148, 7, 4, ink);
}

/**
 * The machine opened from the first equipment row, painted once per locale.
 * The stage fits it into the card that grows out of that row's button.
 */
export function drawFloorExerciseScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  copy: FloorAppCopy,
  poster: HTMLImageElement | null,
) {
  const ink = "#eff2ed";
  const muted = "#9aa49c";
  const lime = "#ccff00";
  const text = (value: string, x: number, y: number, size: number, color = ink, weight = 500) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Inter, sans-serif`;
    ctx.fillText(value, x, y);
  };
  // Keep the status bar and home indicator fixed through the screen change.
  drawFloorAppScreen(ctx, w, h, {
    landed: floorEquipment.map(() => true),
    title: true,
    copy,
  });
  ctx.fillStyle = "#0e1210";
  ctx.fillRect(0, FLOOR_APP_CHROME.top, w, h - FLOOR_APP_CHROME.top - FLOOR_APP_CHROME.bottom);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  text("9:41", 42, 66, 25, ink, 600);
  text("‹", 38, 147, 48);
  text(copy.title, 80, 137, 24, muted);
  text(`01  ·  ${copy.areas.strength.toUpperCase()}`, 38, 211, 20, lime, 600);
  ctx.font = "600 48px Inter, sans-serif";
  wrap(ctx, copy.names["plate-loaded-pulldown"]!, w - 76).forEach((line, i) => {
    text(line, 38, 274 + i * 54, 48, ink, 600);
  });
  ctx.fillStyle = "#1d241f";
  ctx.beginPath();
  ctx.roundRect(38, 368, w - 76, 390, 28);
  ctx.fill();
  if (poster) ctx.drawImage(poster, w / 2 - 180, 382, 360, 360);
  text(copy.exerciseList, 38, 832, 38, ink, 600);
  text(copy.exerciseHint, 38, 877, 24, muted);
  copy.exerciseNames.forEach((name, i) => {
    const y = 922 + i * 210;
    ctx.fillStyle = "#1a201c";
    ctx.beginPath();
    ctx.roundRect(38, y, w - 76, 188, 24);
    ctx.fill();
    text(String(i + 1).padStart(2, "0"), 62, y + 43, 20, lime, 600);
    ctx.font = "600 30px Inter, sans-serif";
    wrap(ctx, name, w - 150).forEach((line, j) => text(line, 62, y + 82 + j * 34, 30, ink, 600));
    text(copy.exerciseMuscles, 62, y + 154, 23, muted);
    text("›", w - 77, y + 100, 40, lime);
  });
  text(copy.exerciseGuide, 38, 1418, 23, muted);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 74, h - 24, 148, 7, 4);
  ctx.fill();
}
