import type { Board, CellAddr, Parti, SiteM } from './types'

export function cellKey(addr: CellAddr): string {
  return `${addr.col}:${addr.band}`
}

export function sameCell(a: CellAddr, b: CellAddr): boolean {
  return a.col === b.col && a.band === b.band
}

// Derive the 1m-resolution board from the site, in metres. Column width and
// band depths are always computed here — never hardcoded, never in pixels.
export function deriveBoard(siteM: SiteM, parti: Parti): Board {
  const usableFrontageM = siteM.frontageM - 2 * siteM.setbacks.side
  const usableDepthM = siteM.depthM - siteM.setbacks.front - siteM.setbacks.rear
  const colWidthM = usableFrontageM / parti.colCount
  const ratioSum = parti.bandRatios.reduce((sum, r) => sum + r, 0)
  const bandDepthsM = parti.bandRatios.map((r) => (r / ratioSum) * usableDepthM)

  return {
    widthM: usableFrontageM,
    depthM: usableDepthM,
    originM: { x: siteM.setbacks.side, y: siteM.setbacks.front },
    colCount: parti.colCount,
    colWidthM,
    bandCount: parti.bandCount,
    bandDepthsM,
  }
}

// Cumulative offset (in metres, from the board origin) to the front edge of a band.
export function bandOffsetM(board: Board, band: number): number {
  let offset = 0
  for (let b = 0; b < band; b++) {
    offset += board.bandDepthsM[b]
  }
  return offset
}

export function isWithinGrid(addr: CellAddr, board: Board): boolean {
  return (
    addr.col >= 0 &&
    addr.col < board.colCount &&
    addr.band >= 0 &&
    addr.band < board.bandCount
  )
}

export interface RectM {
  x: number
  y: number
  w: number
  h: number
}

// The metre-space rectangle for a single cell. This is the ONLY place
// (col, band) is turned into a position — the assembler calls this once per
// placement and stores the result; nothing downstream (renderers,
// validate()) ever re-derives geometry from an address.
export function cellRectM(board: Board, addr: CellAddr): RectM {
  const x = board.originM.x + addr.col * board.colWidthM
  let y = board.originM.y
  for (let b = 0; b < addr.band; b++) y += board.bandDepthsM[b]
  return { x, y, w: board.colWidthM, h: board.bandDepthsM[addr.band] }
}
