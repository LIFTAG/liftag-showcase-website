import { clamp01, smoothstep } from "./timeline.ts";
import type { GymScanDevice, WebGL2Probe } from "./device.ts";

/** Viewport units are measured from the semantic section boundaries. */
export function gymJourneyAt(
  scroll: number,
  tag: number,
  member: number,
  owner: number,
  kit = Infinity,
  discover = Infinity,
) {
  const installationEnd = tag + (member - tag) * 0.4;
  return {
    assembly: clamp01(scroll / Math.max(1, installationEnd)),
    film: clamp01(
      (scroll - installationEnd) / Math.max(1, member - 96 - installationEnd),
    ),
    gallery: smoothstep(
      (scroll - (owner - 96 - (member - tag) * 0.1)) /
        Math.max(1, (member - tag) * 0.1),
    ),
    chapter:
      scroll >= kit - 96
        ? "kit"
        : scroll >= discover - 96
          ? "discover"
          : scroll >= owner - 96
            ? "gyms"
            : scroll >= member - 96
              ? "lifters"
              : scroll >= tag - 96
                ? "the-tag"
                : "experience",
  };
}

/**
 * Desktop film is signed off at 1440×900 × 1.25² ≈ 2.0 Mpx. The gym is
 * fragment-bound, so this is the fill budget. Phones have far fewer CSS
 * pixels, and the old compact cap of 1 left that budget on the table —
 * the hologram cage is barycentric fwidth wires, which read as enlarged
 * blocks once the buffer is stretched to a 2×/3× display.
 */
export const EXPERIENCE_PIXEL_BUDGET = 1440 * 900 * 1.25 * 1.25;
export const EXPERIENCE_DESKTOP_DPR_CAP = 1.25;
/** iPhone-class screens are ~1/4 the CSS area, so 2.5× still sits under budget. */
export const EXPERIENCE_PHONE_DPR_CAP = 2.5;

/**
 * Phone DPR ceiling from the desktop fill budget. Compact still skips bloom,
 * shadows, and MSAA — those are the expensive quality axes. Resolution is
 * the cheap one: a 390×844 canvas at 2.48× is the same pixel count as
 * desktop at 1.25×, which is what keeps the hologram sharp without adding
 * passes.
 */
export function experienceDprCap(
  compact: boolean,
  cssWidth = 390,
  cssHeight = 844,
): number {
  if (!compact) return EXPERIENCE_DESKTOP_DPR_CAP;
  const area = Math.max(1, cssWidth * cssHeight);
  return Math.min(
    EXPERIENCE_PHONE_DPR_CAP,
    Math.sqrt(EXPERIENCE_PIXEL_BUDGET / area),
  );
}

/**
 * Discovery canvas DPR. Desktop keeps the existing 1.5 cap. Compact spends
 * the same unused fill the gym film does, so the equipment GLBs match the
 * hero machine instead of sitting at 1.5× on a 3× display.
 */
export function discoveryPixelRatio(
  devicePixelRatio: number,
  cssWidth: number,
  cssHeight: number,
): number {
  const native = devicePixelRatio > 0 ? devicePixelRatio : 1;
  const compact = cssWidth < 760;
  const cap = compact ? experienceDprCap(true, cssWidth, cssHeight) : 1.5;
  return Math.min(native, cap);
}

/** Graphics quality is independent of the film: phones retain every shot. */
export function experienceDevice(
  probe: WebGL2Probe,
  saveData: boolean,
  compact: boolean,
  cssWidth?: number,
  cssHeight?: number,
): GymScanDevice {
  const available = probe.webgl2 && !probe.probeFailed && !saveData;
  return {
    cut: "floor",
    deviceClass: available ? "floor" : "C",
    dprCap: experienceDprCap(compact, cssWidth, cssHeight),
    bloom: !compact,
    shadows: !compact,
    msaa: !compact,
    startStage: available,
    blitAfterLock: false,
  };
}

export type { GymEquipment } from "./equipment";
export type GymProductView = "exercise" | "history" | "coach";
export interface GymJourney {
  assembly: number;
  film: number;
  gallery: number;
  chapter: string;
}
