// The phone's dimensions, without the phone.
//
// `utils/phoneModel.ts` owns these numbers next to the mesh that uses them,
// and it imports three.js to build that mesh. The /demo page's own scroll and
// layout code (handoff, member slot, floor timeline) only needs the numbers,
// and importing them from there put the whole of three.js on the page's static
// import graph: fetched and evaluated during hydration, ahead of the scene that
// actually needs it. This module carries the same values with no imports so
// three stays in the lazy stage chunks.
//
// `tests/gymPhoneDims.test.ts` pins every value here to `phoneModel.ts`, so the
// DOM phone and the 3D phone cannot drift apart.
export const PHONE_W = 0.95
export const PHONE_H = 1.95
export const PHONE_D = 0.08
export const PHONE_R = 0.14
export const PHONE_BEZEL = 0.025
export const PHONE_SCR_W = PHONE_W - PHONE_BEZEL * 2
export const PHONE_SCR_H = PHONE_H - PHONE_BEZEL * 2
export const PHONE_SCR_R = PHONE_R - PHONE_BEZEL
export const PHONE_SCREEN_Z = PHONE_D / 2 + 0.013
export const PHONE_ISLAND = {
  width: 0.26,
  height: 0.065,
  y: PHONE_SCR_H / 2 - 0.06,
  z: PHONE_D / 2 + 0.0145,
} as const
export const PHONE_REST_ROT_X = 0.08
export const PHONE_REST_ROT_Y = -0.12
export const PHONE_CAM_FOV = 30
export const PHONE_CAM_Z = 3.92
