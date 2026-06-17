import type { CardPlacement, Concept, Level } from './types'
import { PARTIS } from './partis'

// Asserts every invariant from brief §5. Throws on the first violation —
// a thrown error here means assembly produced an invalid concept, which is
// a bug in the assembler or a card, never something the customer can hit.
export function validate(concept: Concept): void {
  assertStairOnSpine(concept)
  assertCourtyardVoids(concept)
  assertPlacementsWithinBoard(concept)
  assertNoOverlaps(concept)
  assertVoidConsistency(concept)
  assertComplete(concept)
  assertTierInvariant(concept)
}

function placementAt(level: Level, col: number, band: number): CardPlacement | undefined {
  return level.placements.find((p) => p.colStart === col && p.bandStart === band)
}

function assertStairOnSpine(concept: Concept): void {
  const { stair, spine } = concept
  if (stair.xM < spine.xM || stair.xM >= spine.xM + spine.widthM) {
    throw new Error(
      `Invariant violated: stair (xM ${stair.xM}) must sit on the spine (xM ${spine.xM}..${spine.xM + spine.widthM}).`,
    )
  }
}

// Courtyard placements must be 'open' voids, present on every level they
// span — a cut through the building, not a filled room.
function assertCourtyardVoids(concept: Concept): void {
  for (const court of concept.courtyard ?? []) {
    for (const level of concept.levels) {
      const placement = placementAt(level, court.colStart, court.bandStart)
      if (!placement || !placement.void || placement.fill?.kind !== 'open') {
        throw new Error(
          `Invariant violated: courtyard cell ${court.colStart}:${court.bandStart} must be an open void on level "${level.id}".`,
        )
      }
    }
  }
}

function assertPlacementsWithinBoard(concept: Concept): void {
  const { colCount, bandCount } = concept.board
  const inBounds = (col: number, band: number) => col >= 0 && col < colCount && band >= 0 && band < bandCount

  for (const level of concept.levels) {
    for (const p of level.placements) {
      if (!inBounds(p.colStart, p.bandStart)) {
        throw new Error(
          `Invariant violated: cell ${p.colStart}:${p.bandStart} on level "${level.id}" is outside the ${colCount}x${bandCount} board.`,
        )
      }
    }
  }
}

// No two placements on the same level may occupy the same cell.
function assertNoOverlaps(concept: Concept): void {
  for (const level of concept.levels) {
    const seen = new Set<string>()
    for (const p of level.placements) {
      const key = `${p.colStart}:${p.bandStart}`
      if (seen.has(key)) {
        throw new Error(`Invariant violated: cell ${key} on level "${level.id}" has more than one placement.`)
      }
      seen.add(key)
    }
  }
}

// A placement marked open must be void, and vice versa.
function assertVoidConsistency(concept: Concept): void {
  for (const level of concept.levels) {
    for (const p of level.placements) {
      if (p.fill?.kind === 'open' && !p.void) {
        throw new Error(
          `Invariant violated: cell ${p.colStart}:${p.bandStart} on level "${level.id}" is marked open but is not a void.`,
        )
      }
      if (p.void && p.fill?.kind !== 'open') {
        throw new Error(
          `Invariant violated: void cell ${p.colStart}:${p.bandStart} on level "${level.id}" must have kind "open".`,
        )
      }
    }
  }
}

// The board is always complete: every cell the parti defines (fixed cells
// and category slot targets) must be filled — by a card, a void, or the
// parti default.
function assertComplete(concept: Concept): void {
  const parti = PARTIS[concept.archetypeId]
  if (!parti) {
    throw new Error(`Invariant violated: unknown archetype "${concept.archetypeId}".`)
  }

  const ground = concept.levels.find((l) => l.id === 'ground')
  if (!ground) throw new Error('Invariant violated: concept has no ground level.')

  for (const fixed of parti.fixed) {
    if (!placementAt(ground, fixed.addr.col, fixed.addr.band)) {
      throw new Error(`Invariant violated: ground cell ${fixed.addr.col}:${fixed.addr.band} is unfilled.`)
    }
  }
  for (const slot of parti.slots) {
    for (const target of slot.targets) {
      if (!placementAt(ground, target.col, target.band)) {
        throw new Error(
          `Invariant violated: ground cell ${target.col}:${target.band} (${slot.category}) is unfilled.`,
        )
      }
    }
  }

  for (const levelDef of parti.levels) {
    const level = concept.levels.find((l) => l.id === levelDef.id)
    if (!level) throw new Error(`Invariant violated: concept is missing level "${levelDef.id}".`)

    for (const fixed of levelDef.fixed) {
      if (!placementAt(level, fixed.addr.col, fixed.addr.band)) {
        throw new Error(
          `Invariant violated: ${levelDef.id} cell ${fixed.addr.col}:${fixed.addr.band} is unfilled.`,
        )
      }
    }
    for (const slot of levelDef.slots) {
      for (const target of slot.targets) {
        if (!placementAt(level, target.col, target.band)) {
          throw new Error(
            `Invariant violated: ${levelDef.id} cell ${target.col}:${target.band} (${slot.category}) is unfilled.`,
          )
        }
      }
    }
  }
}

function assertTierInvariant(concept: Concept): void {
  if (concept.tier !== 'pro') return
  const hasExtraLevels = concept.levels.length >= 3
  const hasWorkOrRetail = concept.levels.some((level) =>
    level.placements.some((p) => p.fill?.kind === 'work' || p.fill?.kind === 'retail'),
  )
  if (!hasExtraLevels && !hasWorkOrRetail) {
    throw new Error(
      'Invariant violated: Pro tier requires 3+ levels or a work/retail cell to exist.',
    )
  }
}
