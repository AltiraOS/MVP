import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { sectionHeightsM } from './geometry'
import { SectionView } from './SectionView'

const brief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }

describe('SectionView', () => {
  it('renders an accessible section through the concept', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)

    const svg = screen.getByRole('img', { name: /section through/i })
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })

  it('shows the floor-to-floor slab at the level above ground', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)

    const svg = screen.getByRole('img', { name: /section through/i })
    const { slabZs, roofTopM } = sectionHeightsM(concept)
    expect(slabZs.length).toBeGreaterThan(0)

    const slabLines = Array.from(svg.querySelectorAll('line[stroke-width="0.03"]')).filter(
      (line) => !line.getAttribute('stroke-dasharray'),
    )
    expect(slabLines.length).toBeGreaterThan(0)
    for (const line of slabLines) {
      expect(Number(line.getAttribute('y1'))).toBeCloseTo(roofTopM - slabZs[0], 5)
    }
  })

  it('shows the courtyard as open air through the full height', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)

    const openToSky = document.querySelector('[aria-label="Open to sky"]')
    expect(openToSky).not.toBeNull()
    expect(openToSky?.getAttribute('stroke-dasharray')).not.toBeNull()
  })

  it('draws the stair rising from the ground floor to the floor above', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)

    const stairGroup = document.querySelector('[aria-label="Stair"]')
    expect(stairGroup).not.toBeNull()

    const polyline = stairGroup?.querySelector('polyline')
    const points = polyline?.getAttribute('points')?.trim().split(/\s+/) ?? []
    expect(points.length).toBeGreaterThan(2)

    const ys = points.map((p) => Number(p.split(',')[1]))
    const { roofTopM, slabZs } = sectionHeightsM(concept)
    expect(Math.max(...ys)).toBeCloseTo(roofTopM, 5) // ground level
    expect(Math.min(...ys)).toBeCloseTo(roofTopM - slabZs[0], 5) // floor above
  })

  it('shows a ground line, height scale and depth scale', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)

    expect(document.querySelector('[aria-label="Ground line"]')).not.toBeNull()
    expect(document.querySelector('[aria-label^="Height scale"]')).not.toBeNull()
    expect(document.querySelector('[aria-label^="Scale:"]')).not.toBeNull()
  })
})
