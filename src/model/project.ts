import type { CardPlacement, Concept, Level, SiteM } from './types'
import { cellRectM, deriveBoard } from './grid'
import { PARTIS } from './partis'

// The Activated Project Room: the same Concept the customer shaped, now
// re-solved onto their real site and developed further. baseline is frozen
// at activation — nothing here ever hand-edits a Concept; every entry is the
// output of a pure derivation or the one assembler (brief §4, §5).
export interface SiteCapture {
  frontageM: number
  depthM: number
  orientationDeg: number
  setbacks: { front: number; rear: number; side: number }
  cornerLot: boolean
  surveyRef?: string
  notes?: string
}

export interface ProjectRoom {
  baseline: Concept
  site?: SiteCapture
  resolved?: Concept
  revisions: Concept[]
}

// A real site narrower or shallower than this feels noticeably tighter than
// the representative lot the concept was first shown on.
const MIN_COMFORTABLE_FRONTAGE_M = 2.4
const MIN_COMFORTABLE_DEPTH_M = 1.8
const MIN_USABLE_M = 0.5

// Re-materializes a placement's metre rectangle against a new board, keeping
// every other fact (which card placed it, its fill, its address) unchanged.
// This is the same single conversion step (col, band) -> metres that the
// assembler itself uses (grid.ts's cellRectM) — never a second, divergent
// geometry calculation.
function remapPlacement(p: CardPlacement, board: ReturnType<typeof deriveBoard>): CardPlacement {
  const rect = cellRectM(board, { col: p.colStart, band: p.bandStart })
  return { ...p, xM: rect.x, yM: rect.y, widthM: rect.w, depthM: rect.h }
}

// resolveOnSite(concept, site) -> Concept. Pure: re-derives the 1m board in
// metres against the real site, via the same deriveBoard the assembler
// already uses, then re-materializes every placement's geometry onto it.
// Every other model fact (levels, placements, spine, stair, courtyard,
// palette) is the customer's shaping decision, not a site fact, so it
// carries over unchanged. Never throws — a real site that doesn't
// comfortably fit the chosen concept surfaces as calm trade-off copy, not
// an error (brief §3).
export function resolveOnSite(concept: Concept, site: SiteCapture): Concept {
  const parti = PARTIS[concept.archetypeId]
  if (!parti) return concept

  const siteM: SiteM = {
    frontageM: site.frontageM,
    depthM: site.depthM,
    northDeg: site.orientationDeg,
    setbacks: site.setbacks,
    cornerLot: site.cornerLot,
  }

  const usableFrontageM = siteM.frontageM - 2 * siteM.setbacks.side
  const usableDepthM = siteM.depthM - siteM.setbacks.front - siteM.setbacks.rear

  // Guard against a site whose setbacks leave no usable footprint at all —
  // deriveBoard would otherwise divide into a zero or negative width.
  // Clamp instead of throwing, and let the trade-off copy carry the news.
  const safeSiteM: SiteM = {
    ...siteM,
    frontageM:
      usableFrontageM > MIN_USABLE_M ? siteM.frontageM : 2 * siteM.setbacks.side + MIN_USABLE_M,
    depthM: usableDepthM > MIN_USABLE_M ? siteM.depthM : siteM.setbacks.front + siteM.setbacks.rear + MIN_USABLE_M,
  }

  const board = deriveBoard(safeSiteM, parti)
  const tradeoffs: string[] = []

  if (usableFrontageM <= MIN_USABLE_M || usableDepthM <= MIN_USABLE_M) {
    tradeoffs.push(
      'Your site leaves very little room to build once setbacks are taken out, so this concept needs a closer look with a designer before it can sit comfortably on the real block.',
    )
  } else if (board.colWidthM < MIN_COMFORTABLE_FRONTAGE_M) {
    tradeoffs.push(
      'Your real site is narrower than the representative block this concept was first shown on, so rooms across the frontage will feel tighter than first shown.',
    )
  }

  if (usableDepthM > MIN_USABLE_M && board.bandDepthsM.some((d) => d < MIN_COMFORTABLE_DEPTH_M)) {
    tradeoffs.push(
      'Your real site is shallower than the representative block this concept was first shown on, so rooms front-to-back will feel more compact than first shown.',
    )
  }

  const levels: Level[] = concept.levels.map((level) => ({
    ...level,
    placements: level.placements.map((p) => remapPlacement(p, board)),
  }))

  const spineColWidthM = board.colWidthM
  const spine = { xM: board.originM.x + parti.spineCol * spineColWidthM, widthM: spineColWidthM }
  const stair = remapPlacement(concept.stair, board)
  const courtyard = concept.courtyard?.map((c) => remapPlacement(c, board))

  return {
    ...concept,
    siteM: safeSiteM,
    board,
    levels,
    spine,
    stair,
    courtyard,
    tradeoffs: [...concept.tradeoffs, ...tradeoffs],
  }
}
