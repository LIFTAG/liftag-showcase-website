/** Presentation models map to real catalog entries, never invented video URLs. */
export const gymEquipment = [
  {
    id: "leg-press",
    name: "Pivot leg press",
    area: "Strength",
    model: "/assets/gym3d/hero-machine.glb",
    poster: "/assets/gym3d/leg-press-poster.webp",
    span: 2.35,
    x: -1.55,
    z: 1.15,
    rotation: 0.2,
  },
  {
    id: "flat-bench",
    name: "Flat bench",
    area: "Free weights",
    model: "/assets/gym3d/equipment/flat-bench.glb",
    poster: "/assets/gym3d/equipment/flat-bench.webp",
    span: 1.95,
    x: 1.4,
    z: 1.2,
    rotation: -0.3,
  },
  {
    id: "cable-station",
    name: "Cable station",
    area: "Strength",
    model: "/assets/gym3d/equipment/cable-station.glb",
    poster: "/assets/gym3d/equipment/cable-station.webp",
    span: 2.6,
    x: -1.55,
    z: -1.45,
    rotation: 0.1,
  },
  {
    id: "treadmill",
    name: "Treadmill",
    area: "Cardio",
    model: "/assets/gym3d/equipment/treadmill.glb",
    poster: "/assets/gym3d/equipment/treadmill.webp",
    span: 2.4,
    x: 1.4,
    z: -1.4,
    rotation: -0.3,
  },
] as const;
export type GymEquipment = (typeof gymEquipment)[number]["id"];
export const benchInstruction = {
  slug: "ez-bar-skullcrusher",
  name: "EZ-Bar Skullcrusher",
} as const;
