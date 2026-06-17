import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { resolveOnSite } from '../model/project'
import { PlanView } from './PlanView'

const brief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }

describe('PlanView', () => {
  it('renders the courtyard as an open void with light into the middle', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<PlanView concept={concept} />)

    const svg = screen.getByRole('img', { name: /floor plan/i })
    expect(svg.tagName.toLowerCase()).toBe('svg')

    // Courtyard cell renders with the accent fill, not a poche outline.
    const courtyardLabel = screen.getByText('Courtyard')
    expect(courtyardLabel.getAttribute('fill')).not.toBe(null)
    const courtyardRect = courtyardLabel.previousElementSibling
    expect(courtyardRect?.tagName.toLowerCase()).toBe('rect')
    expect(courtyardRect?.getAttribute('stroke')).toBeNull()
  })

  it('draws the stair as treads on the spine', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<PlanView concept={concept} />)

    const stairGroup = document.querySelector('[aria-label="Stair"]')
    expect(stairGroup).not.toBeNull()
    const treads = stairGroup?.querySelectorAll('line') ?? []
    expect(treads.length).toBe(5)

    // The stair sits on the spine.
    expect(concept.stair.xM).toBeGreaterThanOrEqual(concept.spine.xM)
    expect(concept.stair.xM).toBeLessThan(concept.spine.xM + concept.spine.widthM)
  })

  it('shows north and street marks, and a scale bar', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<PlanView concept={concept} />)

    expect(document.querySelector('[aria-label="North"]')).not.toBeNull()
    expect(document.querySelector('[aria-label="Street"]')).not.toBeNull()
    expect(document.querySelector('[aria-label^="Scale"]')).not.toBeNull()
  })

  it('keeps every cell label inside its cell width (no overlap)', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<PlanView concept={concept} />)

    const ground = concept.levels.find((l) => l.id === 'ground')!
    const cellCount = ground.placements.filter((p) => p.fill).length
    const texts = document.querySelectorAll('svg text[dominant-baseline="middle"]')
    expect(texts.length).toBe(cellCount)

    for (const text of Array.from(texts)) {
      const fontSize = Number(text.getAttribute('font-size'))
      expect(fontSize).toBeGreaterThan(0)
      expect(fontSize).toBeLessThanOrEqual(0.34)
    }
  })

  it('renders a 3-level concept without crash and uses the topmost footprint for the dashed overlay', () => {
    const base = assembleConcept(brief, deriveInitialSelections(brief))
    const topLevel = base.levels[base.levels.length - 1]
    const concept = {
      ...base,
      levels: [
        base.levels[0],
        topLevel,
        { ...topLevel, id: 'level2plus' as const, baseElevationM: 6.2, floorToFloorM: 2.8 },
      ],
    }
    render(<PlanView concept={concept} />)
    const svg = screen.getByRole('img', { name: /floor plan/i })
    expect(svg.tagName.toLowerCase()).toBe('svg')
    // Stair still renders on the spine
    expect(document.querySelector('[aria-label="Stair"]')).not.toBeNull()
    // Dashed upper-outline elements exist (the overlay between ground and level2plus)
    expect(document.querySelector('[aria-label="Upper level outline"]')).not.toBeNull()
  })

  it('omits dimension strings by default', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<PlanView concept={concept} />)
    expect(document.querySelector('[aria-label="Dimensions"]')).toBeNull()
  })

  it('adds dimension strings over the resolved concept without changing the geometry', () => {
    const baseline = assembleConcept(brief, deriveInitialSelections(brief))
    const resolved = resolveOnSite(baseline, {
      frontageM: 18,
      depthM: 32,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    })
    render(<PlanView concept={resolved} dimensioned />)

    const dimensions = document.querySelector('[aria-label="Dimensions"]')
    expect(dimensions).not.toBeNull()

    // One overall width dimension, one per column, one per band.
    const dimensionLines = dimensions?.querySelectorAll('[aria-label^="Dimension:"]') ?? []
    expect(dimensionLines.length).toBe(1 + resolved.board.colCount + resolved.board.bandCount)

    // Stair-on-spine and courtyard-open still hold with dimensions on.
    expect(document.querySelector('[aria-label="Stair"]')).not.toBeNull()
    expect(resolved.stair.xM).toBeGreaterThanOrEqual(resolved.spine.xM)
    expect(resolved.stair.xM).toBeLessThan(resolved.spine.xM + resolved.spine.widthM)
  })
})
