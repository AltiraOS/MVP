import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BriefAnswers, CardCategory, Concept, Selections } from '../model/types'
import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { CATEGORY_ORDER } from '../model/cards'

export interface ConceptState {
  brief: BriefAnswers
  selections: Selections
  openCategory: CardCategory
  setBriefAnswer: <K extends keyof BriefAnswers>(key: K, value: BriefAnswers[K]) => void
  ensureSelections: () => void
  setSelection: (category: CardCategory, cardId: string) => void
  setOpenCategory: (category: CardCategory) => void
  advanceCategory: () => void
}

export const useConceptStore = create<ConceptState>()(
  persist(
    (set, get) => ({
      brief: DEFAULT_BRIEF,
      selections: {},
      openCategory: CATEGORY_ORDER[0],

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
