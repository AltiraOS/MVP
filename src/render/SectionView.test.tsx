import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { resolveOnSite } from '../model/project'
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

  it('renders a 3-level concept: stair reaches the topmost slab, all slabs drawn', () => {
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
    render(<SectionView concept={concept} />)

    const svg = screen.getByRole('img', { name: /section through/i })
    expect(svg.tagName.toLowerCase()).toBe('svg')

    // Stair is still present
    expect(document.querySelector('[aria-label="Stair"]')).not.toBeNull()

    // With 3 levels the stair should rise to the last slab (6.2m), not just slabZs[0]
    const { slabZs, roofTopM } = sectionHeightsM(concept)
    expect(slabZs.length).toBe(2)
    const stairPolyline = document.querySelector('[aria-label="Stair"] polyline')
    const points = stairPolyline?.getAttribute('points')?.trim().split(/\s+/) ?? []
    const ys = points.map((p) => Number(p.split(',')[1]))
    // Highest point of stair (lowest y in SVG) should be at the second slab, not the first
    expect(Math.min(...ys)).toBeCloseTo(roofTopM - slabZs[1], 5)
  })

  it('omits dimension strings by default', () => {
    const concept = assembleConcept(brief, deriveInitialSelections(brief))
    render(<SectionView concept={concept} />)
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
    render(<SectionView concept={resolved} dimensioned />)

    const dimensions = document.querySelector('[aria-label="Dimensions"]')
    expect(dimensions).not.toBeNull()

    // One overall height, one per level, one overall depth.
    const dimensionLines = dimensions?.querySelectorAll('[aria-label^="Dimension:"]') ?? []
    expect(dimensionLines.length).toBe(2 + resolved.levels.length)

    // The courtyard still reads as open with dimensions on.
    expect(document.querySelector('[aria-label="Open to sky"]')).not.toBeNull()
  })
})
