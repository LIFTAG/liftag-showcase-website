import { discoveryGyms } from "./discoveryGyms.ts";

/** Prague's three nearby gyms share one label at this regional scale. */
export const discoveryMapLocations = discoveryGyms
  .filter(gym => !gym.id.startsWith("praha-") || gym.id === "praha-karlin")
  .map(gym => ({
    ...gym,
    city: gym.id.startsWith("praha-") ? "Praha" : gym.city,
    count: gym.id.startsWith("praha-")
      ? discoveryGyms.filter(item => item.id.startsWith("praha-")).length
      : 1,
  }));

export const discoveryCountryLabels = [
  { city: "SLOVAKIA", latitude: 48.65, longitude: 19.6, primary: true },
  { city: "CZECHIA", latitude: 49.95, longitude: 16.4, primary: false },
  { city: "AUSTRIA", latitude: 47.6, longitude: 15.5, primary: false },
  { city: "HUNGARY", latitude: 47.6, longitude: 19.8, primary: false },
  { city: "POLAND", latitude: 50.5, longitude: 20.3, primary: false },
];
