import { PHONE_SCR_H, PHONE_SCR_W } from "../phoneModel";
import { floorEquipment, type FloorMachine } from "./floorEquipment";
import {
  FLOOR_APP_TITLE,
  floorAppNumber,
  floorAppRow,
} from "./floorTimeline";

export type FloorAppCopy = {
  overview: string;
  title: string;
  city: string;
  find: string;
  equipment: string;
  machines: string;
  view: string;
  names: Record<FloorMachine["id"], string>;
  areas: Record<FloorMachine["area"], string>;
};

const canvasX = (localX: number, w: number) => (localX / PHONE_SCR_W + 0.5) * w;
const canvasY = (localY: number, h: number) => (0.5 - localY / PHONE_SCR_H) * h;

/** Split a name into at most two lines that fit `max` pixels. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
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

/**
 * The gym overview the floor turns into. Thumbnail wells stay empty: the real
 * floor models land in them, and the list rules are the floor seams
 * themselves. The title and 01–04 indices are painted only once their 3D
 * counterparts have landed on these exact pixels.
 */
export function drawFloorAppScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: { numbers: boolean; title: boolean; copy: FloorAppCopy },
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
    if (options.numbers) {
      ctx.fillStyle = lime;
      ctx.font = `600 ${(number.size / PHONE_SCR_H) * h}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(item.number, canvasX(number.x, w), areaY);
      ctx.textAlign = "left";
    }
    text(copy.areas[item.area].toUpperCase(), areaX, areaY, 18, muted, 600);
    ctx.font = font(32, 600);
    const lines = wrap(ctx, copy.names[item.id], w - areaX - 64);
    if (lines.length > 1) {
      text(lines[0]!, areaX, cy - 9, 32, ink, 600);
      text(lines[1]!, areaX, cy + 27, 32, ink, 600);
    } else {
      text(lines[0]!, areaX, cy + 5, 32, ink, 600);
    }
    text(copy.view, areaX, cy + 65, 21, lime, 500);
    ctx.textAlign = "right";
    text("›", w - 32, cy + 11, 36, muted);
    ctx.textAlign = "left";
  }
  // Home indicator.
  rounded(w / 2 - 74, h - 24, 148, 7, 4, ink);
}
