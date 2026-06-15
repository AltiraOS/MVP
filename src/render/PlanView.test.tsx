import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
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

    // The stair sits on the spine column.
    expect(concept.stair.col).toBe(concept.spine.col)
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
    const cellCount = Object.keys(ground.assignments).length
    const texts = document.querySelectorAll('svg text[dominant-baseline="middle"]')
    expect(texts.length).toBe(cellCount)

    for (const text of Array.from(texts)) {
      const fontSize = Number(text.getAttribute('font-size'))
      expect(fontSize).toBeGreaterThan(0)
      expect(fontSize).toBeLessThanOrEqual(0.34)
    }
  })
})
