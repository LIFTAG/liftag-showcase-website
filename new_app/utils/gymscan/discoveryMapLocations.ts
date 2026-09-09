import { discoveryGyms } from "./discoveryGyms.ts";

const cityIds: Record<string, string> = {
  Bratislava: "bratislava",
  "Trenčín": "trencin",
  "Banská Bystrica": "banska-bystrica",
  "Spišská Nová Ves": "spisska-nova-ves",
  "Košice": "kosice",
  "Prešov": "presov",
};

/** Same-city gyms share one label at this regional scale. */
export const discoveryMapLocations = [...new Set(discoveryGyms.map((gym) => gym.city))].map(
  (city) => {
    const gyms = discoveryGyms.filter((gym) => gym.city === city);
    const representative = gyms.find((gym) => gym.hub) ?? gyms[0]!;
    return {
      ...representative,
      id: cityIds[city] ?? representative.id,
      count: gyms.length,
    };
  },
);

export const discoveryHubLocationIndex = discoveryMapLocations.findIndex(
  (place) => place.id === "bratislava",
);

export const discoveryCountryLabels = [
  { city: "SLOVAKIA", latitude: 48.32, longitude: 19.45, primary: true },
  { city: "CZECHIA", latitude: 49.95, longitude: 16.4, primary: false },
  { city: "AUSTRIA", latitude: 47.6, longitude: 15.5, primary: false },
  { city: "HUNGARY", latitude: 47.6, longitude: 19.8, primary: false },
  { city: "POLAND", latitude: 50.5, longitude: 20.3, primary: false },
];
