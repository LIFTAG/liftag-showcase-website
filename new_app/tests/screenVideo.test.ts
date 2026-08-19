import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import {
  SEGMENT_CUT_EPSILON,
  createSegmentPlayback,
  shouldSeekToSegmentStart,
} from '../utils/screenVideo.ts'

test('a pause parked on the cut does not seek back onto the same timestamp', () => {
  // TAP/SCAN ends at the 3.2s keyframe. LOG starts there. Seeking to 3.2
  // while already paused on 3.2 is what freezes mobile decoders.
  assert.equal(shouldSeekToSegmentStart(3.2, 3.2, false), false)
  assert.equal(shouldSeekToSegmentStart(3.2 + 1 / 60, 3.2, false), false)
  assert.equal(shouldSeekToSegmentStart(3.2 + SEGMENT_CUT_EPSILON, 3.2, false), false)
})

test('a slice that is not already on its start still seeks', () => {
  assert.equal(shouldSeekToSegmentStart(0, 3.2, false), true)
  assert.equal(shouldSeekToSegmentStart(3.0, 3.2, false), true)
  assert.equal(shouldSeekToSegmentStart(1.5, 0, false), true)
  assert.equal(shouldSeekToSegmentStart(6.4, 0, false), true)
})

test('an ended element always seeks so the next slice can leave the tail', () => {
  assert.equal(shouldSeekToSegmentStart(3.2, 3.2, true), true)
  assert.equal(shouldSeekToSegmentStart(6.4, 0, true), true)
  assert.equal(shouldSeekToSegmentStart(0, 0, true), true)
})

type Listener = () => void

function createMockVideo(init?: {
  currentTime?: number
  paused?: boolean
  ended?: boolean
  readyState?: number
}) {
  const listeners = new Map<string, Listener[]>()
  let time = init?.currentTime ?? 0
  let seekCount = 0

  const video = {
    paused: init?.paused ?? true,
    ended: init?.ended ?? false,
    readyState: init?.readyState ?? 4,
    seeking: false,
    playCount: 0,
    get seekCount() {
      return seekCount
    },
    get currentTime() {
      return time
    },
    set currentTime(next: number) {
      seekCount += 1
      time = next
      this.seeking = true
      this.ended = false
    },
    // Decoding advances currentTime on its own, unlike an app-driven seek -
    // this must not register as one of the `set currentTime` calls above.
    advance(next: number) {
      time = next
    },
    pauseCount: 0,
    play() {
      this.playCount += 1
      this.paused = false
      this.ended = false
      return Promise.resolve()
    },
    pause() {
      this.pauseCount += 1
      this.paused = true
    },
    addEventListener(type: string, fn: Listener) {
      const list = listeners.get(type) ?? []
      list.push(fn)
      listeners.set(type, list)
    },
    removeEventListener(type: string, fn: Listener) {
      const list = listeners.get(type) ?? []
      listeners.set(type, list.filter((listener) => listener !== fn))
    },
    dispatch(type: string) {
      for (const listener of [...(listeners.get(type) ?? [])]) listener()
    },
    requestVideoFrameCallback() {
      return 1
    },
    cancelVideoFrameCallback() {},
  }

  return video
}

test('LOG does not assign currentTime when TAP/SCAN already parked on 3.2s', () => {
  const video = createMockVideo({ currentTime: 3.2, paused: true })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  try {
    assert.equal(video.seekCount, 0)
    assert.equal(video.currentTime, 3.2)
    assert.equal(video.paused, false)
    assert.ok(video.playCount >= 1)
  } finally {
    playback.dispose()
  }
})

test('looping back to TAP/SCAN from the ended tail seeks to 0', () => {
  const video = createMockVideo({ currentTime: 6.4, paused: true, ended: true })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 0, end: 3.2 })

  try {
    assert.equal(video.seekCount, 1)
    assert.equal(video.currentTime, 0)

    video.dispatch('seeked')

    assert.equal(video.paused, false)
    assert.ok(video.playCount >= 1)
  } finally {
    playback.dispose()
  }
})

test('a stall that develops after the first watch window is re-kicked, then seeked', (t) => {
  // A cold cache can coast on the buffer built up during the previous
  // segment for a bit before it actually runs dry. A watchdog that only
  // checks once, right after play() starts, sees that early progress and
  // never looks again - so a stall arriving after that first window used to
  // freeze the segment for good, with no further recovery attempt.
  mock.timers.enable({ apis: ['setTimeout'] })
  t.after(() => mock.timers.reset())

  const video = createMockVideo({ currentTime: 3.2, paused: true })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  try {
    assert.equal(video.seekCount, 0)
    const playsAfterArming = video.playCount
    const pausesAfterArming = video.pauseCount

    // First watch window: still playing off the old segment's buffer.
    video.advance(3.5)
    mock.timers.tick(320)
    assert.equal(video.seekCount, 0)
    assert.equal(video.playCount, playsAfterArming)

    // Second window: fully buffered but the clock has stopped, so the pipeline
    // is wedged rather than starved. The first recovery re-kicks playback
    // without touching currentTime - this clip only has keyframes at 0s and
    // 3.2s, so a seek would cost a decode from the top of the slice.
    mock.timers.tick(320)
    assert.equal(video.seekCount, 0)
    assert.equal(video.pauseCount, pausesAfterArming + 1)
    assert.equal(video.playCount, playsAfterArming + 1)

    // Third window: the re-kick did not take, so it is worth paying for a seek.
    mock.timers.tick(320)
    assert.equal(video.seekCount, 1)
  } finally {
    playback.dispose()
  }
})

