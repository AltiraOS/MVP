import { SiteCaptureForm } from '../../components/SiteCaptureForm'
import { PlanView } from '../../render/PlanView'
import { useConceptStore } from '../../store/useConceptStore'

export default function DimensionedPlanPage() {
  const projectRoom = useConceptStore((s) => s.projectRoom)
  const captureSite = useConceptStore((s) => s.captureSite)
  if (!projectRoom) return null

  if (!projectRoom.resolved) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Dimensioned plan</h1>
        <p className="mt-2 text-ink-soft">
          Every dimensioned plan starts from your real site, not the representative block this concept
          was first shown on. Capture it below to continue.
        </p>
        <div className="mt-8">
          <SiteCaptureForm initial={projectRoom.site} onSubmit={captureSite} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Dimensioned plan</h1>
      <p className="mt-2 text-ink-soft">Your concept, re-solved onto your real site.</p>

      {projectRoom.resolved.tradeoffs.length > 0 && (
        <div className="mt-6 rounded-xl border border-line bg-panel p-4 text-sm text-ink-soft">
          <h2 className="text-sm font-medium text-ink">Trade-offs</h2>
          <ul className="mt-2 space-y-2">
            {projectRoom.resolved.tradeoffs.map((tradeoff) => (
              <li key={tradeoff}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-panel p-4">
        <PlanView concept={projectRoom.resolved} className="w-full" dimensioned />
      </div>
    </div>
  )
}
