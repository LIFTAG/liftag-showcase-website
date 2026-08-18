/**
 * One encode of the screen footage. A list of these is offered to the browser
 * in preference order (modern codec first, H.264 baseline last) and it plays
 * the first entry it can decode.
 */
export type ScreenVideoSource = {
  src: string
  /**
   * Full MIME type including the `codecs=` parameter. Without it a browser
   * cannot rule a source out up front, so it would commit to a file it can
   * only discover is undecodable after downloading part of it.
   */
  type: string
}

/**
 * A slice of a screen recording that belongs to one step of a section's story.
 * Playback runs from `start`, then freezes on the frame at `end` and holds
 * there until a different segment arrives. Bumping `key` re-arms the same
 * slice, which is how a step that is already selected replays from the top.
 */
export type ScreenVideoSegment = {
  start: number
  end: number
  key?: number
}

function segmentToken(segment: ScreenVideoSegment) {
  return `${segment.start}:${segment.end}:${segment.key ?? 0}`
}

/** Half a tenth of a second: a few 60fps frames either side of a cut. */
export const SEGMENT_CUT_EPSILON = 0.05

/**
 * Whether arming `start` needs a seek. A same-timestamp seek after a pause on
 * a keyframe is what freezes mobile decoders on the TAP/SCAN → LOG handoff.
 */
export function shouldSeekToSegmentStart(
  currentTime: number,
  start: number,
  ended: boolean,
  epsilon = SEGMENT_CUT_EPSILON,
) {
  if (ended) return true
  return currentTime < start - epsilon || currentTime > start + epsilon
}

/**
 * Build the `<video>` for a 3D screen. Imperative rather than templated
 * because the element never enters the DOM - it only ever feeds a texture.
 */
export function createScreenVideoElement(sources: ScreenVideoSource[]) {
  const video = document.createElement('video')
  // <source> children rather than .src: the browser runs its own resource
  // selection over the typed list, so a device without AV1 decode skips
  // straight to the H.264 file instead of downloading one it cannot play.
  video.append(...sources.map((source) => {
    const el = document.createElement('source')
    el.src = source.src
    el.type = source.type
    return el
  }))
  video.muted = true
  video.defaultMuted = true
  video.loop = false
  video.playsInline = true
  video.preload = 'auto'
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  return video
}

type VideoFrameHost = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

// Numeric so Node tests can drive the controller without a DOM HTMLMediaElement.
const HAVE_METADATA = 1
const STALL_WATCH_MS = 320
const SEEK_FALLBACK_MS = 400
const MAX_STALL_RETRIES = 2

/**
 * Plays one segment of `video` at a time and parks on its last frame.
 *
 * The freeze is checked once per presented frame rather than on `timeupdate`,
 * which only fires about four times a second and would spill a fifth of a
 * second of the next step's footage onto the screen before catching it.
 *
 * Arming a new slice must not assign `currentTime` when the element is already
 * on that cut. scan-flow.mp4's TAP/SCAN → LOG boundary is a keyframe at 3.2s;
 * pausing there and seeking to 3.2 before play() stalls WebKit / mobile
 * decoders, so the LOG step stays on the just-scanned QR frame while the
 * loading bar keeps cycling.
 */
