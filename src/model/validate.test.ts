import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './brief'
import { validate } from './validate'
import type { Concept } from './types'

const brief = { ...DEFAULT_BRIEF, householdName: 'Test House' }

function validConcept(): Concept {
  const selections = deriveInitialSelections(brief)
  return assembleConcept(brief, selections)
}

function clone(concept: Concept): Concept {
  return JSON.parse(JSON.stringify(concept)) as Concept
}

describe('validate', () => {
  it('passes for a freshly assembled concept', () => {
    expect(() => validate(validConcept())).not.toThrow()
  })

  it('rejects a stair that is off the spine', () => {
    const concept = clone(validConcept())
    concept.stair = { ...concept.stair, xM: concept.spine.xM + concept.spine.widthM + 1 }
    expect(() => validate(concept)).toThrow(/spine/)
  })

  it('rejects a courtyard cell missing from a level\'s placements', () => {
    const concept = clone(validConcept())
    const courtyardCell = concept.courtyard?.[0]
    if (!courtyardCell) throw new Error('expected a courtyard cell')
    concept.levels[1].placements = concept.levels[1].placements.filter(
      (p) => !(p.colStart === courtyardCell.colStart && p.bandStart === courtyardCell.bandStart),
    )
    expect(() => validate(concept)).toThrow(/open void/)
  })

  it('rejects a placement outside the board', () => {
    const concept = clone(validConcept())
    concept.levels[0].placements.push({
      cardId: 'test',
      level: 'ground',
      xM: 0,
      yM: 0,
      widthM: 1,
      depthM: 1,
      colStart: 99,
      colSpan: 1,
      bandStart: 99,
      bandSpan: 1,
      fill: { kind: 'living', label: 'Living' },
    })
    expect(() => validate(concept)).toThrow(/outside the/)
  })

  it('rejects a void cell whose fill is not "open"', () => {
    const concept = clone(validConcept())
    const courtyardCell = concept.courtyard?.[0]
    if (!courtyardCell) throw new Error('expected a courtyard cell')
    const placement = concept.levels[0].placements.find(
      (p) => p.colStart === courtyardCell.colStart && p.bandStart === courtyardCell.bandStart,
    )
    if (!placement) throw new Error('expected a courtyard placement')
    placement.fill = { kind: 'living', label: 'Living' }
    expect(() => validate(concept)).toThrow(/must be an open void/)
  })

  it('rejects an incomplete board', () => {
    const concept = clone(validConcept())
    concept.levels[0].placements = concept.levels[0].placements.filter(
      (p) => !(p.colStart === 1 && p.bandStart === 0),
    )
    expect(() => validate(concept)).toThrow(/unfilled/)
  })

  it('rejects Pro tier without 3+ levels or a work\\/retail cell', () => {
    const concept = clone(validConcept())
    concept.tier = 'pro'
    expect(() => validate(concept)).toThrow(/Pro tier requires/)
  })
})
