import { assembleConcept } from '../model/assemble'
import { DEFAULT_BRIEF, deriveInitialSelections } from '../model/brief'
import { PlanView } from '../render/PlanView'

export default function ShapePage() {
  const selections = deriveInitialSelections(DEFAULT_BRIEF)
  const concept = assembleConcept(DEFAULT_BRIEF, selections)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Shape your concept</h1>
      <p className="mt-2 text-ink-soft">
        Your board is already a complete starting point. Swap any choice and watch it update.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-panel p-4">
        <PlanView concept={concept} className="w-full" />
      </div>
    </div>
  )
}
