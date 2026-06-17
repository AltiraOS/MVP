import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './brief'
import { findBannedWords } from './copy'
import { resolveOnSite } from './project'
import type { SiteCapture } from './project'
import { validate } from './validate'

const brief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
const baseline = assembleConcept(brief, deriveInitialSelections(brief))

describe('resolveOnSite', () => {
  it('is pure: same inputs produce the same output', () => {
    const site: SiteCapture = {
      frontageM: 14,
      depthM: 28,
      orientationDeg: 15,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    const a = resolveOnSite(baseline, site)
    const b = resolveOnSite(baseline, site)
    expect(a).toEqual(b)
    // The input concept is never mutated.
    expect(baseline.siteM.frontageM).not.toBe(a.siteM.frontageM)
  })

  it('re-resolves the board in metres against the real site', () => {
    const site: SiteCapture = {
      frontageM: 20,
      depthM: 40,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    const resolved = resolveOnSite(baseline, site)
    expect(resolved.siteM.frontageM).toBe(20)
    expect(resolved.siteM.depthM).toBe(40)
    const usableFrontageM = 20 - 2 * 1.5
    expect(resolved.board.colWidthM).toBeCloseTo(usableFrontageM / resolved.board.colCount, 5)
  })

  it('keeps the concept valid (stair on spine, courtyard open) after resolving', () => {
    const site: SiteCapture = {
      frontageM: 18,
      depthM: 32,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    const resolved = resolveOnSite(baseline, site)
    expect(() => validate(resolved)).not.toThrow()
  })

  it('never throws on a real site that barely fits, and surfaces a calm trade-off instead', () => {
    const site: SiteCapture = {
      frontageM: 4,
      depthM: 6,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    let resolved
    expect(() => {
      resolved = resolveOnSite(baseline, site)
    }).not.toThrow()
    expect(resolved!.tradeoffs.length).toBeGreaterThan(baseline.tradeoffs.length)
    expect(() => validate(resolved!)).not.toThrow()
    expect(findBannedWords(resolved!.tradeoffs)).toEqual([])
  })

  it('never throws on a tiny real site even when setbacks exceed it entirely', () => {
    const site: SiteCapture = {
      frontageM: 2,
      depthM: 2,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    expect(() => resolveOnSite(baseline, site)).not.toThrow()
  })

  it('does not flag a trade-off when the real site is roomier than the representative block', () => {
    const site: SiteCapture = {
      frontageM: 25,
      depthM: 45,
      orientationDeg: 0,
      setbacks: { front: 4.5, rear: 3, side: 1.5 },
      cornerLot: false,
    }
    const resolved = resolveOnSite(baseline, site)
    expect(resolved.tradeoffs).toEqual(baseline.tradeoffs)
  })
})
