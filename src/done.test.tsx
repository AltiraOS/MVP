import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConceptDeliverable } from './components/ConceptDeliverable'
import { assembleConcept } from './model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './model/brief'
import { cardsByCategory, CATEGORY_ORDER } from './model/cards'
import { findBannedWords } from './model/copy'
import type { BriefAnswers, Selections } from './model/types'

const BRIEFS: BriefAnswers[] = [
  { ...DEFAULT_BRIEF, householdName: 'Sample House' },
  {
    ...DEFAULT_BRIEF,
    householdName: 'Sample House',
    priorities: ['A home office', 'A private outdoor space'],
    uses: 'multiple',
    publicFrontage: true,
    levels: 3,
  },
]

// brief §12: every card the customer could swap to, from any starting
// brief, must assemble into a valid, complete concept -- assembleConcept
// calls validate() internally, which throws on any invariant violation.
describe('definition of done: the board stays valid and complete', () => {
  it('every offered card swap assembles without violating an invariant', () => {
    for (const brief of BRIEFS) {
      const base = deriveInitialSelections(brief)
      for (const category of CATEGORY_ORDER) {
        for (const card of cardsByCategory(category)) {
          const ctx = { brief, selections: base }
          if (card.availableWhen && !card.availableWhen(ctx)) continue

          const selections: Selections = { ...base, [category]: card.id }
          expect(() => assembleConcept(brief, selections)).not.toThrow()
        }
      }
    }
  })
})

describe('definition of done: a sample journey ends in a complete on-screen concept', () => {
  const brief: BriefAnswers = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
  const base = deriveInitialSelections(brief)

  const combos: Record<string, Selections> = {
    'pre-filled starting concept': base,
    'deep courtyard with the stair toward the back': {
      ...base,
      courtyard: 'courtyard-deep',
      'spine-stair': 'stair-rear',
    },
    'home office and a studio with a balcony': {
      ...base,
      'indoor-living': 'living-work',
      'upper-terrace': 'upper-terrace-studio',
    },
  }

  for (const [label, selections] of Object.entries(combos)) {
    it(`renders a complete deliverable for: ${label}`, () => {
      const concept = assembleConcept(brief, selections)

      // Plan and Section agree: both are pure functions of the same
      // concept, so the stair sits on the spine in both, and the
      // courtyard -- if present -- reads as open in both.
      expect(concept.stair.col).toBe(concept.spine.col)

      render(<ConceptDeliverable concept={concept} />)

      const plan = screen.getByRole('img', { name: /floor plan/i })
      const section = screen.getByRole('img', { name: /section through/i })

      expect(within(plan).getByLabelText('Stair')).toBeInTheDocument()
      expect(section.querySelector('[aria-label="Stair"]')).not.toBeNull()

      if (concept.courtyard?.length) {
        expect(within(plan).getAllByText('Courtyard').length).toBeGreaterThan(0)
        expect(section.querySelector('[aria-label="Open to sky"]')).not.toBeNull()
      }

      // No internal terms leak into the write-up the customer sees.
      const reason = concept.tradeoffs.join(' ')
      expect(
        findBannedWords([concept.title, concept.direction, ...concept.layoutLogic, reason]),
      ).toEqual([])
    })
  }
})
