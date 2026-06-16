import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ConceptDeliverable } from './components/ConceptDeliverable'
import { assembleConcept } from './model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './model/brief'
import { CARDS, cardsByCategory, CATEGORY_ORDER } from './model/cards'
import { findBannedWords } from './model/copy'
import { PARTIS } from './model/partis'
import { determineTier } from './model/routing'
import type { BriefAnswers, CardDef, Selections } from './model/types'
import { useConceptStore } from './store/useConceptStore'

// ── helpers ──────────────────────────────────────────────────────────────────

// Find the archetype card registered for a given parti (via params.partiId).
function archetypeCardForParti(partiId: string): CardDef | undefined {
  return CARDS.find((c) => c.category === 'archetype' && String(c.params.partiId) === partiId)
}

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

// ── §3a registry-driven suite ─────────────────────────────────────────────────
// Every parti in PARTIS is automatically covered. Adding a new parti to the
// registry subjects it to all four checks below without any bespoke test code.

for (const [partiId] of Object.entries(PARTIS)) {
  const archetypeCard = archetypeCardForParti(partiId)
  if (!archetypeCard) continue // skip partis not yet backed by a card

  // Minimal selection: only the archetype chosen; every other category falls
  // back to the assembler's first-available default.
  const baseSelections: Selections = { archetype: archetypeCard.id }

  describe(`[${partiId}] every offered card swap assembles without violating an invariant`, () => {
    it('passes for all briefs', () => {
      for (const brief of BRIEFS) {
        for (const category of CATEGORY_ORDER) {
          for (const card of cardsByCategory(category)) {
            const ctx = { brief, selections: baseSelections }
            if (card.availableWhen && !card.availableWhen(ctx)) continue
            const selections: Selections = { ...baseSelections, [category]: card.id }
            // assembleConcept calls validate() — throws on any invariant breach
            expect(() => assembleConcept(brief, selections)).not.toThrow()
          }
        }
      }
    })
  })

  describe(`[${partiId}] renders a complete deliverable: stair on spine, courtyard open`, () => {
    it('Plan and Section agree', () => {
      const brief: BriefAnswers = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
      const concept = assembleConcept(brief, baseSelections)

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
    })
  })

  // §3b zero-card guard ───────────────────────────────────────────────────────
  describe(`[${partiId}] every category offers ≥1 valid card for every reachable brief`, () => {
    it('zero-card guard', () => {
      for (const brief of BRIEFS) {
        for (const category of CATEGORY_ORDER.filter((c) => c !== 'archetype')) {
          const ctx = { brief, selections: baseSelections }
          const available = cardsByCategory(category).filter(
            (c) => !c.availableWhen || c.availableWhen(ctx),
          )
          expect(
            available.length,
            `${partiId} / ${category}: zero available cards for brief "${brief.householdName || 'default'}"`,
          ).toBeGreaterThan(0)
        }
      }
    })
  })

  describe(`[${partiId}] no banned words in any customer-facing copy`, () => {
    it('copy sweep', () => {
      const brief: BriefAnswers = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
      const concept = assembleConcept(brief, baseSelections)
      const { reason } = determineTier(concept, brief)
      expect(
        findBannedWords([concept.title, concept.direction, ...concept.layoutLogic, ...concept.tradeoffs, reason]),
      ).toEqual([])
    })
  })
}

// ── §3c archetype-switch ──────────────────────────────────────────────────────

describe('Gate 0 §3c: archetype switch re-assembles to a valid, complete board', () => {
  beforeEach(() => {
    useConceptStore.setState({
      brief: DEFAULT_BRIEF,
      selections: deriveInitialSelections(DEFAULT_BRIEF),
      openCategory: CATEGORY_ORDER[0],
    })
  })

  it('clears all fills and produces a valid concept from the new parti defaults', () => {
    const { switchArchetype } = useConceptStore.getState()
    switchArchetype('archetype-gate0-stub')

    const state = useConceptStore.getState()

    // All fills are cleared — only the new archetype card id remains
    expect(state.selections).toEqual({ archetype: 'archetype-gate0-stub' })

    // openCategory advances to the next step (site)
    expect(state.openCategory).toBe(CATEGORY_ORDER[1])

    // The assembler re-derives every other category from defaults — no hole
    expect(() => assembleConcept(state.brief, state.selections)).not.toThrow()
  })
})

// ── family-courtyard: additional selection combos ─────────────────────────────

describe('family-courtyard: specific selection combos render a complete deliverable', () => {
  const brief: BriefAnswers = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
  const base = deriveInitialSelections(brief)

  const combos: Record<string, Selections> = {
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
    it(`renders: ${label}`, () => {
      const concept = assembleConcept(brief, selections)
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

      expect(
        findBannedWords([concept.title, concept.direction, ...concept.layoutLogic, ...concept.tradeoffs]),
      ).toEqual([])
    })
  }
})
