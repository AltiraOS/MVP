import { ConceptDeliverable } from '../../components/ConceptDeliverable'
import { TIER_LABELS } from '../../model/copy'
import { determineTier } from '../../model/routing'
import { useConceptStore } from '../../store/useConceptStore'

export default function ProjectConceptPage() {
  const brief = useConceptStore((s) => s.brief)
  const projectRoom = useConceptStore((s) => s.projectRoom)
  if (!projectRoom) return null

  const { baseline } = projectRoom
  const { tier, reason } = determineTier(baseline, brief)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your activated concept</h1>
      <p className="mt-2 text-ink-soft">
        This is the concept you shaped, now the starting point for a more resolved {TIER_LABELS[tier]} design
        package. It stays as you left it here — the next tabs build on it without changing it.
      </p>

      <div className="mt-4 rounded-xl border border-line bg-panel p-4">
        <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
          {TIER_LABELS[tier]}
        </span>
        <p className="mt-3 text-ink">{reason}</p>
      </div>

      <div className="mt-8">
        <ConceptDeliverable concept={baseline} />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-panel p-4 text-sm text-ink-soft">
        <h2 className="text-sm font-medium text-ink">What this stage delivers</h2>
        <p className="mt-2">
          From here, the Project Room re-solves this concept onto your real site and develops it into a
          dimensioned plan and section, room and area schedules, and a clean handoff package for the
          specialists who take it further.
        </p>
      </div>
    </div>
  )
}
