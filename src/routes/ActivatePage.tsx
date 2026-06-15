import { TIER_LABELS } from '../model/copy'
import { determineTier } from '../model/routing'
import { useConcept, useConceptStore } from '../store/useConceptStore'

export default function ActivatePage() {
  const brief = useConceptStore((s) => s.brief)
  const concept = useConcept()
  const { tier } = determineTier(concept, brief)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Ready when you are</h1>
      <p className="mt-2 text-ink-soft">
        Send {concept.title} — your {TIER_LABELS[tier]} concept — to the Altira team, and we'll take it from
        here.
      </p>
      <a
        href="mailto:hello@altira.com.au"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-medium text-white"
      >
        Talk to Altira
      </a>
    </div>
  )
}
