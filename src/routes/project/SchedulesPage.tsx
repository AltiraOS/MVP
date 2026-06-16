import { SiteCaptureForm } from '../../components/SiteCaptureForm'
import { deriveSchedules } from '../../model/schedules'
import { useConceptStore } from '../../store/useConceptStore'

export default function SchedulesPage() {
  const projectRoom = useConceptStore((s) => s.projectRoom)
  const captureSite = useConceptStore((s) => s.captureSite)
  if (!projectRoom) return null

  if (!projectRoom.resolved) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
        <p className="mt-2 text-ink-soft">
          Room and area schedules are worked out from your real site, not the representative block this
          concept was first shown on. Capture it below to continue.
        </p>
        <div className="mt-8">
          <SiteCaptureForm initial={projectRoom.site} onSubmit={captureSite} />
        </div>
      </div>
    )
  }

  const schedules = deriveSchedules(projectRoom.resolved)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
      <p className="mt-2 text-ink-soft">
        Areas shown are indicative, worked out from the concept's geometry, not a measured survey.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Area schedule</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-line bg-panel p-4">
            <dt className="text-ink-soft">Built area (indicative)</dt>
            <dd className="mt-1 text-xl font-semibold">{schedules.areas.builtM2.toFixed(1)} m²</dd>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <dt className="text-ink-soft">Open space (indicative)</dt>
            <dd className="mt-1 text-xl font-semibold">{schedules.areas.openSpaceM2.toFixed(1)} m²</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Room schedule</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-ink-soft">
              <th className="py-1 pr-4 font-medium">Level</th>
              <th className="py-1 pr-4 font-medium">Room</th>
              <th className="py-1 font-medium">Area (indicative)</th>
            </tr>
          </thead>
          <tbody>
            {schedules.rooms.map((row, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1 pr-4">{row.level}</td>
                <td className="py-1 pr-4">{row.label}</td>
                <td className="py-1">{row.areaM2.toFixed(1)} m²</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Courtyard &amp; outdoor-room schedule</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-ink-soft">
              <th className="py-1 pr-4 font-medium">Level</th>
              <th className="py-1 pr-4 font-medium">Outdoor room</th>
              <th className="py-1 font-medium">Area (indicative)</th>
            </tr>
          </thead>
          <tbody>
            {schedules.outdoor.map((row, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1 pr-4">{row.level}</td>
                <td className="py-1 pr-4">{row.label}</td>
                <td className="py-1">{row.areaM2.toFixed(1)} m²</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 rounded-xl border border-line bg-panel p-4 text-sm">
        <h2 className="text-sm font-medium">Assumptions &amp; unresolved questions</h2>
        <ul className="mt-2 space-y-2 text-ink-soft">
          {schedules.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
