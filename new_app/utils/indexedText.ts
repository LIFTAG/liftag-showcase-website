// Label splitter for the character index effect (see IndexedText.vue and the
// .ti-* block in assets/css/main.css).
//
// Words, then characters. The desktop nav gets away with a flat character run
// because every one of its labels is a single word; the surfaces that reuse the
// effect do not - "Best Free Workout Tracker" has to be allowed to wrap, and a
// flat run of inline-block character windows would break it at any letter.
// Wrapping therefore happens at the spaces between word groups, and each group
// keeps its characters together.
//
// Array.from, not split(''), so an accented or non-BMP glyph indexes as one
// character rather than tearing a surrogate pair in half.

export interface IndexedTextChar {
  char: string
  /** Position in the whole label, so the stagger runs left to right across words. */
  i: number
}

export interface IndexedTextToken {
  kind: 'word' | 'space'
  text: string
  chars: IndexedTextChar[]
}

export function splitIndexedText(text: string): IndexedTextToken[] {
  const tokens: IndexedTextToken[] = []
  let index = 0

  for (const part of text.split(/(\s+)/)) {
    if (!part) continue

    if (/^\s+$/.test(part)) {
      tokens.push({ kind: 'space', text: part, chars: [] })
      continue
    }

    tokens.push({
      kind: 'word',
      text: part,
      chars: Array.from(part).map((char) => ({ char, i: index++ })),
    })
  }

  return tokens
}
