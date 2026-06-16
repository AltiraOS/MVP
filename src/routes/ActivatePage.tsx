import { useNavigate } from 'react-router-dom'
import { TIER_LABELS } from '../model/copy'
import { determineTier } from '../model/routing'
import { useConcept, useConceptStore } from '../store/useConceptStore'

export default function ActivatePage() {
  const brief = useConceptStore((s) => s.brief)
  const activate = useConceptStore((s) => s.activate)
  const concept = useConcept()
  const { tier } = determineTier(concept, brief)
  const navigate = useNavigate()

  function handleActivate() {
    activate()
    navigate('/project/concept')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Ready when you are</h1>
      <p className="mt-2 text-ink-soft">
        Activating {concept.title} — your {TIER_LABELS[tier]} concept — opens the Project Room, where it's
        re-solved onto your real site and developed further.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleActivate}
          className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-white"
        >
          Activate this concept
        </button>
        <a
          href="mailto:hello@altira.com.au"
          className="inline-block rounded-full border border-line px-6 py-3 font-medium text-ink"
        >
          Talk to Altira
        </a>
      </div>
    </div>
  )
}
