export interface ProjectRoomTab {
  path: string
  label: string
  number: number
}

// The Project Room's 7 tabs (brief §7). Activation switches the app's nav
// from the 5-step journey to this set.
export const PROJECT_ROOM_TABS: ProjectRoomTab[] = [
  { path: '/project/concept', label: 'Concept', number: 1 },
  { path: '/project/dimensioned-plan', label: 'Dimensioned Plan', number: 2 },
  { path: '/project/section', label: 'Section', number: 3 },
  { path: '/project/schedules', label: 'Schedules', number: 4 },
  { path: '/project/refinements', label: 'Refinements', number: 5 },
  { path: '/project/handoff', label: 'Handoff', number: 6 },
  { path: '/project/packs', label: 'Packs', number: 7 },
]
