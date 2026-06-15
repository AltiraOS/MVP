import { TIER_LABELS } from '../model/copy'
import { determineTier } from '../model/routing'
import { useConcept, useConceptStore } from '../store/useConceptStore'

export default function PricingPage() {
  const brief = useConceptStore((s) => s.brief)
  const concept = useConcept()
  const { tier, reason } = determineTier(concept, brief)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Core or Pro</h1>
      <p className="mt-2 text-ink-soft">We'll explain which package fits your concept, and why.</p>

      <div className="mt-8 rounded-xl border border-line bg-panel p-6">
        <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
          {TIER_LABELS[tier]}
        </span>
        <p className="mt-3 text-ink">{reason}</p>
      </div>
    </div>
  )
}
