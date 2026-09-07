/** Partner gyms already on LIFTAG, plotted on the discovery globe. */
export type DiscoveryGym = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  hub?: boolean;
};

export const discoveryGyms: DiscoveryGym[] = [
  {
    id: "bratislava",
    city: "Bratislava",
    country: "Slovakia",
    latitude: 48.1457,
    longitude: 17.1367,
    hub: true,
  },
  {
    id: "praha-karlin",
    city: "Praha Karlín",
    country: "Czechia",
    latitude: 50.0922,
    longitude: 14.4511,
  },
  {
    id: "praha-vinohrady",
    city: "Praha Vinohrady",
    country: "Czechia",
    latitude: 50.0755,
    longitude: 14.4378,
  },
  {
    id: "praha-smichov",
    city: "Praha Smíchov",
    country: "Czechia",
    latitude: 50.0726,
    longitude: 14.4039,
  },
  {
    id: "brno",
    city: "Brno",
    country: "Czechia",
    latitude: 49.1951,
    longitude: 16.6068,
  },
  {
    id: "wien",
    city: "Wien",
    country: "Austria",
    latitude: 48.2165,
    longitude: 16.395,
  },
  {
    id: "ostrava",
    city: "Ostrava",
    country: "Czechia",
    latitude: 49.8209,
    longitude: 18.2625,
  },
  {
    id: "kosice",
    city: "Košice",
    country: "Slovakia",
    latitude: 48.7164,
    longitude: 21.2611,
  },
];

export const discoveryHub = discoveryGyms.find((gym) => gym.hub)!;

export const discoveryLocation = {
  city: discoveryHub.city,
  country: discoveryHub.country,
  latitude: discoveryHub.latitude,
  longitude: discoveryHub.longitude,
};

/** Hub-and-spoke links from Bratislava to every other registered gym. */
export function discoveryGymArcs() {
  return discoveryGyms
    .filter((gym) => gym !== discoveryHub)
    .map((gym) => ({ from: discoveryHub, to: gym }));
}
