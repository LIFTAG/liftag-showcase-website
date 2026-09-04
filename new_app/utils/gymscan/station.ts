// The establishing station.
//
// Its own module for one reason: `stick.ts` needs it to place a card in front
// of the lens, and `act0Cam.ts` needs `stick.ts`'s window lengths to know when
// the 0D move may start and must be home. Left in act0Cam that is an import
// cycle, and a cycle here is not academic - both modules compute constants at
// load from the other's exports, so whichever half evaluates first reads
// undefined and the card lands somewhere in the room.
export type Act0Cam = {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
}

/** Live Act 1 start. Act 0 hands the dolly over from exactly here. */
export const ESTABLISH: Act0Cam = {
  x: 3.98, y: 2.22, z: 4.96,
  tx: 0.05, ty: 0.88, tz: -0.04,
}