test('a segment starved of data is never seeked, however long it stalls', (t) => {
  // The regression this guards: a first, cold pass over the LOG slice runs the
  // buffer dry, and seeking there throws the in-flight fetch away and forces a
  // decode from the 3.2s keyframe - so the recovery cost more than the stall
  // and the step froze on an arbitrary frame until the next loop.
  mock.timers.enable({ apis: ['setTimeout'] })
  t.after(() => mock.timers.reset())

  // HAVE_CURRENT_DATA: metadata and the frame on screen, nothing decoded past it.
  const video = createMockVideo({ currentTime: 3.2, paused: true, readyState: 2 })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  const pausesAfterArming = video.pauseCount

  try {
    for (let window = 0; window < 12; window += 1) mock.timers.tick(320)

    assert.equal(video.seekCount, 0)
    assert.equal(video.pauseCount, pausesAfterArming)

    // Still watched: once the bytes land and the clock is moving again, the
    // watch keeps following the segment instead of having given up.
    video.readyState = 4
    video.advance(4.0)
    mock.timers.tick(320)
    assert.equal(video.seekCount, 0)

    // And a genuine wedge after that is still caught.
    mock.timers.tick(320)
    assert.equal(video.pauseCount, pausesAfterArming + 1)
  } finally {
    playback.dispose()
  }
})

test('the retry budget resets on progress instead of giving up for the segment', (t) => {
  mock.timers.enable({ apis: ['setTimeout'] })
  t.after(() => mock.timers.reset())

  const video = createMockVideo({ currentTime: 3.2, paused: true })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  const pausesAfterArming = video.pauseCount

  try {
    // Burn the whole budget: re-kick, then seek.
    mock.timers.tick(320)
    mock.timers.tick(320)
    assert.equal(video.pauseCount, pausesAfterArming + 1)
    assert.equal(video.seekCount, 1)
    video.dispatch('seeked')

    // Budget spent, but the watch stays armed rather than leaving the rest of
    // the segment unwatched.
    const seeksBefore = video.seekCount
    mock.timers.tick(320)
    assert.equal(video.seekCount, seeksBefore)

    // Playback recovers, so a later wedge gets the full ladder again.
    video.advance(4.2)
    mock.timers.tick(320)
    const pausesBefore = video.pauseCount
    mock.timers.tick(320)
    assert.equal(video.pauseCount, pausesBefore + 1)
  } finally {
    playback.dispose()
  }
})

test('starvation is reported once it persists, and cleared when playback resumes', (t) => {
  mock.timers.enable({ apis: ['setTimeout'] })
  t.after(() => mock.timers.reset())

  const reports: boolean[] = []
  const video = createMockVideo({ currentTime: 3.2, paused: true, readyState: 2 })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement, {
    onStarvedChange: (starved) => reports.push(starved),
  })

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  try {
    // Arming a slice is not a stall on its own.
    assert.deepEqual(reports, [])

    mock.timers.tick(320)
    assert.deepEqual(reports, [true])

    // Repeated windows do not re-report the same state.
    mock.timers.tick(320)
    assert.deepEqual(reports, [true])

    video.dispatch('playing')
    assert.deepEqual(reports, [true, false])
  } finally {
    playback.dispose()
  }
})

test('a park on the segment tail is not reported as starvation', (t) => {
  mock.timers.enable({ apis: ['setTimeout'] })
  t.after(() => mock.timers.reset())

  const reports: boolean[] = []
  const video = createMockVideo({ currentTime: 3.2, paused: true })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement, {
    onStarvedChange: (starved) => reports.push(starved),
  })

  playback.setActive(true)
  playback.setSegment({ start: 3.2, end: 6.4 })

  try {
    video.advance(6.4)
    mock.timers.tick(320)
    assert.deepEqual(reports, [])
    assert.equal(video.seekCount, 0)
  } finally {
    playback.dispose()
  }
})

test('re-arming a slice from mid-play seeks back to its start', () => {
  const video = createMockVideo({ currentTime: 1.6, paused: false })
  const playback = createSegmentPlayback(video as unknown as HTMLVideoElement)

  playback.setActive(true)
  playback.setSegment({ start: 0, end: 3.2, key: 1 })

  try {
    assert.equal(video.seekCount, 1)
    assert.equal(video.currentTime, 0)
  } finally {
    playback.dispose()
  }
})
