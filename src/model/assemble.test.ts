import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './brief'
import { cellKey } from './grid'
import type { BriefAnswers } from './types'

const sampleBrief: BriefAnswers = {
  ...DEFAULT_BRIEF,
  householdName: 'The Hill Street House',
  who: 'a family of four',
}

describe('assembleConcept', () => {
  it('produces a valid concept from the default selections', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const concept = assembleConcept(sampleBrief, selections)

    expect(concept.archetypeId).toBe('family-courtyard')
    expect(concept.levels.map((l) => l.id)).toEqual(['ground', 'upper'])
    expect(concept.title).toBe('The Hill Street House')
    expect(concept.tier).toBe('core')
  })

  it('is deterministic: same inputs produce byte-identical output', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const a = assembleConcept(sampleBrief, selections)
    const b = assembleConcept(sampleBrief, selections)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('derives the bay grid in metres from the chosen site', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const standard = assembleConcept(sampleBrief, { ...selections, site: 'site-standard' })
    const narrow = assembleConcept(sampleBrief, { ...selections, site: 'site-narrow' })

    // standard: (15 - 2*1.5) / 4 = 3
    expect(standard.grid.bayWidthM).toBeCloseTo(3, 5)
    // narrow: (10 - 2*0.9) / 4 = 2.05
    expect(narrow.grid.bayWidthM).toBeCloseTo(2.05, 5)
    expect(standard.grid.bayWidthM).not.toBe(narrow.grid.bayWidthM)
  })

  it('cuts the courtyard as a void through every level it spans', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const concept = assembleConcept(sampleBrief, { ...selections, courtyard: 'courtyard-deep' })

    expect(concept.courtyard).toHaveLength(2)
    for (const cell of concept.courtyard ?? []) {
      for (const level of concept.levels) {
        expect(level.voids.some((v) => v.col === cell.col && v.band === cell.band)).toBe(true)
        expect(level.assignments[cellKey(cell)]).toEqual({ kind: 'open', label: 'Courtyard' })
      }
    }
  })

  it('keeps the stair on the spine for either spine-stair card', () => {
    const selections = deriveInitialSelections(sampleBrief)

    const central = assembleConcept(sampleBrief, { ...selections, 'spine-stair': 'stair-central' })
    expect(central.stair).toEqual({ col: central.spine.col, band: 1 })

    const rear = assembleConcept(sampleBrief, { ...selections, 'spine-stair': 'stair-rear' })
    expect(rear.stair).toEqual({ col: rear.spine.col, band: 2 })
  })

  it('routes to Pro when the home includes a work space', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const withOffice = assembleConcept(sampleBrief, { ...selections, 'indoor-living': 'living-work' })
    expect(withOffice.tier).toBe('pro')

    const withoutOffice = assembleConcept(sampleBrief, { ...selections, 'indoor-living': 'living-open' })
    expect(withoutOffice.tier).toBe('core')
  })

  it('falls back to the suggested option when a card is unavailable for the site', () => {
    const selections = deriveInitialSelections(sampleBrief)
    const concept = assembleConcept(sampleBrief, {
      ...selections,
      site: 'site-narrow',
      'outdoor-rooms': 'outdoor-rooms-deck',
    })

    // outdoor-rooms-deck is unavailable on a narrow lot, so it falls back
    // to outdoor-rooms-none and leaves (3,1) as the indoor living card set it.
    expect(concept.levels[0].assignments['3:1']).toEqual({ kind: 'living', label: 'Family Room' })
    expect(concept.warnings.length).toBeGreaterThan(0)
  })
})
