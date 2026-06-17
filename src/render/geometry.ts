import type { Board, CellAddr, Concept } from '../model/types'

export interface RectM {
  x: number
  y: number
  w: number
  h: number
}

// The bounding rectangle of the whole built board (all cells).
export function boardBoundsM(board: Board): RectM {
  return {
    x: board.originM.x,
    y: board.originM.y,
    w: board.colWidthM * board.colCount,
    h: board.bandDepthsM.reduce((sum, d) => sum + d, 0),
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
export function sectionWidthM(board: Board): number {
  return boardBoundsM(board).h
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
  return concept.levels.every((level) =>
    level.placements.some(
      (p) => p.colStart === addr.col && p.bandStart === addr.band && p.fill?.kind === 'open',
    ),
  )
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
//
// The spine's column index isn't stored on Concept (Spine is xM/widthM
// only), but the stair is always placed on the spine (validate() asserts
// this), so stair.colStart doubles as the spine's column for this cut.
export function sectionSegmentsM(concept: Concept): SectionSegmentM[] {
  const { board, stair, courtyard } = concept
  const spineCol = stair.colStart
  const courtyardBands = new Set((courtyard ?? []).map((c) => c.bandStart))
  const courtyardCol = courtyard?.[0]?.colStart
  const segments: SectionSegmentM[] = []

  let offset = 0
  for (let band = 0; band < board.bandCount; band++) {
    const x = offset
    const w = board.bandDepthsM[band]
    offset += w
    const hasCourtyard = courtyardCol !== undefined && courtyardBands.has(band)
    const hasStair = stair.bandStart === band

    if (hasCourtyard && hasStair && courtyardCol !== spineCol) {
      segments.push({ addr: { col: courtyardCol, band }, x, w: w / 2 })
      segments.push({ addr: { col: spineCol, band }, x: x + w / 2, w: w / 2 })
    } else if (hasCourtyard) {
      segments.push({ addr: { col: courtyardCol as number, band }, x, w })
    } else {
      segments.push({ addr: { col: spineCol, band }, x, w })
    }
  }

  return segments
}
