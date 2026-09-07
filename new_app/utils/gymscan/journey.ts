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

/** Graphics quality is independent of the film: phones retain every shot. */
export function experienceDevice(
  probe: WebGL2Probe,
  saveData: boolean,
  compact: boolean,
): GymScanDevice {
  const available = probe.webgl2 && !probe.probeFailed && !saveData;
  return {
    cut: "floor",
    deviceClass: available ? "floor" : "C",
    dprCap: compact ? 1 : 1.25,
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
