import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from './brief'
import { findBannedWords } from './copy'
import { resolveOnSite } from './project'
import { deriveSchedules } from './schedules'

const brief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
const baseline = assembleConcept(brief, deriveInitialSelections(brief))
const resolved = resolveOnSite(baseline, {
  frontageM: 18,
  depthM: 32,
  orientationDeg: 0,
  setbacks: { front: 4.5, rear: 3, side: 1.5 },
  cornerLot: false,
})

describe('deriveSchedules', () => {
  it('is pure: same concept produces the same schedules', () => {
    expect(deriveSchedules(resolved)).toEqual(deriveSchedules(resolved))
  })

  it('produces one room-schedule row per built cell, matching the model', () => {
    const schedules = deriveSchedules(resolved)
    const ground = resolved.levels.find((l) => l.id === 'ground')!
    const builtGroundCells = Object.values(ground.assignments).filter(
      (f) => f.kind !== 'open' && f.kind !== 'outdoor-room',
    )
    const groundRoomRows = schedules.rooms.filter((r) => r.level === 'ground')
    expect(groundRoomRows.length).toBe(builtGroundCells.length)

    for (const row of schedules.rooms) {
      expect(row.areaM2).toBeGreaterThan(0)
    }
  })

  it('puts every courtyard void and outdoor room into the outdoor schedule', () => {
    const schedules = deriveSchedules(resolved)
    if (resolved.courtyard?.length) {
      expect(schedules.outdoor.some((r) => r.kind === 'open')).toBe(true)
    }
    for (const row of schedules.outdoor) {
      expect(['open', 'outdoor-room']).toContain(row.kind)
    }
  })

  it('sums built and open areas from cell occupancy in metres', () => {
    const schedules = deriveSchedules(resolved)
    const expectedBuilt = schedules.rooms.reduce((sum, r) => sum + r.areaM2, 0)
    const expectedOpen = schedules.outdoor
      .filter((r) => r.kind === 'open')
      .reduce((sum, r) => sum + r.areaM2, 0)
    const expectedOutdoorRoom = schedules.outdoor
      .filter((r) => r.kind === 'outdoor-room')
      .reduce((sum, r) => sum + r.areaM2, 0)

    expect(schedules.areas.builtM2).toBeCloseTo(expectedBuilt + expectedOutdoorRoom, 5)
    expect(schedules.areas.openSpaceM2).toBeCloseTo(expectedOpen, 5)
  })

  it('populates an assumptions list with no banned words', () => {
    const schedules = deriveSchedules(resolved)
    expect(schedules.assumptions.length).toBeGreaterThan(0)
    expect(findBannedWords(schedules.assumptions)).toEqual([])
  })
})
