import assert from "node:assert/strict";
import { test } from "node:test";
import { createScanAppScreen } from "../utils/gymscan/scanApp.ts";

// The renderer owns its video texture outside the DOM. Exercise that lifecycle
// without a GPU or an external media request.
test("scan footage is deferred, prepared once, and falls back to the product still on failure", () => {
  class Video extends EventTarget {
    currentTime = 0;
    videoWidth = 0;
    videoHeight = 0;
    paused = true;
    ended = false;
    readyState = 0;
    seeking = false;
    loadCount = 0;
    append() {}
    setAttribute() {}
    removeAttribute() {}
    replaceChildren() {}
    load() {
      this.loadCount++;
    }
    pause() {
      this.paused = true;
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    requestVideoFrameCallback() {
      return 1;
    }
    cancelVideoFrameCallback() {}
  }
  const videos: Video[] = [];
  const images: Image[] = [];
  class Image {
    naturalWidth = 393;
    naturalHeight = 852;
    src = "";
    decoding = "";
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() {
      images.push(this);
    }
  }
  const doc = Object.assign(new EventTarget(), {
    hidden: false,
    createElement(tag: string) {
      if (tag !== "video") return {};
      const video = new Video();
      videos.push(video);
      return video;
    },
  });
  const oldDocument = globalThis.document,
    oldImage = globalThis.Image;
  Object.assign(globalThis, { document: doc, Image });
  try {
    const screen = createScanAppScreen({ reducedMotion: false, defer: true });
    assert.equal(videos.length, 0);
    screen.prepare();
    screen.prepare();
    assert.equal(videos.length, 1);
    assert.equal(videos[0]!.loadCount, 1);
    assert.equal(screen.ready, false);
    videos[0]!.dispatchEvent(new Event("error"));
    assert.match(images[0]!.src, /log-set.webp$/);
    images[0]!.onload?.();
    assert.equal(screen.ready, true);
    assert.equal(screen.texture.image, images[0]);
    screen.dispose();
    assert.equal(images[0]!.onload, null);
    screen.prepare();
    assert.equal(videos.length, 1);
  } finally {
    Object.assign(globalThis, { document: oldDocument, Image: oldImage });
  }
});
