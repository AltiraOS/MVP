import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { assembleConcept } from './model/assemble'
import { DEFAULT_BRIEF } from './model/brief'
import { findBannedWords } from './model/copy'
import { CARDS } from './model/cards'
import { PARTIS } from './model/partis'
import { resolveOnSite } from './model/project'
import type { SiteCapture } from './model/project'
import { deriveSchedules } from './model/schedules'
import type { CardDef, Selections } from './model/types'
import { validate } from './model/validate'
import { PlanView } from './render/PlanView'
import { SectionView } from './render/SectionView'

// Extends the registry-driven suite (see done.test.tsx) to the resolved
// concept: every parti, re-solved onto a real site, still holds every
// invariant and still renders a dimensioned plan and section that agree.

function archetypeCardForParti(partiId: string): CardDef | undefined {
  return CARDS.find((c) => c.category === 'archetype' && String(c.params.partiId) === partiId)
}

const brief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }

// A real site distinct from every representative "site" card's dimensions,
// so these tests genuinely exercise re-resolution rather than a no-op.
const REAL_SITE: SiteCapture = {
  frontageM: 17,
  depthM: 34,
  orientationDeg: 12,
  setbacks: { front: 4.5, rear: 3, side: 1.5 },
  cornerLot: false,
}

const TIGHT_SITE: SiteCapture = {
  frontageM: 8,
  depthM: 16,
  orientationDeg: 0,
  setbacks: { front: 4.5, rear: 3, side: 1.5 },
  cornerLot: false,
}

for (const [partiId] of Object.entries(PARTIS)) {
  const archetypeCard = archetypeCardForParti(partiId)
  if (!archetypeCard) continue

  const selections: Selections = { archetype: archetypeCard.id }

  describe(`[${partiId}] resolved concept`, () => {
    it('re-solves onto a real site and still holds every invariant', () => {
      const baseline = assembleConcept(brief, selections)
      const resolved = resolveOnSite(baseline, REAL_SITE)

      expect(() => validate(resolved)).not.toThrow()
      expect(resolved.stair.xM).toBeGreaterThanOrEqual(resolved.spine.xM)
      expect(resolved.stair.xM).toBeLessThan(resolved.spine.xM + resolved.spine.widthM)
      expect(findBannedWords(resolved.tradeoffs)).toEqual([])
    })

    it('never throws on a tight real site, and surfaces calm trade-offs instead', () => {
      const baseline = assembleConcept(brief, selections)
      const resolved = resolveOnSite(baseline, TIGHT_SITE)

      expect(() => validate(resolved)).not.toThrow()
      expect(findBannedWords(resolved.tradeoffs)).toEqual([])
    })

    it('renders a dimensioned plan and section that agree: stair on spine, courtyard open', () => {
      const baseline = assembleConcept(brief, selections)
      const resolved = resolveOnSite(baseline, REAL_SITE)

      render(
        <>
          <PlanView concept={resolved} dimensioned />
          <SectionView concept={resolved} dimensioned />
        </>,
      )

      const plan = screen.getByRole('img', { name: /floor plan/i })
      const section = screen.getByRole('img', { name: /section through/i })

      expect(within(plan).getByLabelText('Stair')).toBeInTheDocument()
      expect(section.querySelector('[aria-label="Stair"]')).not.toBeNull()
      expect(plan.querySelector('[aria-label="Dimensions"]')).not.toBeNull()
      expect(section.querySelector('[aria-label="Dimensions"]')).not.toBeNull()

      if (resolved.courtyard?.length) {
        expect(within(plan).getAllByText('Courtyard').length).toBeGreaterThan(0)
        expect(section.querySelector('[aria-label="Open to sky"]')).not.toBeNull()
      }
    })

    it('derives schedules that match the model, with areas labelled indicative', () => {
      const baseline = assembleConcept(brief, selections)
      const resolved = resolveOnSite(baseline, REAL_SITE)
      const schedules = deriveSchedules(resolved)

      const totalPlacements = resolved.levels.reduce(
        (sum, level) => sum + level.placements.filter((p) => p.fill).length,
        0,
      )
      expect(schedules.rooms.length + schedules.outdoor.length).toBe(totalPlacements)
      expect(schedules.assumptions.length).toBeGreaterThan(0)
      expect(findBannedWords(schedules.assumptions)).toEqual([])

      if (resolved.courtyard?.length) {
        expect(schedules.outdoor.some((r) => r.kind === 'open')).toBe(true)
      }
    })
  })
}
