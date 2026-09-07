import { coachingMediaUpstream } from '~/utils/gymscan/coachingMedia';

/** Same-origin playback for the public demo, never a general-purpose proxy. */
export default defineEventHandler(async (event) => {
  const upstream = coachingMediaUpstream(getRouterParam(event, 'path') ?? '');
  if (!upstream) throw createError({ statusCode: 404, statusMessage: 'Video not found' });
  const range = getHeader(event, 'range');
  const response = await fetch(upstream, {
    headers: range ? { Range: range } : {},
    redirect: 'error',
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok || !response.body) throw createError({ statusCode: response.status, statusMessage: 'Instruction unavailable' });
  setResponseStatus(event, response.status);
  for (const header of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control']) {
    const value = response.headers.get(header);
    if (value) setHeader(event, header, value);
  }
  return sendStream(event, response.body);
});
