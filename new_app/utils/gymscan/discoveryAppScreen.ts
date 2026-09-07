import { PHONE_SCR_H, PHONE_SCR_W } from "../phoneModel";
import { discoveryEquipment, discoveryLocation } from "./discoveryEquipment";
import { discoveryAppDivider, discoveryAppRow } from "./discoveryTimeline";

/** A single texture; the actual floor models become its equipment thumbnails. */
export function drawDiscoveryAppScreen(ctx: CanvasRenderingContext2D, w: number, h: number, options: { dividers?: boolean } = {}) {
  const ink = "#eff2ed", muted = "#a8b1a9", lime = "#ccff00";
  const text = (value: string, x: number, y: number, size: number, color = ink, weight = 500) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Inter, sans-serif`;
    ctx.fillText(value, x, y);
  };
  const rounded = (x: number, y: number, width: number, height: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();
  };
  ctx.fillStyle = "#101411";
  ctx.fillRect(0, 0, w, h);
  text("9:41", 42, 66, 25, ink, 600);
  for (let i = 0; i < 4; i++) rounded(w - 130 + i * 9, 64 - i * 5, 6, 8 + i * 5, 2, ink);
  ctx.strokeStyle = muted;
  ctx.lineWidth = 2;
  ctx.strokeRect(w - 78, 43, 39, 21);
  rounded(w - 74, 47, 31, 13, 2, ink);
  rounded(w - 37, 49, 3, 9, 1, muted);
  text("‹", 38, 147, 48);
  text("GYM OVERVIEW", 76, 137, 20, muted, 600);
  text("Your gym", 38, 216, 57, ink, 650);
  text(discoveryLocation.city, 40, 256, 26, muted);
  rounded(38, 288, w - 76, 64, 15, "#1c231e");
  ctx.strokeStyle = muted;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(68, 317, 10, 0, Math.PI * 2);
  ctx.moveTo(76, 325); ctx.lineTo(84, 333); ctx.stroke();
  text("Find a machine", 104, 330, 25, muted);
  text("Equipment", 38, 398, 32, ink, 600);
  ctx.textAlign = "right";
  text(`${discoveryEquipment.length} machines`, w - 38, 397, 23, muted);
  ctx.textAlign = "left";

  for (let i = 0; i < discoveryEquipment.length; i++) {
    const item = discoveryEquipment[i]!;
    const row = discoveryAppRow(i);
    const thumb = row.thumb / PHONE_SCR_W * w;
    const cx = (row.x / PHONE_SCR_W + 0.5) * w;
    const cy = (0.5 - row.y / PHONE_SCR_H) * h;
    const x = cx - thumb / 2;
    rounded(x, cy - thumb / 2, thumb, thumb, 20, "#29332c");
    const tx = x + thumb + 25;
    text(item.area.toUpperCase(), tx, cy - 49, 18, muted, 600);
    if (item.id === "plate-loaded-pulldown") {
      text("Plate-loaded", tx, cy - 9, 32, ink, 600);
      text("pulldown", tx, cy + 27, 32, ink, 600);
    } else {
      text(item.name, tx, cy + 5, 32, ink, 600);
    }
    text("View exercises", tx, cy + 65, 21, lime);
    ctx.textAlign = "right";
    text("›", w - 32, cy + 11, 36, muted);
    ctx.textAlign = "left";
    if (options.dividers !== false && i < discoveryEquipment.length - 1) {
      const divider = discoveryAppDivider(i);
      const inset = (0.5 - divider.halfWidth / PHONE_SCR_W) * w;
      const y = (0.5 - divider.y / PHONE_SCR_H) * h;
      ctx.strokeStyle = "#29312a";
      ctx.lineWidth = divider.thickness / PHONE_SCR_H * h;
      ctx.beginPath(); ctx.moveTo(inset, y); ctx.lineTo(w - inset, y); ctx.stroke();
    }
  }
  text("LIFTAG", 40, h - 60, 19, lime, 700);
  ctx.textAlign = "right";
  text("Your floor. Ready to train.", w - 40, h - 60, 19, muted);
  ctx.textAlign = "left";
  rounded(w / 2 - 74, h - 24, 148, 7, 4, ink);
}
