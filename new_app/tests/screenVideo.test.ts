import assert from 'node:assert/strict'
import { test } from 'node:test'
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
    play() {
      this.playCount += 1
      this.paused = false
      this.ended = false
      return Promise.resolve()
    },
    pause() {
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
