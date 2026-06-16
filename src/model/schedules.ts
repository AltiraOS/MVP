import type { Concept, FormKind, LevelId } from './types'

export interface RoomScheduleRow {
  level: LevelId
  label: string
  kind: FormKind
  areaM2: number
}

export interface AreaSummary {
  builtM2: number
  openSpaceM2: number
  byKind: Partial<Record<FormKind, number>> // indicative
}

export interface Schedules {
  rooms: RoomScheduleRow[]
  areas: AreaSummary
  outdoor: RoomScheduleRow[] // courtyard + outdoor rooms
  assumptions: string[] // Grade-8; what the model does NOT resolve
}

// deriveSchedules(concept) -> Schedules. Pure: a query over the existing
// cell occupancy in metres (brief §2, §6) — never a new measurement, never
// a structural or compliance judgement. Areas are indicative.
export function deriveSchedules(concept: Concept): Schedules {
  const { grid, levels } = concept
  const rooms: RoomScheduleRow[] = []
  const outdoor: RoomScheduleRow[] = []
  const byKind: Partial<Record<FormKind, number>> = {}
  let builtM2 = 0
  let openSpaceM2 = 0

  for (const level of levels) {
    for (const [key, fill] of Object.entries(level.assignments)) {
      const band = Number(key.split(':')[1])
      const areaM2 = grid.bayWidthM * grid.bandDepthsM[band]
      const row: RoomScheduleRow = { level: level.id, label: fill.label, kind: fill.kind, areaM2 }

      byKind[fill.kind] = (byKind[fill.kind] ?? 0) + areaM2

      if (fill.kind === 'open') {
        openSpaceM2 += areaM2
        outdoor.push(row)
      } else if (fill.kind === 'outdoor-room') {
        builtM2 += areaM2
        outdoor.push(row)
      } else {
        builtM2 += areaM2
        rooms.push(row)
      }
    }
  }

  return {
    rooms,
    areas: { builtM2, openSpaceM2, byKind },
    outdoor,
    assumptions: deriveAssumptions(concept),
  }
}

function deriveAssumptions(concept: Concept): string[] {
  const assumptions = [
    "Areas shown are indicative, worked out from the concept's geometry — not a measured survey.",
    'Structural spans and sizing are not part of this package; an engineer will confirm these.',
    'Services such as plumbing, electrical and air conditioning runs are not shown here and need a specialist design.',
    'The setbacks shown reflect what you told us about your site, not a planning compliance check.',
    'Buildability, cost and approvals pathways sit with your builder, planner and cost consultant.',
  ]

  if (concept.tradeoffs.length > 0) {
    assumptions.push(
      'Some choices on this concept come with trade-offs — see the notes alongside the plan and section.',
    )
  }

  return assumptions
}
