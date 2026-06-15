import type { BayGrid, CellAddr, Parti, SiteM } from './types'

export function cellKey(addr: CellAddr): string {
  return `${addr.col}:${addr.band}`
}

export function sameCell(a: CellAddr, b: CellAddr): boolean {
  return a.col === b.col && a.band === b.band
}

// Derive the bay grid from the site, in metres. Bay width and band depths
// are always computed here — never hardcoded, never in pixels.
export function deriveBayGrid(siteM: SiteM, parti: Parti): BayGrid {
  const usableFrontageM = siteM.frontageM - 2 * siteM.setbacks.side
  const usableDepthM = siteM.depthM - siteM.setbacks.front - siteM.setbacks.rear
  const bayWidthM = usableFrontageM / parti.bayCount
  const ratioSum = parti.bandRatios.reduce((sum, r) => sum + r, 0)
  const bandDepthsM = parti.bandRatios.map((r) => (r / ratioSum) * usableDepthM)

  return {
    bayCount: parti.bayCount,
    bandCount: parti.bandCount,
    originM: { x: siteM.setbacks.side, y: siteM.setbacks.front },
    bayWidthM,
    bandDepthsM,
  }
}

// Cumulative offset (in metres, from the grid origin) to the front edge of a band.
export function bandOffsetM(grid: BayGrid, band: number): number {
  let offset = 0
  for (let b = 0; b < band; b++) {
    offset += grid.bandDepthsM[b]
  }
  return offset
}

export function isWithinGrid(addr: CellAddr, grid: BayGrid): boolean {
  return (
    addr.col >= 0 &&
    addr.col < grid.bayCount &&
    addr.band >= 0 &&
    addr.band < grid.bandCount
  )
}
