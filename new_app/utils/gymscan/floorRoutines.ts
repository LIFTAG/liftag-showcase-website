/**
 * Pictures for the two screens the app shows after the gym overview. The AI
 * workout lists exercises from this floor's machines. The coach's exercise
 * library mixes those with exercises that need equipment this gym lacks, so
 * filtering to the client's gym visibly removes them. Each list's copy names
 * its exercises in the same order.
 */
const machine = (id: string) => `/assets/gym3d/discovery/${id}.webp`;
const photo = (name: string) => `/assets/img/${name}.webp`;

/** The AI workout, in slot order. Photos where they exist, else the machine. */
export const floorPlanImages = [
  machine("plate-loaded-chest-press"),
  photo("bench-press"),
  photo("lat-pulldown"),
] as const;

/** The coach's exercise library, and whether this gym has what each needs. */
export const floorCoachCatalog = [
  { image: photo("bench-press"), onFloor: true },
  { image: photo("squat"), onFloor: false },
  { image: photo("lat-pulldown"), onFloor: true },
  { image: photo("deadlift"), onFloor: false },
  { image: machine("plate-loaded-chest-press"), onFloor: true },
  { image: photo("triceps"), onFloor: false },
  { image: machine("indoor-bike"), onFloor: true },
] as const;

/** Another client's gym, and its floor, on the coach's client list. */
export const floorOtherGymMachines = [
  "/assets/gym3d/equipment/cable-station.webp",
  "/assets/gym3d/equipment/flat-bench.webp",
  "/assets/gym3d/equipment/treadmill.webp",
] as const;

/** Every picture the two screens paint, loaded once. */
export const floorRoutineSources = [
  ...new Set<string>([
    ...floorPlanImages,
    ...floorCoachCatalog.map((item) => item.image),
    ...floorOtherGymMachines,
  ]),
];
