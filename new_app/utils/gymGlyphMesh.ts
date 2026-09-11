// Glyph placement for the gym title hologram. Canvas fillText has to sit on
// the CSS alphabetic baseline of each laid-out line. Range.getBoundingClientRect
// on the first character after a wrap or a pre-line newline often reports the
// previous line — WebKit especially — so the hologram capital paints high and
// the real letter later fades in underneath it.

export type GlyphBox = {
  left: number
  top: number
  width: number
  height: number
}

export type PlacedGlyph = {
  char: string
  x: number
  y: number
  font: string
  fontSize: number
}

const TALL_LINE = 1.35

export function lineHeightPx(lineHeight: string, fontSize: number): number {
  if (!lineHeight || lineHeight === 'normal') return fontSize * 1.2
  const n = parseFloat(lineHeight)
  return Number.isFinite(n) && n > 0 ? n : fontSize * 1.2
}

export function pickGlyphBox(
  rects: ArrayLike<GlyphBox>,
  lineHeight: number,
): GlyphBox | null {
  let picked: GlyphBox | null = null
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]!
    if (r.width <= 0 || r.height <= 0) continue
    if (
      !picked ||
      r.top > picked.top ||
      (r.top === picked.top && r.width > picked.width)
    ) {
      picked = r
    }
  }
  if (!picked) return null
  return snapTallGlyphBox(picked, lineHeight)
}

export function snapTallGlyphBox(rect: GlyphBox, lineHeight: number): GlyphBox {
  if (!(lineHeight > 0) || rect.height <= lineHeight * TALL_LINE) return rect
  return {
    left: rect.left,
    top: rect.top + rect.height - lineHeight,
    width: rect.width,
    height: lineHeight,
  }
}

export function glyphBaseline(
  rect: GlyphBox,
  ascent: number,
  descent: number,
): number {
  return rect.top + (rect.height - ascent - descent) / 2 + ascent
}

export function isSoftWrap(
  prev: GlyphBox | null,
  rect: GlyphBox,
  lineHeight: number,
): boolean {
  if (!prev) return false
  const leftReset = rect.left < prev.left - Math.max(8, lineHeight * 0.2)
  const jumped = rect.top - prev.top > lineHeight * 0.5
  return leftReset && !jumped
}

export function advanceGlyphLine(
  line: number,
  afterBreak: boolean,
  prev: GlyphBox | null,
  box: GlyphBox,
  lineHeight: number,
): number {
  if (
    afterBreak ||
    (prev != null &&
      (box.top - prev.top > lineHeight * 0.5 || isSoftWrap(prev, box, lineHeight)))
  ) {
    return line + 1
  }
  return line
}

function textPath(node: Text, root: HTMLElement): number[] {
  const path: number[] = []
  let current: Node | null = node
  while (current && current !== root) {
    const parent: Node | null = current.parentNode
    if (!parent) break
    path.push(Array.prototype.indexOf.call(parent.childNodes, current))
    current = parent
  }
  return path.reverse()
}

function nodeAtPath(root: HTMLElement, path: number[]): Text | null {
  let current: Node = root
  for (const index of path) {
    const next = current.childNodes[index]
    if (!next) return null
    current = next
  }
  return current.nodeType === Node.TEXT_NODE ? (current as Text) : null
}

type GlyphSpec = {
  cloneNode: Text
  start: number
  char: string
  font: string
  fontSize: number
  line: number
  x: number
  box: GlyphBox
  probe?: HTMLElement
}

function collectSpecs(
  content: HTMLElement,
  clone: HTMLElement,
  origin: { left: number; top: number },
): GlyphSpec[] {
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  const specs: GlyphSpec[] = []
  let prevBox: GlyphBox | null = null
  let line = 0
  let afterBreak = false
  let node: Node | null
  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    if (!parent || parent.closest('[aria-hidden="true"]')) continue
    const cloneNode = nodeAtPath(clone, textPath(node as Text, content))
    if (!cloneNode) continue
    const style = getComputedStyle(parent)
    const fontSize = parseFloat(style.fontSize)
    const lineHeight = lineHeightPx(style.lineHeight, fontSize)
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const uppercase = style.textTransform === 'uppercase'
    const text = node.textContent || ''
    let offset = 0
    for (const char of text) {
      const start = offset
      offset += char.length
      if (char === '\n' || char === '\r') {
        afterBreak = true
        continue
      }
      if (!char.trim()) continue
      range.setStart(node, start)
      range.setEnd(node, offset)
      const box = pickGlyphBox(range.getClientRects(), lineHeight)
      if (!box) continue
      line = advanceGlyphLine(line, afterBreak, prevBox, box, lineHeight)
      afterBreak = false
      specs.push({
        cloneNode,
        start,
        char: uppercase ? char.toUpperCase() : char,
        font,
        fontSize,
        line,
        x: box.left - origin.left,
        box,
      })
      prevBox = box
    }
  }
  return specs
}

function insertLineProbes(specs: GlyphSpec[]) {
  const starts = specs.filter(
    (spec, i) => i === 0 || spec.line !== specs[i - 1]!.line,
  )
  for (let i = starts.length - 1; i >= 0; i--) {
    const spec = starts[i]!
    const probe = document.createElement('span')
    probe.setAttribute('aria-hidden', 'true')
    probe.style.cssText =
      'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline;font-size:0;line-height:0;pointer-events:none'
    const range = document.createRange()
    range.setStart(spec.cloneNode, spec.start)
    range.collapse(true)
    range.insertNode(probe)
    spec.probe = probe
  }
}

/**
 * Place each live glyph at its CSS left and its line's alphabetic baseline.
 * Line Y is read from a zero-size baseline probe in a same-width clone, so a
 * wrap-boundary Range that still reports the previous line cannot lift the
 * hologram off the letter that fades in after it.
 */
export function placeContentGlyphs(
  content: HTMLElement,
  origin: { left: number; top: number },
): PlacedGlyph[] {
  const width = content.offsetWidth
  if (!width) return []
  const host = content.parentElement
  if (!host) return []
  const clone = content.cloneNode(true) as HTMLElement
  clone.setAttribute('aria-hidden', 'true')
  clone.style.cssText = `position:absolute;left:0;top:0;width:${width}px;margin:0;pointer-events:none;visibility:hidden`
  host.appendChild(clone)
  try {
    const specs = collectSpecs(content, clone, origin)
    if (!specs.length) return []
    insertLineProbes(specs)
    const cloneBox = clone.getBoundingClientRect()
    const baselines: number[] = []
    for (const spec of specs) {
      if (!spec.probe || baselines[spec.line] != null) continue
      baselines[spec.line] = spec.probe.getBoundingClientRect().bottom - cloneBox.top
    }
    return specs.map((spec) => ({
      char: spec.char,
      x: spec.x,
      y:
        baselines[spec.line] ??
        glyphBaseline(
          {
            left: spec.box.left,
            top: spec.box.top - origin.top,
            width: spec.box.width,
            height: spec.box.height,
          },
          spec.box.height * 0.8,
          spec.box.height * 0.2,
        ),
      font: spec.font,
      fontSize: spec.fontSize,
    }))
  } finally {
    clone.remove()
  }
}
