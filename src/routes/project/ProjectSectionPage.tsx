import { SiteCaptureForm } from '../../components/SiteCaptureForm'
import { SectionView } from '../../render/SectionView'
import { useConceptStore } from '../../store/useConceptStore'

export default function ProjectSectionPage() {
  const projectRoom = useConceptStore((s) => s.projectRoom)
  const captureSite = useConceptStore((s) => s.captureSite)
  if (!projectRoom) return null

  if (!projectRoom.resolved) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Section</h1>
        <p className="mt-2 text-ink-soft">
          Every dimensioned section starts from your real site, not the representative block this
          concept was first shown on. Capture it below to continue.
        </p>
        <div className="mt-8">
          <SiteCaptureForm initial={projectRoom.site} onSubmit={captureSite} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Section</h1>
      <p className="mt-2 text-ink-soft">Your concept's section, re-solved onto your real site.</p>

      <div className="mt-6 rounded-xl border border-line bg-panel p-4">
        <SectionView concept={projectRoom.resolved} className="w-full" />
      </div>
    </div>
  )
}
