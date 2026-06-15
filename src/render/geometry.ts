import type { BayGrid, CellAddr } from '../model/types'

export interface RectM {
  x: number
  y: number
  w: number
  h: number
}

// The metre-space rectangle for a single cell. This is the only place
// (col, band) is turned into a position — everything else reads the result.
export function cellRectM(grid: BayGrid, addr: CellAddr): RectM {
  const x = grid.originM.x + addr.col * grid.bayWidthM
  let y = grid.originM.y
  for (let b = 0; b < addr.band; b++) y += grid.bandDepthsM[b]
  return { x, y, w: grid.bayWidthM, h: grid.bandDepthsM[addr.band] }
}

// The bounding rectangle of the whole built grid (all cells).
export function gridBoundsM(grid: BayGrid): RectM {
  return {
    x: grid.originM.x,
    y: grid.originM.y,
    w: grid.bayWidthM * grid.bayCount,
    h: grid.bandDepthsM.reduce((sum, d) => sum + d, 0),
  }
}

// A font size (in metres) that keeps a label within a cell's width.
export function fitFontSizeM(label: string, cellWidthM: number, base: number): number {
  const avgCharWidthFactor = 0.55 // rough average glyph width as a fraction of font size
  const maxWidthM = cellWidthM * 0.9
  const estimatedWidthM = label.length * base * avgCharWidthFactor
  if (estimatedWidthM <= maxWidthM || label.length === 0) return base
  return Math.max(0.13, maxWidthM / (label.length * avgCharWidthFactor))
}
