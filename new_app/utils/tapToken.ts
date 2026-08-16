/**
 * Backing-store scale for the NFC tap-token.
 *
 * Hits are analytic (sphere ∩ cylinder ∩ slab), so extra pixels are cheap
 * compared with the forged plate. Width is checked before core count: iOS
 * reports 4 cores on every iPhone, and the old <=4 branch pinned the token
 * at 1x on a 3x display. The loop stays at 60fps; the token idle-spins and
 * can be dragged, so a settled 30fps present would feel worse than it saves.
 */

export const TOKEN_PHONE_MAX_WIDTH = 768
export const TOKEN_PHONE_DPR_CAP = 2.5
export const TOKEN_PHONE_LOW_POWER_DPR_CAP = 1.5
export const TOKEN_LOW_POWER_DPR_CAP = 1
export const TOKEN_DESKTOP_DPR_CAP = 1.25

export function tokenBufferScale(
  devicePixelRatio: number,
  hardwareConcurrency: number,
  innerWidth: number,
  dprCap = TOKEN_DESKTOP_DPR_CAP,
) {
  const native = devicePixelRatio > 0 ? devicePixelRatio : 1
  const phone = innerWidth <= TOKEN_PHONE_MAX_WIDTH

  if (hardwareConcurrency <= 2) {
    return Math.min(native, phone ? TOKEN_PHONE_LOW_POWER_DPR_CAP : TOKEN_LOW_POWER_DPR_CAP)
  }

  if (phone) return Math.min(native, TOKEN_PHONE_DPR_CAP)
  if (hardwareConcurrency <= 4) return Math.min(native, TOKEN_LOW_POWER_DPR_CAP)
  return Math.min(native, dprCap)
}
