import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coachingMediaSource, coachingMediaUpstream } from '../utils/gymscan/coachingMedia.ts';

test('coaching media preserves relative HLS playlist and segment paths', () => {
  const base = 'https://liftag-media-997916278530-eu-central-1-an.s3.eu-central-1.amazonaws.com/catalog/exercise-templates/ez-bar-skullcrusher/videos/';
  for (const path of ['20260707T143627Z/master.m3u8', '20260707T143627Z/video/playlist.m3u8', '20260707T143627Z/audio/en/segment_000.ts']) {
    assert.equal(coachingMediaUpstream(path), base + path);
    assert.equal(coachingMediaSource(base + path), '/api/gym-coaching-media/' + path);
  }
  assert.equal(coachingMediaSource('https://example.com/movie.mp4'), 'https://example.com/movie.mp4');
});

test('coaching media rejects traversal, arbitrary hosts, query strings and non-media files', () => {
  for (const path of ['', '../other/master.m3u8', '%2e%2e/private.ts', '/absolute.ts', 'https://example.com/video.ts', 'foo//bar.ts', 'foo.ts?url=secret', 'foo.ts#fragment', 'foo.json', 'foo\\bar.ts']) {
    assert.equal(coachingMediaUpstream(path), null, path);
  }
});
