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

/**
 * Plays one segment of `video` at a time and parks on its last frame.
 *
 * The freeze is checked once per presented frame rather than on `timeupdate`,
 * which only fires about four times a second and would spill a fifth of a
 * second of the next step's footage onto the screen before catching it.
 */
export function createSegmentPlayback(video: HTMLVideoElement) {
  const host = video as VideoFrameHost
  const useFrameCallback = typeof host.requestVideoFrameCallback === 'function'

  let segment: ScreenVideoSegment | null = null
  let armed: string | null = null
  let active = false
  let frameId = 0
  let disposed = false

  function cancelFrame() {
    if (!frameId) return
    if (useFrameCallback) host.cancelVideoFrameCallback?.(frameId)
    else cancelAnimationFrame(frameId)
    frameId = 0
  }

  function scheduleFrame() {
    if (frameId || disposed) return
    frameId = useFrameCallback
      ? host.requestVideoFrameCallback!(onFrame)
      : requestAnimationFrame(onFrame)
  }

  function onFrame() {
    frameId = 0
    if (disposed || !segment) return

    if (video.currentTime >= segment.end) {
      video.pause()
      return
    }

    scheduleFrame()
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
  }

  function sync() {
    if (disposed) return

    if (!segment || !active) {
      cancelFrame()
      video.pause()
      return
    }

    // Seeking before metadata lands is either ignored or throws depending on
    // the browser. `loadedmetadata` runs sync() again.
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) return

    const token = segmentToken(segment)
    if (token !== armed) {
      armed = token
      video.currentTime = segment.start
      play()
      return
    }

    // Resuming after the tab or the section came back: pick up where the
    // segment was paused, unless it had already reached its frozen tail.
    if (video.currentTime < segment.end) play()
  }

  const onLoadedMetadata = () => sync()
  const onEnded = () => cancelFrame()
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
      cancelFrame()
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
      video.pause()
    },
  }
}
