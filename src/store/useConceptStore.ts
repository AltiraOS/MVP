import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BriefAnswers, CardCategory, Concept, Selections } from '../model/types'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { CATEGORY_ORDER } from '../model/cards'
import type { ProjectRoom, SiteCapture } from '../model/project'
import { resolveOnSite } from '../model/project'

export type AppMode = 'journey' | 'project'

export interface ConceptState {
  brief: BriefAnswers
  selections: Selections
  openCategory: CardCategory
  mode: AppMode
  projectRoom?: ProjectRoom
  setBriefAnswer: <K extends keyof BriefAnswers>(key: K, value: BriefAnswers[K]) => void
  ensureSelections: () => void
  setSelection: (category: CardCategory, cardId: string) => void
  setOpenCategory: (category: CardCategory) => void
  advanceCategory: () => void
  switchArchetype: (cardId: string) => void
  activate: () => void
  captureSite: (site: SiteCapture) => void
}

export const useConceptStore = create<ConceptState>()(
  persist(
    (set, get) => ({
      brief: DEFAULT_BRIEF,
      selections: {},
      openCategory: CATEGORY_ORDER[0],
      mode: 'journey',
      projectRoom: undefined,

      setBriefAnswer: (key, value) =>
        set((state) => ({ brief: { ...state.brief, [key]: value } })),

      // Fills in a starting selection per category from the current brief,
      // if nothing has been chosen yet. Safe to call repeatedly.
      ensureSelections: () => {
        const { selections, brief } = get()
        if (Object.keys(selections).length === 0) {
          set({ selections: deriveInitialSelections(brief) })
        }
      },

      setSelection: (category, cardId) =>
        set((state) => ({ selections: { ...state.selections, [category]: cardId } })),

      setOpenCategory: (category) => set({ openCategory: category }),

      advanceCategory: () => {
        const { openCategory } = get()
        const next = CATEGORY_ORDER[CATEGORY_ORDER.indexOf(openCategory) + 1]
        if (next) set({ openCategory: next })
      },

      // DECISION: switching archetype clears all card fills and advances to
      // the 'site' category. The assembler re-derives every other category
      // from defaults on the next render (brief §8 pre-fill philosophy).
      // Carrying over fills would risk invalid geometry: different partis
      // have different grid sizes and slot-to-cell mappings.
      switchArchetype: (cardId) =>
        set({ selections: { archetype: cardId }, openCategory: CATEGORY_ORDER[1] }),

      // The app changes mode: the activated concept is frozen as the
      // Project Room's baseline. Re-activating re-freezes from the current
      // selections but keeps any site already captured (brief §12 gate 1).
      activate: () => {
        const { brief, selections, projectRoom } = get()
        const activeSelections =
          Object.keys(selections).length > 0 ? selections : deriveInitialSelections(brief)
        const baseline = assembleConcept(brief, activeSelections)
        const site = projectRoom?.site
        const resolved = site ? resolveOnSite(baseline, site) : undefined
        set({
          mode: 'project',
          projectRoom: { baseline, site, resolved, revisions: [] },
        })
      },

      // Real site in -> bay grid re-resolves in metres -> the same renderers
      // fire (brief §3). Never throws; mismatches surface as trade-off copy
      // already folded into the resolved concept by resolveOnSite.
      captureSite: (site) => {
        const { projectRoom } = get()
        if (!projectRoom) return
        const resolved = resolveOnSite(projectRoom.baseline, site)
        set({ projectRoom: { ...projectRoom, site, resolved } })
      },
    }),
    { name: 'altira-concept-store' },
  ),
)

// The selections actually in play: whatever's been chosen so far, falling
// back to the brief-derived starting point before the first save.
export function useActiveSelections(): Selections {
  const brief = useConceptStore((s) => s.brief)
  const selections = useConceptStore((s) => s.selections)
  return Object.keys(selections).length > 0 ? selections : deriveInitialSelections(brief)
}

// The single source of truth for "what does the customer's home look like
// right now" — every page that shows the board derives it from here.
export function useConcept(): Concept {
  const brief = useConceptStore((s) => s.brief)
  const selections = useActiveSelections()
  return assembleConcept(brief, selections)
}
