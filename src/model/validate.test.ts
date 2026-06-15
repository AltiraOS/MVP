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
    concept.stair = { col: concept.spine.col + 1, band: concept.stair.band }
    expect(() => validate(concept)).toThrow(/spine/)
  })

  it('rejects a courtyard cell missing from a level\'s voids', () => {
    const concept = clone(validConcept())
    const courtyardCell = concept.courtyard?.[0]
    if (!courtyardCell) throw new Error('expected a courtyard cell')
    concept.levels[1].voids = concept.levels[1].voids.filter(
      (v) => !(v.col === courtyardCell.col && v.band === courtyardCell.band),
    )
    expect(() => validate(concept)).toThrow(/open void/)
  })

  it('rejects an assignment outside the grid', () => {
    const concept = clone(validConcept())
    concept.levels[0].assignments['99:99'] = { kind: 'living', label: 'Living' }
    expect(() => validate(concept)).toThrow(/outside the/)
  })

  it('rejects a void cell whose assignment is not "open"', () => {
    const concept = clone(validConcept())
    const courtyardCell = concept.courtyard?.[0]
    if (!courtyardCell) throw new Error('expected a courtyard cell')
    const key = `${courtyardCell.col}:${courtyardCell.band}`
    concept.levels[0].assignments[key] = { kind: 'living', label: 'Living' }
    expect(() => validate(concept)).toThrow(/must be an open void/)
  })

  it('rejects an incomplete board', () => {
    const concept = clone(validConcept())
    delete concept.levels[0].assignments['1:0']
    expect(() => validate(concept)).toThrow(/unfilled/)
  })

  it('rejects Pro tier without 3+ levels or a work\\/retail cell', () => {
    const concept = clone(validConcept())
    concept.tier = 'pro'
    expect(() => validate(concept)).toThrow(/Pro tier requires/)
  })
})
