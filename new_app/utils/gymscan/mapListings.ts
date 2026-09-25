/**
 * Illustrative listings for the "On the map" chapter, one per pinned city.
 * Gym names are invented for the demo and stay untranslated, like a brand.
 * Machine names and areas point at messages the other chapters already use;
 * the posters are those chapters' renders, trimmed and centred on one square
 * so every machine fills the preview and its chip alike.
 */
export const mapMachines = {
  "leg-press": {
    poster: "/assets/gym3d/map/machines/leg-press.webp",
    name: "ownerMachineNames.leg-press",
    area: "strength",
  },
  "flat-bench": {
    poster: "/assets/gym3d/map/machines/flat-bench.webp",
    name: "ownerMachineNames.flat-bench",
    area: "freeWeights",
  },
  "cable-station": {
    poster: "/assets/gym3d/map/machines/cable-station.webp",
    name: "ownerMachineNames.cable-station",
    area: "strength",
  },
  treadmill: {
    poster: "/assets/gym3d/map/machines/treadmill.webp",
    name: "ownerMachineNames.treadmill",
    area: "cardio",
  },
  "adjustable-bench": {
    poster: "/assets/gym3d/map/machines/adjustable-bench.webp",
    name: "floor.names.adjustable-bench",
    area: "freeWeights",
  },
  "indoor-bike": {
    poster: "/assets/gym3d/map/machines/indoor-bike.webp",
    name: "floor.names.indoor-bike",
    area: "cardio",
  },
  "plate-loaded-chest-press": {
    poster: "/assets/gym3d/map/machines/plate-loaded-chest-press.webp",
    name: "floor.names.plate-loaded-chest-press",
    area: "strength",
  },
  "plate-loaded-pulldown": {
    poster: "/assets/gym3d/map/machines/plate-loaded-pulldown.webp",
    name: "floor.names.plate-loaded-pulldown",
    area: "strength",
  },
} as const;

export type MapMachineId = keyof typeof mapMachines;
export type MapGymKind = "strength" | "powerlifting" | "allDay" | "functional" | "bodybuilding" | "community";

export type MapListing = {
  name: string;
  kind: MapGymKind;
  photo: string;
  /** `object-position` that keeps the gym equipment in the narrow photo column. */
  focus: string;
  /** Today's opening and closing time; null for a gym open around the clock. */
  hours: readonly [string, string] | null;
  tagged: number;
  trainers: number;
  routines: number;
  floor: readonly [MapMachineId, MapMachineId, MapMachineId, MapMachineId];
};

/** Keyed by `DiscoveryGym.id`; every pin in `orbitCities` has an entry. */
export const mapListings: Record<string, MapListing> = {
  "bratislava-eurovea": {
    name: "Riverside Strength Club",
    kind: "strength",
    photo: "/assets/gym3d/map/gym-floor.webp",
    focus: "58% 50%",
    hours: ["06:00", "22:00"],
    tagged: 48,
    trainers: 6,
    routines: 214,
    floor: ["leg-press", "cable-station", "plate-loaded-chest-press", "treadmill"],
  },
  trencin: {
    name: "Castle Hill Barbell",
    kind: "powerlifting",
    photo: "/assets/gym3d/map/gyms/powerlifting-floor.webp",
    focus: "52% 50%",
    hours: ["07:00", "21:00"],
    tagged: 22,
    trainers: 3,
    routines: 86,
    floor: ["flat-bench", "adjustable-bench", "leg-press", "plate-loaded-pulldown"],
  },
  "banska-bystrica": {
    name: "Night Shift Gym",
    kind: "allDay",
    photo: "/assets/gym3d/map/gyms/cardio-floor.webp",
    focus: "12% 50%",
    hours: null,
    tagged: 35,
    trainers: 2,
    routines: 142,
    floor: ["plate-loaded-pulldown", "cable-station", "indoor-bike", "treadmill"],
  },
  "spisska-nova-ves": {
    name: "Paradise Athletics",
    kind: "functional",
    photo: "/assets/gym3d/map/gyms/training-floor.webp",
    focus: "58% 65%",
    hours: ["06:30", "21:00"],
    tagged: 18,
    trainers: 4,
    routines: 63,
    floor: ["adjustable-bench", "indoor-bike", "cable-station", "flat-bench"],
  },
  "kosice-roca": {
    name: "East Side Iron",
    kind: "bodybuilding",
    photo: "/assets/gym3d/map/gyms/free-weights-floor.webp",
    focus: "65% 50%",
    hours: ["05:30", "23:00"],
    tagged: 56,
    trainers: 7,
    routines: 301,
    floor: ["plate-loaded-chest-press", "plate-loaded-pulldown", "cable-station", "adjustable-bench"],
  },
  presov: {
    name: "Plate & Chalk",
    kind: "community",
    photo: "/assets/gym3d/map/gyms/daylight-gym.webp",
    focus: "48% 50%",
    hours: ["06:00", "21:00"],
    tagged: 27,
    trainers: 3,
    routines: 97,
    floor: ["flat-bench", "leg-press", "plate-loaded-chest-press", "indoor-bike"],
  },
};
