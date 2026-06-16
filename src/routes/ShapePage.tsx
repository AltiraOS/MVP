import { useEffect } from 'react'
import { CategoryPanel } from '../components/CategoryPanel'
import { ProgressTrail } from '../components/ProgressTrail'
import { PlanView } from '../render/PlanView'
import { SectionView } from '../render/SectionView'
import { useActiveSelections, useConcept, useConceptStore } from '../store/useConceptStore'

export default function ShapePage() {
  const brief = useConceptStore((s) => s.brief)
  const openCategory = useConceptStore((s) => s.openCategory)
  const ensureSelections = useConceptStore((s) => s.ensureSelections)
  const setSelection = useConceptStore((s) => s.setSelection)
  const setOpenCategory = useConceptStore((s) => s.setOpenCategory)
  const advanceCategory = useConceptStore((s) => s.advanceCategory)
  const switchArchetype = useConceptStore((s) => s.switchArchetype)

  useEffect(() => {
    ensureSelections()
  }, [ensureSelections])

  // Before the first-run selections are persisted, fall back to a derived
  // starting point so the board is never blank.
  const activeSelections = useActiveSelections()
  const concept = useConcept()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Shape your concept</h1>
      <p className="mt-2 text-ink-soft">
        Your board is already a complete starting point. Swap any choice and watch it update.
      </p>

      <div className="mt-8 rounded-xl border border-line bg-panel p-4">
        <PlanView concept={concept} className="w-full" />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-panel p-4">
        <SectionView concept={concept} className="w-full max-h-48" />
      </div>

      <div className="mt-8">
        <ProgressTrail
          selections={activeSelections}
          openCategory={openCategory}
          onSelectCategory={setOpenCategory}
        />
      </div>

      <div className="mt-6">
        <CategoryPanel
          brief={brief}
          selections={activeSelections}
          category={openCategory}
          onSelectCard={(cardId) => {
            if (openCategory === 'archetype') {
              // DECISION: archetype changes clear all fills — see switchArchetype
              switchArchetype(cardId)
            } else {
              setSelection(openCategory, cardId)
              advanceCategory()
            }
          }}
        />
      </div>
    </div>
  )
}
