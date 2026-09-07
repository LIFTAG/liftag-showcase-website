/** The illustrative Bratislava floor uses these exact supplied model exports. */
export const discoveryEquipment = [
  {
    id: "plate-loaded-pulldown",
    name: "Plate-loaded pulldown",
    area: "Strength",
    type: "Plate-loaded",
    span: 2.25,
    x: -1.45,
    z: -1.35,
    rotation: 0.15,
  },
  {
    id: "plate-loaded-chest-press",
    name: "Chest press",
    area: "Strength",
    type: "Plate-loaded",
    span: 2.05,
    x: 1.45,
    z: -1.35,
    rotation: -0.1,
  },
  {
    id: "adjustable-bench",
    name: "Adjustable bench",
    area: "Free weights",
    type: "Adjustable",
    span: 1.85,
    x: -1.45,
    z: 1.35,
    rotation: 0.15,
  },
  {
    id: "indoor-bike",
    name: "Indoor bike",
    area: "Cardio",
    type: "Bike",
    span: 1.65,
    x: 1.45,
    z: 1.35,
    rotation: -0.15,
  },
].map((item, index) => ({
  ...item,
  number: String(index + 1).padStart(2, "0"),
  model: `/assets/gym3d/discovery/${item.id}.glb`,
  poster: `/assets/gym3d/discovery/${item.id}.webp`,
}));
export { discoveryLocation } from "./discoveryGyms.ts";
