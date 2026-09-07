/** Illustrative locations used by the gym-discovery product demo. */
export type DiscoveryGym = {
  id: string; city: string; venue: string; country: string;
  countryCode: "SK" | "CZ" | "AT"; latitude: number; longitude: number;
  hub?: boolean; cluster?: "prague";
};

export const discoveryGyms: readonly DiscoveryGym[] = [
  { id: "bratislava", city: "Bratislava", venue: "LIFTAG Bratislava", country: "Slovakia", countryCode: "SK", latitude: 48.1457, longitude: 17.1367, hub: true },
  { id: "praha-karlin", city: "Praha Karlín", venue: "LIFTAG Karlín", country: "Czechia", countryCode: "CZ", latitude: 50.0922, longitude: 14.4511, cluster: "prague" },
  { id: "praha-vinohrady", city: "Praha Vinohrady", venue: "LIFTAG Vinohrady", country: "Czechia", countryCode: "CZ", latitude: 50.0755, longitude: 14.4378, cluster: "prague" },
  { id: "praha-smichov", city: "Praha Smíchov", venue: "LIFTAG Smíchov", country: "Czechia", countryCode: "CZ", latitude: 50.0726, longitude: 14.4039, cluster: "prague" },
  { id: "brno", city: "Brno", venue: "LIFTAG Brno", country: "Czechia", countryCode: "CZ", latitude: 49.1951, longitude: 16.6068 },
  { id: "wien", city: "Wien", venue: "LIFTAG Wien", country: "Austria", countryCode: "AT", latitude: 48.2165, longitude: 16.395 },
  { id: "ostrava", city: "Ostrava", venue: "LIFTAG Ostrava", country: "Czechia", countryCode: "CZ", latitude: 49.8209, longitude: 18.2625 },
  { id: "kosice", city: "Košice", venue: "LIFTAG Košice", country: "Slovakia", countryCode: "SK", latitude: 48.7164, longitude: 21.2611 },
] as const;

export const discoveryHub = discoveryGyms.find((gym) => gym.hub)!;
export const discoveryLocation = discoveryHub;

/** Visual connections in the illustrative demo, not a claim of live partners. */
export function discoveryGymArcs() {
  return discoveryGyms.filter((gym) => gym !== discoveryHub).map((gym) => ({ from: discoveryHub, to: gym }));
}

export function findDiscoveryGym(id: string) {
  return discoveryGyms.find((gym) => gym.id === id) ?? discoveryHub;
}
