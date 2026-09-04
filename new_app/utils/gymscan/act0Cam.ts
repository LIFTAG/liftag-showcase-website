// Act 0 camera. Scroll does not own this — after the 0D hold the live Hermite
// dolly takes over from the establishing station.
//
// The lens does not move at all. 0A is the hologram sweep from this station,
// 0B assembles into it, 0C is the sticker flying into this POV, and 0D presses
// it onto the beam while the lens stays where it is.
//
// 0D used to be an exception: the card leaves for a mount seven metres away,
// and at that distance a 15 cm sticker being laid down corner-first is four
// pixels of event, so the lens went with it for the press and came back. That
// move is gone by owner call. The argument against it is the same one the rest
// of this module already makes for 0C — a punch-in on the thing that is
// already the subject is a move on nothing, and it made the beat read as a
// loot close-up. The press is now small, and the eye is left on the whole
// machine getting tagged rather than on the tag.
//
// What survives from that episode is the constraint that made it hard: the
// scroll dolly's first keyframe is ESTABLISH, and Act 0 handing over from
// anywhere else is a cut on the first pixel of scroll. Holding one station is
// the strongest possible form of that guarantee, and `tests/act0Cam.test.ts`
// still checks it across the whole act.

import type { Act0State } from './act0.ts'
import { ESTABLISH, type Act0Cam } from './station.ts'

export { ESTABLISH, type Act0Cam }

/**
 * Camera for the current Act 0 sample. Pure, and constant: the act plays out
 * in one locked-off shot. After `done` the stage ignores this and follows the
 * scroll Hermite path, which starts from this same station.
 */
export function act0CamAt(_a0: Act0State): Act0Cam {
  return ESTABLISH
}
