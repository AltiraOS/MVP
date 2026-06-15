import type { BayGrid, CellAddr, Concept } from '../model/types'
import { bandOffsetM, cellKey } from '../model/grid'

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

// --- section geometry ---
// The section's horizontal axis runs front-to-back (the plan's depth).
export function sectionWidthM(grid: BayGrid): number {
  return gridBoundsM(grid).h
}

// Internal floor/ceiling slab heights (above the ground level) and the
// height of the roof datum, all derived from the levels' own elevations.
export interface SectionHeightsM {
  slabZs: number[]
  roofTopM: number
}

export function sectionHeightsM(concept: Concept): SectionHeightsM {
  const { levels } = concept
  const slabZs = levels.slice(1).map((l) => l.baseElevationM)
  const last = levels[levels.length - 1]
  return { slabZs, roofTopM: last.baseElevationM + last.floorToFloorM }
}

// True when a cell is an open void on every level — a courtyard cut
// straight through the building, floor to roof.
export function isFullyVoidCell(concept: Concept, addr: CellAddr): boolean {
  return concept.levels.every((level) => level.assignments[cellKey(addr)]?.kind === 'open')
}

export interface SectionSegmentM {
  addr: CellAddr
  x: number
  w: number
}

// DECISION: the brief asks for a section "along the spine column through
// the courtyard", but the spine and courtyard sit in different columns. A
// single straight cut can't show both, so this is a stepped cut along the
// spine column, jogging to the courtyard's column for the band(s) where the
// courtyard sits (so the void reads as open) and back to the spine where the
// stair sits (so the stair always reads as connecting the levels). When a
// single band holds both, it's split into two narrower segments so neither
// is lost.
export function sectionSegmentsM(concept: Concept): SectionSegmentM[] {
  const { grid, spine, stair, courtyard } = concept
  const courtyardBands = new Set((courtyard ?? []).map((c) => c.band))
  const courtyardCol = courtyard?.[0]?.col
  const segments: SectionSegmentM[] = []

  for (let band = 0; band < grid.bandCount; band++) {
    const x = bandOffsetM(grid, band)
    const w = grid.bandDepthsM[band]
    const hasCourtyard = courtyardCol !== undefined && courtyardBands.has(band)
    const hasStair = stair.band === band

    if (hasCourtyard && hasStair && courtyardCol !== spine.col) {
      segments.push({ addr: { col: courtyardCol, band }, x, w: w / 2 })
      segments.push({ addr: { col: spine.col, band }, x: x + w / 2, w: w / 2 })
    } else if (hasCourtyard) {
      segments.push({ addr: { col: courtyardCol as number, band }, x, w })
    } else {
      segments.push({ addr: { col: spine.col, band }, x, w })
    }
  }

  return segments
}
