import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { useConceptStore } from '../store/useConceptStore'
import ShapePage from './ShapePage'

beforeEach(() => {
  useConceptStore.setState({
    brief: DEFAULT_BRIEF,
    selections: {},
    openCategory: 'archetype',
  })
})

function mainBoard() {
  return screen.getAllByRole('img', { name: /floor plan/i })[0]
}

describe('ShapePage', () => {
  it('pre-fills the board with a complete starting concept', () => {
    render(<ShapePage />)
    expect(mainBoard().tagName.toLowerCase()).toBe('svg')
  })

  it('swapping a card visibly and correctly updates the board', async () => {
    const user = userEvent.setup()
    render(<ShapePage />)

    // Move to the courtyard category and choose the deeper courtyard.
    await user.click(screen.getByRole('button', { name: /^courtyard$/i }))
    await user.click(screen.getByRole('button', { name: /courtyard, full depth/i }))

    expect(useConceptStore.getState().selections.courtyard).toBe('courtyard-deep')

    // The deep courtyard adds a second open cell — the board re-assembles
    // and validates without throwing, and shows one courtyard label per
    // open cell.
    expect(within(mainBoard()).getAllByText('Courtyard')).toHaveLength(2)
  })

  it('moves to the next category once a choice is made', async () => {
    const user = userEvent.setup()
    render(<ShapePage />)

    await user.click(screen.getByRole('button', { name: /family courtyard home/i }))

    expect(useConceptStore.getState().openCategory).toBe('site')
  })

  it('shows the board as a section in the stair category, where the stair reads', () => {
    useConceptStore.setState({
      brief: DEFAULT_BRIEF,
      selections: deriveInitialSelections(DEFAULT_BRIEF),
      openCategory: 'spine-stair',
    })
    render(<ShapePage />)

    const sections = screen.getAllByRole('img', { name: /section through/i })
    expect(sections.length).toBeGreaterThan(1) // main board section + card thumbnails
    for (const section of sections.slice(1)) {
      expect(section.querySelector('[aria-label="Stair"]')).not.toBeNull()
    }
  })
})
