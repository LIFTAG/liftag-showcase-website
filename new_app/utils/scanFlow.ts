import type { ScreenVideoSegment, ScreenVideoSource } from './screenVideo.ts'

/**
 * One continuous capture of a real LIFTAG scan, used by ScanSection's 3D
 * phone. Gym-scan uses GYM_SCAN_FLOW_SOURCES (Pivot Leg Press) instead.
 *
 * AV1 first, H.264 as the universal fallback — same cut, and the AV1 encode
 * is roughly 40% of the bytes. Both files are written with
 * `-movflags +faststart` so the `moov` index is in front of `mdat`.
 */
export const SCAN_FLOW_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/scan-flow.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/scan-flow.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

/**
 * Procedural Pivot Leg Press capture for /gym-scan. Same 6.4s / 3.2s LOG
 * cut as SCAN_FLOW so the gym fold can QR-to-QR onto the flattened sticker.
 * ScanSection keeps the real-gym bench footage above.
 */
export const GYM_SCAN_FLOW_SOURCES: ScreenVideoSource[] = [
  { src: '/assets/videos/gym-scan-flow.av1.mp4', type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: '/assets/videos/gym-scan-flow.mp4', type: 'video/mp4; codecs="avc1.640028"' },
]

/** Viewfinder sweep and lock-on. Keyframe at 0s. */
export const SCAN_FLOW_SCAN: ScreenVideoSegment = { start: 0, end: 3.2 }

/**
 * iOS-scanner morph of the settled code into the log-set screen, then a short
 * hold on the settled UI. Keyframe at 3.2s — seeking to this cut from a pause
 * on the same timestamp is what used to freeze WebKit, so playback must not
 * re-assign `currentTime` when it is already there.
 */
export const SCAN_FLOW_LOG: ScreenVideoSegment = { start: 3.2, end: 6.4 }

export const SCAN_FLOW_SEGMENTS: readonly ScreenVideoSegment[] = [
  SCAN_FLOW_SCAN,
  SCAN_FLOW_LOG,
]
