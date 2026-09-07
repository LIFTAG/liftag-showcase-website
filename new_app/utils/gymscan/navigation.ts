/** Public URL for the gym-machine experience (the former `/gym-scan` demo). */
export const GYM_DEMO_PATH = "/demo";

export function isGymDemoPath(path: string): boolean {
  return path === GYM_DEMO_PATH || path === `${GYM_DEMO_PATH}/`;
}

/** Resolve public and historic demo anchors without interpreting arbitrary selectors. */
export function gymAnchor(hash: string): string | null {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null;
  }
  const aliases: Record<string, string> = {
    demo: "lifters",
    "all-in-one": "gyms",
    roadmap: "kit",
    faq: "kit",
  };
  const destination = aliases[id] ?? id;
  return [
    "experience",
    "the-tag",
    "lifters",
    "progress",
    "trainers",
    "gyms",
    "discover",
    "kit",
  ].includes(destination)
    ? destination
    : null;
}
