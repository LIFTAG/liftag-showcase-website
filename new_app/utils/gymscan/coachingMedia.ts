// Keep the demo on the website's origin, including HLS's relative playlists
// and segments. This is deliberately limited to this one public instruction.
const origin = 'https://liftag-media-997916278530-eu-central-1-an.s3.eu-central-1.amazonaws.com';
const prefix = '/catalog/exercise-templates/ez-bar-skullcrusher/videos/';
const route = '/api/gym-coaching-media/';

export function coachingMediaUpstream(path: string): string | null {
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:m3u8|ts|m4s|mp4|aac)$/.test(path)) return null;
  return `${origin}${prefix}${path}`;
}

export function coachingMediaSource(source: string): string {
  try {
    const url = new URL(source);
    if (url.origin !== origin || !url.pathname.startsWith(prefix) || url.search) return source;
    const path = url.pathname.slice(prefix.length);
    return coachingMediaUpstream(path) ? `${route}${path}` : source;
  } catch { return source; }
}
