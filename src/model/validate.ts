import type { Concept } from './types'
import { cellKey, sameCell } from './grid'
import { PARTIS } from './partis'

// Asserts every invariant from brief §5. Throws on the first violation —
// a thrown error here means assembly produced an invalid concept, which is
// a bug in the assembler or a card, never something the customer can hit.
export function validate(concept: Concept): void {
  assertStairOnSpine(concept)
  assertCourtyardVoids(concept)
  assertCellsWithinGrid(concept)
  assertVoidConsistency(concept)
  assertComplete(concept)
  assertTierInvariant(concept)
}

function assertStairOnSpine(concept: Concept): void {
  if (concept.stair.col !== concept.spine.col) {
    throw new Error(
      `Invariant violated: stair (col ${concept.stair.col}) must sit on the spine (col ${concept.spine.col}).`,
    )
  }
}

// Courtyard cells must be 'open' and listed as voids on every level — they
// are a cut through the building, not a filled room.
function assertCourtyardVoids(concept: Concept): void {
  for (const cell of concept.courtyard ?? []) {
    for (const level of concept.levels) {
      const fill = level.assignments[cellKey(cell)]
      const inVoids = level.voids.some((v) => sameCell(v, cell))
      if (!inVoids || !fill || fill.kind !== 'open') {
        throw new Error(
          `Invariant violated: courtyard cell ${cellKey(cell)} must be an open void on level "${level.id}".`,
        )
      }
    }
  }
}

function assertCellsWithinGrid(concept: Concept): void {
  const { bayCount, bandCount } = concept.grid
  const inBounds = (col: number, band: number) =>
    col >= 0 && col < bayCount && band >= 0 && band < bandCount

  for (const level of concept.levels) {
    for (const key of Object.keys(level.assignments)) {
      const [col, band] = key.split(':').map(Number)
      if (!inBounds(col, band)) {
        throw new Error(
          `Invariant violated: cell ${key} on level "${level.id}" is outside the ${bayCount}x${bandCount} grid.`,
        )
      }
    }
    for (const v of level.voids) {
      if (!inBounds(v.col, v.band)) {
        throw new Error(
          `Invariant violated: void ${cellKey(v)} on level "${level.id}" is outside the ${bayCount}x${bandCount} grid.`,
        )
      }
    }
  }
}

// A cell holds at most one fill per level (guaranteed by the assignments
// map itself); here we check the 'open'/voids bookkeeping stays consistent.
function assertVoidConsistency(concept: Concept): void {
  for (const level of concept.levels) {
    for (const [key, fill] of Object.entries(level.assignments)) {
      const isVoid = level.voids.some((v) => cellKey(v) === key)
      if (fill.kind === 'open' && !isVoid) {
        throw new Error(
          `Invariant violated: cell ${key} on level "${level.id}" is marked open but missing from voids.`,
        )
      }
      if (isVoid && fill.kind !== 'open') {
        throw new Error(
          `Invariant violated: void cell ${key} on level "${level.id}" must have kind "open".`,
        )
      }
    }
    for (const v of level.voids) {
      if (!level.assignments[cellKey(v)]) {
        throw new Error(
          `Invariant violated: void cell ${cellKey(v)} on level "${level.id}" has no "open" assignment.`,
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
    if (!ground.assignments[cellKey(fixed.addr)]) {
      throw new Error(`Invariant violated: ground cell ${cellKey(fixed.addr)} is unfilled.`)
    }
  }
  for (const slot of parti.slots) {
    for (const target of slot.targets) {
      if (!ground.assignments[cellKey(target)]) {
        throw new Error(
          `Invariant violated: ground cell ${cellKey(target)} (${slot.category}) is unfilled.`,
        )
      }
    }
  }

  for (const levelDef of parti.levels) {
    const level = concept.levels.find((l) => l.id === levelDef.id)
    if (!level) throw new Error(`Invariant violated: concept is missing level "${levelDef.id}".`)

    for (const fixed of levelDef.fixed) {
      if (!level.assignments[cellKey(fixed.addr)]) {
        throw new Error(
          `Invariant violated: ${levelDef.id} cell ${cellKey(fixed.addr)} is unfilled.`,
        )
      }
    }
    for (const slot of levelDef.slots) {
      for (const target of slot.targets) {
        if (!level.assignments[cellKey(target)]) {
          throw new Error(
            `Invariant violated: ${levelDef.id} cell ${cellKey(target)} (${slot.category}) is unfilled.`,
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
    Object.values(level.assignments).some((f) => f.kind === 'work' || f.kind === 'retail'),
  )
  if (!hasExtraLevels && !hasWorkOrRetail) {
    throw new Error(
      'Invariant violated: Pro tier requires 3+ levels or a work/retail cell to exist.',
    )
  }
}
