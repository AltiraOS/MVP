import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// DECISION: phase 1 only needs a minimal persisted shape to prove the
// localStorage round-trip works end to end. The brief/selection model
// (§5) is formalised in phase 2 and will replace this shape.
export interface AppState {
  briefAnswers: Record<string, string | number | boolean>
  setBriefAnswer: (key: string, value: string | number | boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      briefAnswers: {},
      setBriefAnswer: (key, value) =>
        set((state) => ({
          briefAnswers: { ...state.briefAnswers, [key]: value },
        })),
    }),
    { name: 'altira-concept-store' },
  ),
)
