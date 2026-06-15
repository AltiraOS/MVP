import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './brief'
import { determineTier } from './routing'

const brief = { ...DEFAULT_BRIEF, householdName: 'Test House' }

describe('determineTier', () => {
  it('defaults to Core for a standard two-storey home', () => {
    const selections = deriveInitialSelections(brief)
    const concept = assembleConcept(brief, { ...selections, 'indoor-living': 'living-open' })
    const result = determineTier(concept, brief)
    expect(result.tier).toBe('core')
    expect(result.reason.length).toBeGreaterThan(0)
  })

  it('promotes to Pro when a work space is built in, with a plain-language reason', () => {
    const selections = deriveInitialSelections(brief)
    const concept = assembleConcept(brief, { ...selections, 'indoor-living': 'living-work' })
    const result = determineTier(concept, brief)
    expect(result.tier).toBe('pro')
    expect(result.reason).toMatch(/work space/)
  })
})
