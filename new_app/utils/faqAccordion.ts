export function nextOpenFaq(current: number, index: number) {
  return current === index ? -1 : index
}

export function faqIndexLabel(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function faqPanelStyle(measured: boolean, open: boolean, height: number) {
  if (!measured) return undefined
  return {
    gridTemplateRows: open && height > 0 ? `${height}px` : '0px',
  }
}
