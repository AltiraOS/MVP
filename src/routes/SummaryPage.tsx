import { ConceptDeliverable } from '../components/ConceptDeliverable'
import { useConcept } from '../store/useConceptStore'

export default function SummaryPage() {
  const concept = useConcept()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your concept</h1>
      <p className="mt-2 text-ink-soft">
        Here's where your choices have landed — the plan, the section, and the thinking behind them.
      </p>
      <div className="mt-8">
        <ConceptDeliverable concept={concept} />
      </div>
    </div>
  )
}
