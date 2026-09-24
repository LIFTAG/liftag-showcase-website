/**
 * The demonstration floor: four supplied machine exports on a 5×4 tile field.
 * `x`/`z` are floor metres from its centre, `span` the longest side once
 * scaled, and `area` the zone the app files the machine under. Both rows sit
 * forward of centre, so the tall back row never hides the far-left tiles
 * where "Your gym" is painted.
 */
export const floorEquipment = [
  {
    id: "plate-loaded-pulldown",
    area: "strength",
    span: 2.25,
    x: -1.45,
    z: -0.95,
    rotation: 0.15,
  },
  {
    id: "plate-loaded-chest-press",
    area: "strength",
    span: 2.05,
    x: 1.45,
    z: -0.95,
    rotation: -0.1,
  },
  {
    id: "adjustable-bench",
    area: "freeWeights",
    span: 1.85,
    x: -1.45,
    z: 1.55,
    rotation: 0.15,
  },
  {
    id: "indoor-bike",
    area: "cardio",
    span: 1.65,
    x: 1.45,
    z: 1.55,
    rotation: -0.15,
  },
].map((item, index) => ({
  ...item,
  number: String(index + 1).padStart(2, "0"),
  model: `/assets/gym3d/discovery/${item.id}.glb`,
  poster: `/assets/gym3d/discovery/${item.id}.webp`,
}));

export type FloorMachine = (typeof floorEquipment)[number];
