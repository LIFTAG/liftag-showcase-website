/** Illustrative locations for the gym-discovery product demo. */
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
    id: "bratislava-eurovea",
    city: "Bratislava",
    country: "Slovakia",
    latitude: 48.140371,
    longitude: 17.123888,
    hub: true,
  },
  {
    id: "bratislava-lamac",
    city: "Bratislava",
    country: "Slovakia",
    latitude: 48.176884,
    longitude: 17.065937,
  },
  {
    id: "trencin",
    city: "Trenčín",
    country: "Slovakia",
    latitude: 48.874729,
    longitude: 18.045468,
  },
  {
    id: "banska-bystrica",
    city: "Banská Bystrica",
    country: "Slovakia",
    latitude: 48.713435,
    longitude: 19.136993,
  },
  {
    id: "spisska-nova-ves",
    city: "Spišská Nová Ves",
    country: "Slovakia",
    latitude: 48.947847,
    longitude: 20.549648,
  },
  {
    id: "kosice-roca",
    city: "Košice",
    country: "Slovakia",
    latitude: 48.697428,
    longitude: 21.262861,
  },
  {
    id: "kosice-hypertesco",
    city: "Košice",
    country: "Slovakia",
    latitude: 48.741347,
    longitude: 21.266033,
  },
  {
    id: "presov",
    city: "Prešov",
    country: "Slovakia",
    latitude: 48.988772,
    longitude: 21.262391,
  },
];

export const discoveryHub = discoveryGyms.find((gym) => gym.hub)!;

export const discoveryLocation = {
  city: discoveryHub.city,
  country: discoveryHub.country,
  latitude: discoveryHub.latitude,
  longitude: discoveryHub.longitude,
};

/** Camera aim once the globe has approached Slovakia. */
export const discoveryRegionFocus = {
  latitude: 48.72,
  longitude: 19.2,
};

/** Hub-and-spoke links from Bratislava. Same-city gyms share one route. */
export function discoveryGymArcs() {
  const seen = new Set<string>();
  return discoveryGyms.flatMap((gym) => {
    if (gym === discoveryHub || gym.city === discoveryHub.city) return [];
    if (seen.has(gym.city)) return [];
    seen.add(gym.city);
    return [{ from: discoveryHub, to: gym }];
  });
}