export function createSegmentPlayback(video: HTMLVideoElement) {
  const host = video as VideoFrameHost
  const useFrameCallback = typeof host.requestVideoFrameCallback === 'function'
  const canUseRaf = typeof requestAnimationFrame === 'function'

  let segment: ScreenVideoSegment | null = null
  let armed: string | null = null
  let active = false
  let frameId = 0
  let disposed = false
  let seekSeq = 0
  let stallRetries = 0
  let stallTimer: ReturnType<typeof setTimeout> | null = null
  let seekFallbackTimer: ReturnType<typeof setTimeout> | null = null
  let onSeeked: (() => void) | null = null

  function cancelFrame() {
    if (!frameId) return
    if (useFrameCallback) host.cancelVideoFrameCallback?.(frameId)
    else if (canUseRaf) cancelAnimationFrame(frameId)
    else clearTimeout(frameId)
    frameId = 0
  }

  function scheduleFrame() {
    if (frameId || disposed) return
    frameId = useFrameCallback
      ? host.requestVideoFrameCallback!(onFrame)
      : canUseRaf
        ? requestAnimationFrame(onFrame)
        : setTimeout(onFrame, 16) as unknown as number
  }

  function clearStallWatch() {
    if (stallTimer === null) return
    clearTimeout(stallTimer)
    stallTimer = null
  }

  function clearSeekWait() {
    seekSeq += 1
    if (onSeeked) {
      video.removeEventListener('seeked', onSeeked)
      onSeeked = null
    }
    if (seekFallbackTimer !== null) {
      clearTimeout(seekFallbackTimer)
      seekFallbackTimer = null
    }
  }

  function onFrame() {
    frameId = 0
    if (disposed || !segment) return

    if (video.currentTime >= segment.end) {
      clearStallWatch()
      video.pause()
      return
    }

    scheduleFrame()
  }

  // Re-arms itself on every healthy check, so a segment is watched for its
  // whole run rather than only the first STALL_WATCH_MS after play() starts.
  // A cold cache can play a step or more off its own buffer and only stall
  // once that runs dry mid-segment - a one-shot check right after play()
  // misses that and leaves the segment frozen with no further recovery.
  function armStallWatch() {
    clearStallWatch()
    if (!segment || disposed) return

    const origin = video.currentTime
    const expected = segment
    stallTimer = setTimeout(() => {
      stallTimer = null
      if (disposed || !active || segment !== expected) return
      if (video.currentTime >= expected.end) return

      if (!video.paused && video.currentTime > origin + 0.02) {
        armStallWatch()
        return
      }

      if (stallRetries >= MAX_STALL_RETRIES) return

      stallRetries += 1
      const nudge = Math.min(
        expected.end - SEGMENT_CUT_EPSILON,
        Math.max(origin, expected.start) + 1 / 60,
      )
      seekThenPlay(nudge)
    }, STALL_WATCH_MS)
  }

  function play() {
    const attempt = video.play()
    if (attempt) {
      attempt.catch(() => {
        // Muted inline playback is expected to be allowed. If a browser blocks
        // it anyway the still screenshot underneath stays on show.
      })
    }
    scheduleFrame()
    armStallWatch()
  }

  function seekThenPlay(time: number) {
    clearSeekWait()
    const seq = seekSeq
    let finished = false

    const finish = () => {
      if (finished || seq !== seekSeq || disposed) return
      finished = true
      if (onSeeked) {
        video.removeEventListener('seeked', onSeeked)
        onSeeked = null
      }
      if (seekFallbackTimer !== null) {
        clearTimeout(seekFallbackTimer)
        seekFallbackTimer = null
      }
      play()
    }

    onSeeked = finish
    video.addEventListener('seeked', finish)

    try {
      video.currentTime = time
    } catch {
      finish()
      return
    }

    // A no-op assignment never seeks, so `seeked` would never arrive.
    if (!video.seeking && Math.abs(video.currentTime - time) <= SEGMENT_CUT_EPSILON) {
      finish()
      return
    }

    seekFallbackTimer = setTimeout(finish, SEEK_FALLBACK_MS)
  }

  function sync() {
    if (disposed) return

    if (!segment || !active) {
      clearSeekWait()
      clearStallWatch()
      cancelFrame()
      video.pause()
      return
    }

    // Seeking before metadata lands is either ignored or throws depending on
    // the browser. `loadedmetadata` runs sync() again.
    if (video.readyState < HAVE_METADATA) return

    const token = segmentToken(segment)
    if (token !== armed) {
      armed = token
      stallRetries = 0
      if (shouldSeekToSegmentStart(video.currentTime, segment.start, video.ended)) {
        seekThenPlay(segment.start)
      } else {
        play()
      }
      return
    }

    // Resuming after the tab or the section came back: pick up where the
    // segment was paused, unless it had already reached its frozen tail.
    if (video.currentTime < segment.end) play()
  }

  const onLoadedMetadata = () => sync()
  const onEnded = () => {
    clearStallWatch()
    cancelFrame()
  }
  video.addEventListener('loadedmetadata', onLoadedMetadata)
  video.addEventListener('ended', onEnded)

  return {
    setSegment(next: ScreenVideoSegment | null | undefined) {
      segment = next ?? null
      sync()
    },
    setActive(next: boolean) {
      if (active === next) return
      active = next
      sync()
    },
    dispose() {
      disposed = true
      clearSeekWait()
      clearStallWatch()
      cancelFrame()
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
      video.pause()
    },
  }
}
